#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

const API_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const SERVER_ID = process.env.POSTMARK_SERVER_ID;
const BASE_URL = 'https://api.postmarkapp.com';
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const BACKUP_DIR = path.join(__dirname, 'backup');

if (!API_TOKEN || !SERVER_ID) {
  console.error('Errore: POSTMARK_SERVER_TOKEN o POSTMARK_SERVER_ID non impostati in .env');
  process.exit(1);
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-Postmark-Server-Token': API_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

function safeFileName(name) {
  return name.replace(/[\\/]/g, '_');
}

async function ensureTemplatesDir() {
  try {
    await fs.mkdir(TEMPLATES_DIR, { recursive: true });
  } catch (e) {}
}

async function downloadTemplatesAndLayouts(singleName) {
  await ensureTemplatesDir();
  if (singleName) {
    // Scarica solo un template specifico
    // Trova l'ID del template dal nome
    const templatesRes = await axiosInstance.get(`/templates?count=500&offset=0`);
    const tpl = templatesRes.data.Templates.find(t => t.Name === singleName);
    if (!tpl) {
      console.error(`Template con nome '${singleName}' non trovato.`);
      return;
    }
    const tplDetail = await axiosInstance.get(`/templates/${tpl.TemplateId}`);
    const baseName = `template-${safeFileName(tpl.Name)}`;
    const filePath = path.join(TEMPLATES_DIR, `${baseName}.json`);
    await fs.writeFile(filePath, JSON.stringify(tplDetail.data, null, 2));
    if (tplDetail.data.HtmlBody) {
      const htmlPath = path.join(TEMPLATES_DIR, `${baseName}.html`);
      await fs.writeFile(htmlPath, tplDetail.data.HtmlBody);
    }
    if (tplDetail.data.TextBody) {
      const txtPath = path.join(TEMPLATES_DIR, `${baseName}.txt`);
      await fs.writeFile(txtPath, tplDetail.data.TextBody);
    }
    console.log(`Scaricato template: ${tpl.Name}`);
    return;
  }
  // Scarica tutti i template
  const templatesRes = await axiosInstance.get(`/templates?count=500&offset=0`);
  for (const tpl of templatesRes.data.Templates) {
    const tplDetail = await axiosInstance.get(`/templates/${tpl.TemplateId}`);
    const baseName = `template-${safeFileName(tpl.Name)}`;
    const filePath = path.join(TEMPLATES_DIR, `${baseName}.json`);
    await fs.writeFile(filePath, JSON.stringify(tplDetail.data, null, 2));
    if (tplDetail.data.HtmlBody) {
      const htmlPath = path.join(TEMPLATES_DIR, `${baseName}.html`);
      await fs.writeFile(htmlPath, tplDetail.data.HtmlBody);
    }
    if (tplDetail.data.TextBody) {
      const txtPath = path.join(TEMPLATES_DIR, `${baseName}.txt`);
      await fs.writeFile(txtPath, tplDetail.data.TextBody);
    }
    console.log(`Scaricato template: ${tpl.Name}`);
  }
}

async function backupTemplates() {
  await ensureTemplatesDir();
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupSubdir = path.join(BACKUP_DIR, timestamp);
    await fs.mkdir(backupSubdir);
    const files = await fs.readdir(TEMPLATES_DIR);
    for (const file of files) {
      const src = path.join(TEMPLATES_DIR, file);
      const dest = path.join(backupSubdir, file);
      await fs.copyFile(src, dest);
    }
    console.log(`Backup completato in: ${backupSubdir}`);
  } catch (e) {
    console.error('Errore durante il backup:', e);
  }
}

async function uploadTemplatesAndLayouts(singleName) {
  await ensureTemplatesDir();
  await backupTemplates(); // Effettua backup prima dell'upload
  // Upload template
  const templateFiles = await fs.readdir(TEMPLATES_DIR);
  for (const file of templateFiles) {
    if (!file.endsWith('.json')) continue;
    const baseName = file.replace(/\.json$/, '');
    if (singleName && baseName !== singleName) continue;
    const filePath = path.join(TEMPLATES_DIR, file);
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    try {
      const htmlPath = path.join(TEMPLATES_DIR, `${baseName}.html`);
      data.HtmlBody = await fs.readFile(htmlPath, 'utf8');
    } catch {}
    try {
      const txtPath = path.join(TEMPLATES_DIR, `${baseName}.txt`);
      data.TextBody = await fs.readFile(txtPath, 'utf8');
    } catch {}
    if (file.startsWith('template-')) {
      const { TemplateId, Name, Subject, HtmlBody, TextBody, Alias, TemplateType, LayoutTemplate, AssociatedServerId } = data;
      await axiosInstance.put(`/templates/${TemplateId}`, {
        Name, Subject, HtmlBody, TextBody, Alias, TemplateType, LayoutTemplate, AssociatedServerId
      });
      console.log(`Aggiornato template: ${Name}`);
    }
  }
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'download') {
    const singleName = process.argv[3];
    await downloadTemplatesAndLayouts(singleName);
  } else if (cmd === 'upload') {
    const singleName = process.argv[3];
    await uploadTemplatesAndLayouts(singleName);
  } else {
    console.log('Usa: node postmark-tool.js download                   # per scaricare tutti i template');
    console.log('     node postmark-tool.js download NOME_TEMPLATE      # per scaricare solo un template');
    console.log('     node postmark-tool.js upload                      # per caricare tutti');
    console.log('     node postmark-tool.js upload template-NOME        # per caricare solo un template');
  }
}

main(); 