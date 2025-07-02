# Postmark Template & Layout Manager

Uno script Node.js per scaricare, modificare e caricare template e layout di Postmark senza passare dall'interfaccia web.

## Requisiti
- Node.js (v16+)
- Un account Postmark con accesso API

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

## Utilizzo

### Scaricare tutti i template
Scarica tutti i template dal server Postmark e li salva nella cartella `templates/`:
```sh
node postmark-tool.js download
```

#### Scaricare un solo template specifico
```sh
node postmark-tool.js download NOME_TEMPLATE
```

### Modificare i template
- I template sono nella cartella `templates/`.
- Puoi modificare i file `.html` e `.txt` direttamente da VSCode.

### Caricare (upload) template modificati
Esegue prima un backup automatico dei file attuali in `templates/` (cartella `backup/`), poi aggiorna i template su Postmark:
```sh
node postmark-tool.js upload
```

#### Caricare solo un template specifico
```sh
node postmark-tool.js upload template-NOME
```
Sostituisci `template-NOME` con il nome base del file (senza estensione).

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