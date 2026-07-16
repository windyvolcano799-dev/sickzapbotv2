# SickZapBot V2 - Setup Completo

Tutto il codice è stato caricato su GitHub! 🎉

## 📂 File Caricati

✅ **Core:**
- `src/index.js` - Entry point principale
- `src/modules/logger.js` - Sistema log
- `src/modules/database.js` - Gestione database JSON

✅ **Handlers:**
- `src/handlers/commandHandler.js` - Gestore comandi
- `src/handlers/eventHandler.js` - Gestore eventi
- `src/handlers/protectionHandler.js` - Protezioni automatiche

✅ **Comandi:**
- `src/commands/moderation.js` - Moderazione (ban, kick, mute, warn)
- `src/commands/games.js` - Giochi (bandiere, tris, bestemmiometro)
- `src/commands/xp.js` - XP e livelli
- `src/commands/social.js` - Comandi social
- `src/commands/family.js` - Sistema famiglia

✅ **Utils:**
- `src/utils/helpers.js` - Funzioni helper
- `src/utils/validators.js` - Validatori
- `src/utils/formatters.js` - Formattatori messaggi

✅ **Config:**
- `package.json` - Dipendenze npm
- `.env.example` - Variabili ambiente
- `.gitignore` - File da ignorare
- `README.md` - Documentazione

## 🚀 Come Usare

### 1. Clona il repository
```bash
git clone https://github.com/sick/sickzapbotv2.git
cd sickzapbotv2
```

### 2. Installa dipendenze
```bash
npm install
```

### 3. Configura l'ambiente
```bash
cp .env.example .env
```

Modifica `.env` se necessario (di default va bene).

### 4. Avvia il bot
```bash
npm start
```

Vedrai apparire un **QR code** nel terminale.

### 5. Scansiona il QR code
- Apri **WhatsApp** sul telefono
- Vai su **Impostazioni > Dispositivi collegati > Collega un dispositivo**
- Inquadra il QR code con la fotocamera

### 6. Il bot è online! 🎉

Scrivi in un gruppo:
```
.help
```

Per vedere tutti i comandi!

## 📋 Comandi Principali

### Moderazione
```
.ban @utente - Banna
.kick @utente - Rimuove
.mute @utente 5m - Silenzia
.warn @utente motivo - Avverte
.addmod @utente - Aggiunge moderatore
```

### Giochi
```
.bandiera - Quiz bandiere
.tris @utente - Sfida a tris
.bestemmiometro - Conta parolacce
```

### XP e Profilo
```
.profilo - Mostra profilo
.top - Classifica XP
.livello - Mostra livello
```

### Famiglia
```
.famiglia - Mostra famiglia
.sposa @utente - Proposta matrimonio
.figlio @utente - Aggiunge figlio
```

### Social
```
.tag - Tagga tutti
.gay @utente - % gay
.femboy @utente - % femboy
.abbraccio @utente1 @utente2 - Abbraccio
```

### Configurazione
```
.antilink on/off - Anti-link
.antiflood on/off - Anti-flood
.antibadword on/off - Anti-parolacce
.rules - Mostra regole
.groupinfo - Info gruppo
```

## 💾 Database

Il database è salvato in `./data/` in formato JSON:
- `users.json` - Utenti e statistiche
- `groups.json` - Configurazione gruppi
- `modlogs.json` - Log moderazione
- `config.json` - Configurazione globale

## ⚙️ Configurazione Avanzata

### Variabili `.env`

```env
# Nome bot
BOT_NAME=SickZapBot V2

# Prefisso comandi
BOT_PREFIX=.

# Tipo database (json o mongodb)
DB_TYPE=json
DB_PATH=./data

# Features da abilitare
ENABLE_MODERATION=true
ENABLE_GAMES=true
ENABLE_XP=true
ENABLE_FAMILY=true
ENABLE_ANTILINK=true
ENABLE_ANTISPAM=true
ENABLE_ANTIBADWORD=true

# Log level (error, warn, info, debug)
LOG_LEVEL=info
```

## 🐛 Troubleshooting

### QR code non appare
```bash
# Prova a cancellare la sessione
rm -rf .wwebjs_auth .wwebjs_cache
npm start
```

### Bot non risponde
- Verifica di aver scansionato il QR code
- Controlla che WhatsApp sia online sul telefono
- Prova a riavviare il bot

### Permessi negati
- Solo owner, admin e moderatori possono usare comandi di moderazione
- Owner = chi ha creato il gruppo
- Admin = impostato da owner con `.addmod`

## 📞 Support

Se hai problemi:
1. Leggi il README completo
2. Controlla i log in `./logs/`
3. Apri un issue su GitHub

## 🎯 Prossime Feature

- [ ] Integrazione MongoDB
- [ ] Sistema ranking avanzato
- [ ] Più giochi (indovina numero, parole)
- [ ] Sistema economia (monete, shop)
- [ ] Comandi admin dashboard
- [ ] Backup automatico database

---

**Bot open-source per WhatsApp** ✨

Divertiti! 🚀
