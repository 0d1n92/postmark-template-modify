#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const open = (...args) => import('open').then(mod => mod.default(...args));

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
    const folderName = safeFileName(tpl.Name);
    const templateDir = path.join(TEMPLATES_DIR, folderName);
    await fs.mkdir(templateDir, { recursive: true });
    const jsonPath = path.join(templateDir, 'template.json');
    await fs.writeFile(jsonPath, JSON.stringify(tplDetail.data, null, 2));
    if (tplDetail.data.HtmlBody) {
      const htmlPath = path.join(templateDir, 'template.html');
      await fs.writeFile(htmlPath, tplDetail.data.HtmlBody);
    }
    console.log(`Scaricato template: ${tpl.Name}`);
    return;
  }
  // Scarica tutti i template
  const templatesRes = await axiosInstance.get(`/templates?count=500&offset=0`);
  for (const tpl of templatesRes.data.Templates) {
    const tplDetail = await axiosInstance.get(`/templates/${tpl.TemplateId}`);
    const folderName = safeFileName(tpl.Name);
    const templateDir = path.join(TEMPLATES_DIR, folderName);
    await fs.mkdir(templateDir, { recursive: true });
    const jsonPath = path.join(templateDir, 'template.json');
    await fs.writeFile(jsonPath, JSON.stringify(tplDetail.data, null, 2));
    if (tplDetail.data.HtmlBody) {
      const htmlPath = path.join(templateDir, 'template.html');
      await fs.writeFile(htmlPath, tplDetail.data.HtmlBody);
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
  const templateFolders = await fs.readdir(TEMPLATES_DIR);
  for (const folder of templateFolders) {
    const templateDir = path.join(TEMPLATES_DIR, folder);
    const stat = await fs.stat(templateDir);
    if (!stat.isDirectory()) continue;
    if (singleName && folder !== singleName) continue;
    const jsonPath = path.join(templateDir, 'template.json');
    let data;
    try {
      data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    } catch {
      continue;
    }
    try {
      const htmlPath = path.join(templateDir, 'template.html');
      data.HtmlBody = await fs.readFile(htmlPath, 'utf8');
    } catch {}
    if (data && data.TemplateId && data.Name) {
      const { TemplateId, Name, Subject, HtmlBody, TextBody, Alias, TemplateType, LayoutTemplate, AssociatedServerId } = data;
      await axiosInstance.put(`/templates/${TemplateId}`, {
        Name, Subject, HtmlBody, TextBody, Alias, TemplateType, LayoutTemplate, AssociatedServerId
      });
      console.log(`Aggiornato template: ${Name}`);
    }
  }
}

async function previewTemplate(templateName) {
  if (!templateName) {
    console.error('Devi specificare il nome del template da visualizzare.');
    process.exit(1);
  }
  const templateDir = path.join(TEMPLATES_DIR, templateName);
  const htmlPath = path.join(templateDir, 'template.html');
  let html;
  try {
    html = await fs.readFile(htmlPath, 'utf8');
  } catch {
    console.error(`Impossibile trovare il file: ${htmlPath}`);
    process.exit(1);
  }
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  const PORT = 4321;
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Anteprima disponibile su ${url}`);
    open(url);
  });
}

async function openTemplateOnPostmark(templateName) {
  if (!templateName) {
    console.error('Devi specificare il nome del template da aprire.');
    process.exit(1);
  }
  const templateDir = path.join(TEMPLATES_DIR, templateName);
  const jsonPath = path.join(templateDir, 'template.json');
  let data;
  try {
    data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
  } catch {
    console.error(`Impossibile trovare o leggere il file: ${jsonPath}`);
    process.exit(1);
  }
  const templateId = data.TemplateId;
  if (!templateId) {
    console.error('TemplateId non trovato in template.json');
    process.exit(1);
  }
  if (!SERVER_ID) {
    console.error('POSTMARK_SERVER_ID non impostato nel file .env');
    process.exit(1);
  }
  const url = `https://account.postmarkapp.com/servers/${SERVER_ID}/templates/${templateId}/edit`;
  console.log(`Apro: ${url}`);
  open(url);
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'download') {
    const singleName = process.argv[3];
    await downloadTemplatesAndLayouts(singleName);
  } else if (cmd === 'upload') {
    const singleName = process.argv[3];
    await uploadTemplatesAndLayouts(singleName);
  } else if (cmd === 'preview') {
    const templateName = process.argv[3];
    await previewTemplate(templateName);
  } else if (cmd === 'open') {
    const templateName = process.argv[3];
    await openTemplateOnPostmark(templateName);
  } else {
    console.log('Usa: node postmark-tool.js download                   # per scaricare tutti i template');
    console.log('     node postmark-tool.js download NOME_TEMPLATE      # per scaricare solo un template');
    console.log('     node postmark-tool.js upload                      # per caricare tutti');
    console.log('     node postmark-tool.js upload NOME_TEMPLATE        # per caricare solo un template');
    console.log('     node postmark-tool.js preview NOME_TEMPLATE       # per vedere anteprima HTML di un template');
    console.log('     node postmark-tool.js open NOME_TEMPLATE          # per aprire il template su Postmark nel browser');
  }
}

main(); 