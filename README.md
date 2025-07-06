# Postmark Template Modify

This tool allows you to download and upload templates and layouts from Postmark via API.

## 🗂️ Template Structure

When you download templates (`download`) or layouts (`download-layouts`), each template/layout is saved in its own folder.

**Template Structure:**
```
templates/
  TemplateName1/
    template.json
    template.html
  TemplateName2/
    template.json
    template.html
```

**Layout Structure:**
```
layout/
  LayoutName1/
    layout.json
    layout.html
  LayoutName2/
    layout.json
    layout.html
```

- `template.json`/`layout.json`: contains all the template/layout data in JSON format  
- `template.html`/`layout.html`: contains the HTML body of the template/layout

> **Note:** The `.txt` file (TextBody) is no longer saved.

## ⚙️ Commands

### Template Commands
- Download all templates:
  ```
  node postmark-tool.js download
  ```
- Download a single template:
  ```
  node postmark-tool.js download TEMPLATE_NAME
  ```
- Upload all templates and layouts:
  ```
  node postmark-tool.js upload
  ```
- Upload a single template:
  ```
  node postmark-tool.js upload TEMPLATE_NAME
  ```
- Preview a template in the browser:
  ```
  node postmark-tool.js preview TEMPLATE_NAME
  ```
  This will automatically open your browser at `http://localhost:4321` with a preview of the HTML template.

- Open the template on Postmark in the browser:
  ```
  node postmark-tool.js open TEMPLATE_NAME
  ```
  This will open the template edit page directly on Postmark using the TemplateId and your SERVER_ID.

### Layout Commands
- Download all layouts:
  ```
  node postmark-tool.js download-layouts
  ```
- Download a single layout:
  ```
  node postmark-tool.js download-layouts LAYOUT_NAME
  ```
- Preview a layout in the browser:
  ```
  node postmark-tool.js preview-layout LAYOUT_NAME
  ```
  This will automatically open your browser at `http://localhost:4322` with a preview of the HTML layout.

- Open the layout on Postmark in the browser:
  ```
  node postmark-tool.js open-layout LAYOUT_NAME
  ```
  This will open the layout edit page directly on Postmark using the TemplateId and your SERVER_ID.

### Utility Commands
- Manual backup:
  ```
  node postmark-tool.js backup
  ```
  Creates a backup of all templates and layouts with timestamp.

## 📦 Requirements

- Node.js
- A `.env` file with the following variables:
  - `POSTMARK_SERVER_TOKEN`
  - `POSTMARK_SERVER_ID`
  - `POSTMARK_SERVER_NAME` (optional, defaults to 'default')
- For the preview and browser opening features, make sure the `open` package is installed:
  ```
  npm install open
  ```

## 🚀 Installation

1. **Clone or copy this project into a dedicated folder:**
   ```sh
   git clone <repo-url> postmark-manager
   cd postmark-manager
   ```
   Or create a folder and copy the files manually.

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Rename `.env.example` to `.env`
   - Add your Postmark API key and server ID:
     ```env
     POSTMARK_SERVER_TOKEN=your-api-key
     POSTMARK_SERVER_ID=your-server-id
     POSTMARK_SERVER_NAME=your-server-name
     ```

## 🛡️ Backup System

- Before each upload, an automatic backup of the current files is created in `backup/SERVER_NAME/timestamp/`
- The backup includes both templates and layouts
- You can recover previous versions of templates and layouts from there in case of errors
- Manual backups can be created using the `backup` command

**Backup Structure:**
```
backup/
  SERVER_NAME/
    2024-01-15T10-30-45-123Z/
      templates/
        TemplateName1/
          template.json
          template.html
      layouts/
        LayoutName1/
          layout.json
          layout.html
```

## 🧩 Managing Multiple Postmark Servers

- You can copy the tool folder for each different server, or change the values in the `.env` file before each operation
- Each server's backups are stored separately using the `POSTMARK_SERVER_NAME` environment variable

## 🔐 Security Notes

- **Do not share the `.env` file**: it contains your API key!
- Backups are local only and are never sent to Postmark.

## 🙋 Issues or Requests

If you have problems, suggestions, or requests, open an issue or contact the developer.

---

# Postmark Template Modify

Questo strumento permette di scaricare e caricare template e layout da Postmark tramite API.

## Struttura dei Template

Quando scarichi i template (`download`) o i layout (`download-layouts`), ciascun template/layout viene salvato in una cartella dedicata.

**Struttura Template:**
```
templates/
  NomeTemplate1/
    template.json
    template.html
  NomeTemplate2/
    template.json
    template.html
```

**Struttura Layout:**
```
layout/
  NomeLayout1/
    layout.json
    layout.html
  NomeLayout2/
    layout.json
    layout.html
```

- `template.json`/`layout.json`: contiene tutti i dati del template/layout in formato JSON
- `template.html`/`layout.html`: contiene il corpo HTML del template/layout

> **Nota:** Il file `.txt` (TextBody) non viene più salvato.

## Comandi

### Comandi Template
- Scarica tutti i template:
  ```
  node postmark-tool.js download
  ```
- Scarica un solo template:
  ```
  node postmark-tool.js download NOME_TEMPLATE
  ```
- Carica tutti i template e layout:
  ```
  node postmark-tool.js upload
  ```
- Carica un solo template:
  ```
  node postmark-tool.js upload NOME_TEMPLATE
  ```
- Anteprima di un template nel browser:
  ```
  node postmark-tool.js preview NOME_TEMPLATE
  ```
  Si aprirà automaticamente il browser all'indirizzo `http://localhost:4321` con l'anteprima del template HTML.

- Apri il template su Postmark nel browser:
  ```
  node postmark-tool.js open NOME_TEMPLATE
  ```
  Si aprirà la pagina di modifica del template direttamente su Postmark, usando il TemplateId e il tuo SERVER_ID.

### Comandi Layout
- Scarica tutti i layout:
  ```
  node postmark-tool.js download-layouts
  ```
- Scarica un solo layout:
  ```
  node postmark-tool.js download-layouts NOME_LAYOUT
  ```
- Anteprima di un layout nel browser:
  ```
  node postmark-tool.js preview-layout NOME_LAYOUT
  ```
  Si aprirà automaticamente il browser all'indirizzo `http://localhost:4322` con l'anteprima del layout HTML.

- Apri il layout su Postmark nel browser:
  ```
  node postmark-tool.js open-layout NOME_LAYOUT
  ```
  Si aprirà la pagina di modifica del layout direttamente su Postmark, usando il TemplateId e il tuo SERVER_ID.

### Comandi Utility
- Backup manuale:
  ```
  node postmark-tool.js backup
  ```
  Crea un backup di tutti i template e layout con timestamp.

## Requisiti

- Node.js
- Un file `.env` con le variabili:
  - `POSTMARK_SERVER_TOKEN`
  - `POSTMARK_SERVER_ID`
  - `POSTMARK_SERVER_NAME` (opzionale, default: 'default')
- Per la funzione di anteprima e apertura browser, assicurati di avere installato il pacchetto `open`:
  ```
  npm install open
  ```

## Installazione

1. **Clona o copia questo progetto in una cartella dedicata:**
   ```sh
   git clone <repo-url> postmark-manager
   cd postmark-manager
   ```
   Oppure crea una cartella e copia i file manualmente.

2. **Installa le dipendenze:**
   ```sh
   npm install
   ```

3. **Configura le variabili d'ambiente:**
   - Rinomina `.env.example` in `.env`
   - Inserisci la tua API key e il server ID di Postmark:
     ```env
     POSTMARK_SERVER_TOKEN=la-tua-api-key
     POSTMARK_SERVER_ID=il-tuo-server-id
     POSTMARK_SERVER_NAME=nome-del-tuo-server
     ```

## Sistema di Backup

- Prima di ogni upload viene creato un backup automatico dei file attuali in `backup/NOME_SERVER/timestamp/`
- Il backup include sia template che layout
- Puoi recuperare versioni precedenti di template e layout da lì in caso di errore
- I backup manuali possono essere creati usando il comando `backup`

**Struttura Backup:**
```
backup/
  NOME_SERVER/
    2024-01-15T10-30-45-123Z/
      templates/
        NomeTemplate1/
          template.json
          template.html
      layouts/
        NomeLayout1/
          layout.json
          layout.html
```

## Gestione di più server Postmark

- Puoi copiare la cartella del tool per ogni server diverso, oppure cambiare i valori nel file `.env` prima di ogni operazione
- I backup di ogni server sono memorizzati separatamente usando la variabile d'ambiente `POSTMARK_SERVER_NAME`

## Note di sicurezza

- **Non condividere il file `.env`**: contiene la tua API key!
- I backup sono solo locali e non vengono mai inviati a Postmark.

## Problemi o richieste

Se hai problemi, suggerimenti o richieste, apri una issue o contatta lo sviluppatore.

