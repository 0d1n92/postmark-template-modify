#!/usr/bin/env node
require('dotenv').config();
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const open = (...args) => import('open').then(mod => mod.default(...args));

const API_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const SERVER_ID = process.env.POSTMARK_SERVER_ID;
const SERVER_NAME = process.env.POSTMARK_SERVER_NAME || 'DT-domnia'; // Nome del server per i backup
const BASE_URL = 'https://api.postmarkapp.com';
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const LAYOUTS_DIR = path.join(__dirname, 'layout');
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

async function ensureLayoutsDir() {
  try {
    await fs.mkdir(LAYOUTS_DIR, { recursive: true });
  } catch (e) {}
}

async function downloadTemplates(singleName) {
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

async function downloadLayouts(singleName) {
  await ensureLayoutsDir();
  // I layout sono template con TemplateType: "Layout"
  const templatesRes = await axiosInstance.get(`/templates?count=500&offset=0`);
  const layouts = templatesRes.data.Templates.filter(t => t.TemplateType === 'Layout');
  
  if (singleName) {
    // Scarica solo un layout specifico
    const layout = layouts.find(l => l.Name === singleName);
    if (!layout) {
      console.error(`Layout con nome '${singleName}' non trovato.`);
      return;
    }
    const layoutDetail = await axiosInstance.get(`/templates/${layout.TemplateId}`);
    const folderName = safeFileName(layout.Name);
    const layoutDir = path.join(LAYOUTS_DIR, folderName);
    await fs.mkdir(layoutDir, { recursive: true });
    const jsonPath = path.join(layoutDir, 'layout.json');
    await fs.writeFile(jsonPath, JSON.stringify(layoutDetail.data, null, 2));
    if (layoutDetail.data.HtmlBody) {
      const htmlPath = path.join(layoutDir, 'layout.html');
      await fs.writeFile(htmlPath, layoutDetail.data.HtmlBody);
    }
    console.log(`Scaricato layout: ${layout.Name}`);
    return;
  }
  
  // Scarica tutti i layout
  for (const layout of layouts) {
    const layoutDetail = await axiosInstance.get(`/templates/${layout.TemplateId}`);
    const folderName = safeFileName(layout.Name);
    const layoutDir = path.join(LAYOUTS_DIR, folderName);
    await fs.mkdir(layoutDir, { recursive: true });
    const jsonPath = path.join(layoutDir, 'layout.json');
    await fs.writeFile(jsonPath, JSON.stringify(layoutDetail.data, null, 2));
    if (layoutDetail.data.HtmlBody) {
      const htmlPath = path.join(layoutDir, 'layout.html');
      await fs.writeFile(htmlPath, layoutDetail.data.HtmlBody);
    }
    console.log(`Scaricato layout: ${layout.Name}`);
  }
}

async function backupTemplates() {
  await ensureTemplatesDir();
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const serverBackupDir = path.join(BACKUP_DIR, SERVER_NAME);
    await fs.mkdir(serverBackupDir, { recursive: true });
    const backupSubdir = path.join(serverBackupDir, timestamp);
    await fs.mkdir(backupSubdir);
    
    // Backup templates
    const templatesBackupDir = path.join(backupSubdir, 'templates');
    await fs.mkdir(templatesBackupDir, { recursive: true });
    const templateFiles = await fs.readdir(TEMPLATES_DIR);
    for (const file of templateFiles) {
      const src = path.join(TEMPLATES_DIR, file);
      const dest = path.join(templatesBackupDir, file);
      const stat = await fs.stat(src);
      if (stat.isDirectory()) {
        await fs.cp(src, dest, { recursive: true });
      } else {
        await fs.copyFile(src, dest);
      }
    }
    
    // Backup layouts
    const layoutsBackupDir = path.join(backupSubdir, 'layouts');
    await fs.mkdir(layoutsBackupDir, { recursive: true });
    const layoutFiles = await fs.readdir(LAYOUTS_DIR);
    for (const file of layoutFiles) {
      const src = path.join(LAYOUTS_DIR, file);
      const dest = path.join(layoutsBackupDir, file);
      const stat = await fs.stat(src);
      if (stat.isDirectory()) {
        await fs.cp(src, dest, { recursive: true });
      } else {
        await fs.copyFile(src, dest);
      }
    }
    
    console.log(`Backup completato in: ${backupSubdir}`);
  } catch (e) {
    console.error('Errore durante il backup:', e);
  }
}

async function uploadTemplatesAndLayouts(singleName) {
  await ensureTemplatesDir();
  await ensureLayoutsDir();
  await backupTemplates(); // Effettua backup prima dell'upload
  
  // Upload templates
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
  
  // Upload layouts (che sono template con TemplateType: "Layout")
  const layoutFolders = await fs.readdir(LAYOUTS_DIR);
  for (const folder of layoutFolders) {
    const layoutDir = path.join(LAYOUTS_DIR, folder);
    const stat = await fs.stat(layoutDir);
    if (!stat.isDirectory()) continue;
    if (singleName && folder !== singleName) continue;
    const jsonPath = path.join(layoutDir, 'layout.json');
    let data;
    try {
      data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
    } catch {
      continue;
    }
    try {
      const htmlPath = path.join(layoutDir, 'layout.html');
      data.HtmlBody = await fs.readFile(htmlPath, 'utf8');
    } catch {}
    if (data && data.TemplateId && data.Name) {
      const { TemplateId, Name, Subject, HtmlBody, TextBody, Alias, TemplateType, LayoutTemplate, AssociatedServerId } = data;
      await axiosInstance.put(`/templates/${TemplateId}`, {
        Name, Subject, HtmlBody, TextBody, Alias, TemplateType, LayoutTemplate, AssociatedServerId
      });
      console.log(`Aggiornato layout: ${Name}`);
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

async function previewLayout(layoutName) {
  if (!layoutName) {
    console.error('Devi specificare il nome del layout da visualizzare.');
    process.exit(1);
  }
  const layoutDir = path.join(LAYOUTS_DIR, layoutName);
  const htmlPath = path.join(layoutDir, 'layout.html');
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
  const PORT = 4322;
  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`Anteprima layout disponibile su ${url}`);
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

async function openLayoutOnPostmark(layoutName) {
  if (!layoutName) {
    console.error('Devi specificare il nome del layout da aprire.');
    process.exit(1);
  }
  const layoutDir = path.join(LAYOUTS_DIR, layoutName);
  const jsonPath = path.join(layoutDir, 'layout.json');
  let data;
  try {
    data = JSON.parse(await fs.readFile(jsonPath, 'utf8'));
  } catch {
    console.error(`Impossibile trovare o leggere il file: ${jsonPath}`);
    process.exit(1);
  }
  const templateId = data.TemplateId; // I layout usano TemplateId, non LayoutId
  if (!templateId) {
    console.error('TemplateId non trovato in layout.json');
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

async function manualBackup() {
  console.log('Testando la funzione di backup...');
  await backupTemplates();
  console.log('Test backup completato!');
}

async function main() {
  const cmd = process.argv[2];
  if (cmd === 'download') {
    const singleName = process.argv[3];
    await downloadTemplates(singleName);
  } else if (cmd === 'download-layouts') {
    const singleName = process.argv[3];
    await downloadLayouts(singleName);
  } else if (cmd === 'upload') {
    const singleName = process.argv[3];
    await uploadTemplatesAndLayouts(singleName);
  } else if (cmd === 'preview') {
    const templateName = process.argv[3];
    await previewTemplate(templateName);
  } else if (cmd === 'preview-layout') {
    const layoutName = process.argv[3];
    await previewLayout(layoutName);
  } else if (cmd === 'open') {
    const templateName = process.argv[3];
    await openTemplateOnPostmark(templateName);
  } else if (cmd === 'open-layout') {
    const layoutName = process.argv[3];
    await openLayoutOnPostmark(layoutName);
  } else if (cmd === 'backup') {
    await manualBackup();
  } else {
    console.log('Comandi disponibili:');
    console.log('  Template:');
    console.log('    node postmark-tool.js download                   # scarica tutti i template');
    console.log('    node postmark-tool.js download NOME_TEMPLATE      # scarica solo un template');
    console.log('    node postmark-tool.js upload                      # carica tutti i template e layout');
    console.log('    node postmark-tool.js upload NOME_TEMPLATE        # carica solo un template');
    console.log('    node postmark-tool.js preview NOME_TEMPLATE       # anteprima HTML di un template');
    console.log('    node postmark-tool.js open NOME_TEMPLATE          # apre template su Postmark');
    console.log('');
    console.log('  Layout:');
    console.log('    node postmark-tool.js download-layouts            # scarica tutti i layout');
    console.log('    node postmark-tool.js download-layouts NOME_LAYOUT # scarica solo un layout');
    console.log('    node postmark-tool.js preview-layout NOME_LAYOUT  # anteprima HTML di un layout');
    console.log('    node postmark-tool.js open-layout NOME_LAYOUT     # apre layout su Postmark');
    console.log('');
    console.log('  Test:');
    console.log('    node postmark-tool.js backup                 # manual backup');
    console.log('');
    console.log('Note:');
    console.log('  - I backup vengono salvati in backup/SERVER_NAME/timestamp/');
    console.log('  - Il nome del server è configurato tramite POSTMARK_SERVER_NAME in .env');
    console.log('  - I layout sono template con TemplateType: "Layout"');
  }
}

main(); 