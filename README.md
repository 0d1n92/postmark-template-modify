# Postmark Template Tool

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