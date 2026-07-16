const Logger = require('../modules/logger');

class FamilyCommands {
  constructor(client, db) {
    this.client = client;
    this.db = db;
    this.logger = new Logger();
    this.marriageRequests = {};
  }

  async famiglia(message, userId) {
    try {
      const user = this.db.getUser(userId);

      if (!user) {
        return await message.reply('❌ Profilo non trovato');
      }

      const partner = user.family.partner ? this.db.getUser(user.family.partner)?.name : 'Nessuno';
      const children = user.family.children?.length || 0;
      const parents = user.family.parents?.length || 0;
      const exes = user.family.exes?.length || 0;

      const text = `
👨‍👩‍👧‍👦 *FAMIGLIA*

${user.name}

❤️ *Partner:* ${partner}
👶 *Figli:* ${children}
👨 *Genitori:* ${parents}
💔 *Ex:* ${exes}
      `;

      await message.reply(text);
    } catch (error) {
      this.logger.error(`Errore famiglia: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async sposa(message, args, userId, groupId) {
    try {
      const user = this.db.getUser(userId);

      if (user.family.partner) {
        return await message.reply('❌ Sei già sposato/a!');
      }

      if (!args[0]) {
        return await message.reply('❌ Usa: .sposa @utente');
      }

      const targetId = args[0].replace('@', '') + '@c.us';
      const target = this.db.getUser(targetId);

      if (!target) {
        return await message.reply('❌ Utente non trovato');
      }

      if (target.family.partner) {
        return await message.reply('❌ L\'altro utente è già sposato/a!');
      }

      // Invia richiesta
      const requestId = `${userId}-${targetId}`;
      this.marriageRequests[requestId] = {
        from: userId,
        to: targetId,
        timestamp: Date.now()
      };

      await message.reply(`
💍 *PROPOSTA DI MATRIMONIO*

${user.name} vuole sposarti!

Rispondi con:
.accetta ${userId.split('@')[0]}
.rifiuta ${userId.split('@')[0]}

_Scade in 5 minuti_
      `);

      // Scadenza
      setTimeout(() => {
        delete this.marriageRequests[requestId];
      }, 300000);
    } catch (error) {
      this.logger.error(`Errore sposa: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async divorzio(message, userId) {
    try {
      const user = this.db.getUser(userId);

      if (!user.family.partner) {
        return await message.reply('❌ Non sei sposato/a!');
      }

      this.db.divorce(userId);
      await message.reply('💔 Divorzio completato. L\'ex è stato salvato.');
    } catch (error) {
      this.logger.error(`Errore divorzio: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async ex(message, userId) {
    try {
      const user = this.db.getUser(userId);

      if (!user.family.exes || user.family.exes.length === 0) {
        return await message.reply('❌ Nessun ex');
      }

      const exList = user.family.exes
        .map(exId => this.db.getUser(exId)?.name || 'Sconosciuto')
        .join('\n• ');

      await message.reply(`💔 *I tuoi ex*\n\n• ${exList}`);
    } catch (error) {
      this.logger.error(`Errore ex: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async figlio(message, args, userId) {
    try {
      const user = this.db.getUser(userId);

      if ((user.family.children?.length || 0) >= 4) {
        return await message.reply('❌ Massimo 4 figli raggiunto!');
      }

      if (!args[0]) {
        return await message.reply('❌ Usa: .figlio @utente');
      }

      const targetId = args[0].replace('@', '') + '@c.us';

      this.db.addChild(userId, targetId);
      await message.reply('👶 Figlio aggiunto!');
    } catch (error) {
      this.logger.error(`Errore figlio: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async genitore(message, args, userId) {
    try {
      const user = this.db.getUser(userId);

      if ((user.family.parents?.length || 0) >= 2) {
        return await message.reply('❌ Massimo 2 genitori raggiunto!');
      }

      if (!args[0]) {
        return await message.reply('❌ Usa: .genitore @utente');
      }

      const targetId = args[0].replace('@', '') + '@c.us';

      this.db.addChild(targetId, userId);
      await message.reply('👨 Genitore aggiunto!');
    } catch (error) {
      this.logger.error(`Errore genitore: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async famiglie(message) {
    try {
      const users = this.db.read('users');
      const families = Object.values(users)
        .filter(u => (u.family?.children?.length || 0) > 0)
        .sort((a, b) => (b.family.children?.length || 0) - (a.family.children?.length || 0))
        .slice(0, 10);

      if (families.length === 0) {
        return await message.reply('❌ Nessuna famiglia creata');
      }

      let text = `👨‍👩‍👧‍👦 *TOP 10 FAMIGLIE*\n\n`;
      families.forEach((family, i) => {
        const emoji = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const members = 1 + (family.family.partner ? 1 : 0) + (family.family.children?.length || 0) + (family.family.parents?.length || 0);
        text += `${emoji[i]} ${family.name} - ${members} membri, ${family.family.children?.length || 0} figli\n`;
      });

      await message.reply(text);
    } catch (error) {
      this.logger.error(`Errore famiglie: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }
}

module.exports = FamilyCommands;
