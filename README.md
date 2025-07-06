# Postmark Template Modify

This tool allows you to download and upload templates from Postmark via API.

## 🗂️ New Template Structure

When you download templates (`download`), each template is saved in its own folder inside the `templates/` directory.

**Example:**

```
templates/
  TemplateName1/
    template.json
    template.html
  TemplateName2/
    template.json
    template.html
```

- `template.json`: contains all the template data in JSON format  
- `template.html`: contains the HTML body of the template

> **Note:** The `.txt` file (TextBody) is no longer saved.

## ⚙️ Commands

- Download all templates:
  ```
  node postmark-tool.js download
  ```
- Download a single template:
  ```
  node postmark-tool.js download TEMPLATE_NAME
  ```
- Upload all templates:
  ```
  node postmark-tool.js upload
  ```
- Upload a single template:
  ```
  node postmark-tool.js upload SANITIZED_TEMPLATE_NAME
  ```
- **Preview a template in the browser:**
  ```
  node postmark-tool.js preview SANITIZED_TEMPLATE_NAME
  ```
  This will automatically open your browser at `http://localhost:4321` with a preview of the HTML template.

- **Open the template on Postmark in the browser:**
  ```
  node postmark-tool.js open SANITIZED_TEMPLATE_NAME
  ```
  This will open the template edit page directly on Postmark using the TemplateId and your SERVER_ID.

## 📦 Requirements

- Node.js
- A `.env` file with the following variables:
  - `POSTMARK_SERVER_TOKEN`
  - `POSTMARK_SERVER_ID`
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
     ```

## 🛡️ Backup

- Before each upload, an automatic backup of the current files is created in a `backup/` subfolder with a timestamp.
- You can recover previous versions of templates from there in case of errors.

## 🧩 Managing Multiple Postmark Servers

- You can copy the tool folder for each different server, or change the values in the `.env` file before each operation.

## 🔐 Security Notes

- **Do not share the `.env` file**: it contains your API key!
- Backups are local only and are never sent to Postmark.

## 🙋 Issues or Requests

If you have problems, suggestions, or requests, open an issue or contact the developer.


# Postmark Template modify

Questo strumento permette di scaricare e caricare template da Postmark tramite API.

## Nuova struttura dei template

Quando scarichi i template (`download`), ciascun template viene salvato in una cartella dedicata dentro la cartella `templates/`.

**Esempio:**

```
templates/
  NomeTemplate1/
    template.json
    template.html
  NomeTemplate2/
    template.json
    template.html
```

- `template.json`: contiene tutti i dati del template in formato JSON
- `template.html`: contiene il corpo HTML del template

> **Nota:** Il file `.txt` (TextBody) non viene più salvato.

## Comandi

- Scarica tutti i template:
  ```
  node postmark-tool.js download
  ```
- Scarica un solo template:
  ```
  node postmark-tool.js download NOME_TEMPLATE
  ```
- Carica tutti i template:
  ```
  node postmark-tool.js upload
  ```
- Carica un solo template:
  ```
  node postmark-tool.js upload NOME_TEMPLATE_SANIFICATO
  ```
- **Anteprima di un template nel browser:**
  ```
  node postmark-tool.js preview NOME_TEMPLATE_SANIFICATO
  ```
  Si aprirà automaticamente il browser all'indirizzo `http://localhost:4321` con l'anteprima del template HTML.
- **Apri il template su Postmark nel browser:**
  ```
  node postmark-tool.js open NOME_TEMPLATE_SANIFICATO
  ```
  Si aprirà la pagina di modifica del template direttamente su Postmark, usando il TemplateId e il tuo SERVER_ID.

## Requisiti

- Node.js
- Un file `.env` con le variabili:
  - `POSTMARK_SERVER_TOKEN`
  - `POSTMARK_SERVER_ID`
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
     ```

### Backup
- Prima di ogni upload viene creato un backup automatico dei file attuali in una sottocartella di `backup/` con timestamp.
- Puoi recuperare versioni precedenti dei template da lì in caso di errore.

### Gestione di più server Postmark
- Puoi copiare la cartella del tool per ogni server diverso, oppure cambiare i valori nel file `.env` prima di ogni operazione.

### Note di sicurezza
- **Non condividere il file `.env`**: contiene la tua API key!
- I backup sono solo locali e non vengono mai inviati a Postmark.

### Problemi o richieste
Se hai problemi, suggerimenti o richieste, apri una issue o contatta lo sviluppatore. 

