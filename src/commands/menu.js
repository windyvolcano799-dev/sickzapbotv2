const Logger = require('../modules/logger');

class MenuCommands {
  constructor(client, db) {
    this.client = client;
    this.db = db;
    this.logger = new Logger();
  }

  async menu(message, userId, groupId) {
    try {
      const user = this.db.getUser(userId);
      const group = this.db.getGroup(groupId);
      
      const isOwner = this.db.isOwner(userId, groupId);
      const isAdmin = this.db.isAdmin(userId, groupId);
      const isMod = this.db.isMod(userId, groupId);

      const menuMessage = `
🤖 *BOT CENTER*

Benvenuto nel pannello comandi del bot!

Qui puoi trovare tutti i sistemi disponibili:

🛡️ Moderazione
🎮 Giochi
⭐ Livelli e XP
👨‍👩‍👧 Famiglia
🏆 Classifiche
⚙️ Utility

Seleziona una categoria per vedere tutti i comandi disponibili.
      `;

      // Pulsanti base (per tutti)
      const buttons = [
        { text: '🎮 Giochi' },
        { text: '⭐ XP & Livelli' },
        { text: '👨‍👩‍👧 Famiglia' },
        { text: '🏆 Classifiche' },
        { text: '⚙️ Utility' }
      ];

      // Aggiungi pulsanti admin se ha permessi
      if (isMod) {
        buttons.unshift({ text: '🛡️ Moderazione' });
      }

      // Invia messaggio con pulsanti
      await message.reply(menuMessage, undefined, {
        buttons: buttons,
        headerType: 1
      });

      this.logger.debug(`Menu inviato a ${user?.name || 'Utente'}`);

    } catch (error) {
      this.logger.error(`Errore menu: ${error.message}`);
      
      // Fallback se i pulsanti non funzionano
      try {
        await message.reply(`
🤖 *BOT CENTER*

🛡️ .modcmds - Comandi moderazione
🎮 .gamecmds - Comandi giochi
⭐ .xpcmds - Comandi XP
👨‍👩‍👧 .familycmds - Comandi famiglia
🏆 .statscmds - Statistiche e classifiche
⚙️ .utilcmds - Comandi utility
        `);
      } catch (e) {
        this.logger.error(`Errore menu fallback: ${e.message}`);
      }
    }
  }

  async moderationMenu(message, userId, groupId) {
    try {
      const isAdmin = this.db.isAdmin(userId, groupId);
      const isMod = this.db.isMod(userId, groupId);

      if (!isMod) {
        return await message.reply('❌ Non hai permessi per accedere a questo menu');
      }

      const modMenu = `
🛡️ *MODERAZIONE*

*Gestione Utenti:*
.ban @utente - Banna un utente
.kick @utente - Espelle un utente
.mute @utente 5m/1h/1d - Silenzia un utente

*Sistema Avvertimenti:*
.warn @utente motivo - Avvertimento
.warns @utente - Lista warn
.clearwarn @utente - Cancella warn

*Gestione Moderatori:*
.addmod @utente - Aggiungi moderatore
.delmod @utente - Rimuovi moderatore
.mods - Lista moderatori

*Moderazione Messaggi:*
.del - Elimina messaggio (reply)

*Protezioni Gruppo:*
.antilink on/off - Anti-link
.antiflood on/off - Anti-flood

*Configurazione:*
.rules - Mostra regole
.setrules testo - Imposta regole
.groupinfo - Info gruppo
.modlog - Log moderazione

_Solo admin possono configurare protezioni_
      `;

      await message.reply(modMenu);
    } catch (error) {
      this.logger.error(`Errore moderation menu: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async gameMenu(message) {
    try {
      const gameMenu = `
🎮 *GIOCHI*

*Quiz e Indovinelli:*
.bandiera - Indovina la bandiera (+20 XP)
.topbandiere - Classifica bandiere

*Giochi da Tavolo:*
.tris @utente - Sfida tris (+50 XP)
.mossa numero - Mossa tris

*Statistiche:*
.bestemmiometro - Gioco statistiche parolacce
.topbestemmiometro - Classifica bestemmiometro

*Premi ogni vittoria:*
🎁 Bandiere: +20 XP
🎁 Tris: +50 XP (vittoria), +10 XP (pareggio)

_I giochi sono un modo divertente per guadagnare XP!_
      `;

      await message.reply(gameMenu);
    } catch (error) {
      this.logger.error(`Errore game menu: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async xpMenu(message, userId) {
    try {
      const user = this.db.getUser(userId);
      const currentXP = user?.xp || 0;
      const currentLevel = user?.level || 1;
      const xpPerLevel = 560;
      const nextLevelXP = currentLevel * xpPerLevel;

      const xpMenu = `
⭐ *XP SYSTEM*

*Il Tuo Profilo:*
.profilo - Mostra statistiche personali
.livello - Mostra livello attuale
.top - Classifica XP

*Progressione:*
📊 Livello attuale: ${currentLevel}/30
📈 XP totale: ${currentXP}
⏳ XP prossimo livello: ${nextLevelXP}

*Come Guadagnare XP:*
💬 +1 XP per ogni messaggio
🎮 +20 XP per bandiera vinta
🏆 +50 XP per tris vinto

*Badge e Titoli:*
🥉 Principiante - Livello 5
🥈 Esperto - Livello 15
🥇 Leggenda - Livello 25
👑 Re del Gruppo - Livello 30

_Aumenta di livello e sblocca badge!_
      `;

      await message.reply(xpMenu);
    } catch (error) {
      this.logger.error(`Errore xp menu: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async familyMenu(message, userId) {
    try {
      const user = this.db.getUser(userId);
      const partner = user?.family?.partner ? this.db.getUser(user.family.partner)?.name : 'Nessuno';
      const children = user?.family?.children?.length || 0;

      const familyMenu = `
👨‍👩‍👧 *FAMIGLIA*

*Relazioni:*
.famiglia - Visualizza famiglia
.sposa @utente - Richiesta matrimonio
.divorzio - Divorzia dal partner
.ex - Mostra ex partner

*Figli:*
.figlio @utente - Aggiungi figlio
.genitore @utente - Aggiungi genitore

*Statistiche:*
.famiglie - Classifica famiglie

*Il Tuo Stato:*
❤️ Partner: ${partner}
👶 Figli: ${children}

_Costruisci una famiglia nel gruppo!_
      `;

      await message.reply(familyMenu);
    } catch (error) {
      this.logger.error(`Errore family menu: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async statsMenu(message) {
    try {
      const statsMenu = `
🏆 *CLASSIFICHE*

*Giochi:*
.topbandiere - Migliori bandiere
.toptris - Migliori giocatori tris

*Reputazione:*
.topbestemmiometro - Classifica parolacce

*Sistema Famiglia:*
.famiglie - Migliori famiglie

_Raggiungi la cima delle classifiche!_
      `;

      await message.reply(statsMenu);
    } catch (error) {
      this.logger.error(`Errore stats menu: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async utilityMenu(message) {
    try {
      const utilMenu = `
⚙️ *UTILITY*

*Bot Info:*
.ping - Ping bot
.help - Guida comandi

*Divertimento:*
.tag - Tag gruppo (reply)
.aura - Aura meme
.abbraccio @utente1 @utente2 - Abbraccio
.gay @utente - Percentuale gay
.lesbica @utente - Percentuale lesbica
.femboy @utente - Percentuale femboy

*Media:*
.sticker - Converti immagine in sticker (reply)

_Comandi divertenti per il gruppo!_
      `;

      await message.reply(utilMenu);
    } catch (error) {
      this.logger.error(`Errore utility menu: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  // Comandi alias per i menu
  async modcmds(message, userId, groupId) {
    return await this.moderationMenu(message, userId, groupId);
  }

  async gamecmds(message) {
    return await this.gameMenu(message);
  }

  async xpcmds(message, userId) {
    return await this.xpMenu(message, userId);
  }

  async familycmds(message, userId) {
    return await this.familyMenu(message, userId);
  }

  async statscmds(message) {
    return await this.statsMenu(message);
  }

  async utilcmds(message) {
    return await this.utilityMenu(message);
  }
}

module.exports = MenuCommands;
