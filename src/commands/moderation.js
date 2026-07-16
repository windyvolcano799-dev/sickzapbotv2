const Logger = require('../modules/logger');

class ModerationCommands {
  constructor(client, db) {
    this.client = client;
    this.db = db;
    this.logger = new Logger();
  }

  async ban(message, args, userId, groupId) {
    try {
      const chat = await message.getChat();
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        // Cerca menzione
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      // Ban
      await chat.removeParticipants([target.id._serialized]);
      
      this.db.addModLog({
        action: 'ban',
        moderator: userId,
        user: target.id._serialized,
        group: groupId,
        reason: args.slice(1).join(' ') || 'Nessun motivo',
        timestamp: new Date().toISOString()
      });

      await message.reply(`🚫 ${target.name || target.number} è stato bannato`);
    } catch (error) {
      this.logger.error(`Errore ban: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async kick(message, args, userId, groupId) {
    try {
      const chat = await message.getChat();
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      await chat.removeParticipants([target.id._serialized]);
      
      this.db.addModLog({
        action: 'kick',
        moderator: userId,
        user: target.id._serialized,
        group: groupId,
        reason: args.slice(1).join(' ') || 'Nessun motivo',
        timestamp: new Date().toISOString()
      });

      await message.reply(`👋 ${target.name || target.number} è stato rimosso`);
    } catch (error) {
      this.logger.error(`Errore kick: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async mute(message, args, userId, groupId) {
    try {
      let target = null;
      let duration = args[1] || '1h';

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      const muteTime = this.db.addMute(target.id._serialized, groupId, duration);

      this.db.addModLog({
        action: 'mute',
        moderator: userId,
        user: target.id._serialized,
        group: groupId,
        reason: duration,
        timestamp: new Date().toISOString()
      });

      await message.reply(`🔇 ${target.name || target.number} è mutato per ${duration}`);
    } catch (error) {
      this.logger.error(`Errore mute: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async del(message) {
    try {
      if (message.hasQuotedMsg) {
        const quoted = await message.getQuotedMessage();
        await quoted.delete(true);
        await message.reply('🗑️ Messaggio eliminato');
      } else {
        await message.reply('❌ Rispondi a un messaggio per eliminarlo');
      }
    } catch (error) {
      this.logger.error(`Errore del: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async warn(message, args, userId, groupId) {
    try {
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      const warns = this.db.addWarn(target.id._serialized, groupId, args.slice(1).join(' '));

      const text = `⚠️ Avviso a ${target.name || target.number}\nMotivo: ${args.slice(1).join(' ') || 'Nessun motivo'}\nAvvertimenti: ${warns}/3`;

      if (warns >= 3) {
        const chat = await message.getChat();
        await chat.removeParticipants([target.id._serialized]);
        await message.reply(`${text}\n\n❌ Rimosso dal gruppo (3 avvertimenti)`);
        this.db.clearWarns(target.id._serialized);
      } else if (warns >= 2) {
        const duration = '1h';
        this.db.addMute(target.id._serialized, groupId, duration);
        await message.reply(`${text}\n\n🔇 Mutato per ${duration}`);
      } else {
        await message.reply(text);
      }
    } catch (error) {
      this.logger.error(`Errore warn: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async warns(message, args) {
    try {
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      const user = this.db.getUser(target.id._serialized);
      const warns = user?.warns || 0;

      await message.reply(`⚠️ ${target.name || target.number} ha ${warns} avvertimenti`);
    } catch (error) {
      this.logger.error(`Errore warns: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async clearwarn(message, args, userId, groupId) {
    try {
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      this.db.clearWarns(target.id._serialized);
      
      this.db.addModLog({
        action: 'clearwarn',
        moderator: userId,
        user: target.id._serialized,
        group: groupId,
        reason: 'Avvertimenti cancellati',
        timestamp: new Date().toISOString()
      });

      await message.reply(`✅ Avvertimenti cancellati per ${target.name || target.number}`);
    } catch (error) {
      this.logger.error(`Errore clearwarn: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async addmod(message, args, userId, groupId) {
    try {
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      this.db.addMod(target.id._serialized, groupId);
      await message.reply(`🛡️ ${target.name || target.number} è ora moderatore`);
    } catch (error) {
      this.logger.error(`Errore addmod: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async delmod(message, args, userId, groupId) {
    try {
      let target = null;

      if (message.hasQuotedMsg) {
        target = await message.getQuotedMessage();
        target = await target.getContact();
      } else if (args[0]) {
        target = await this.getUserFromMention(args[0]);
      }

      if (!target) return await message.reply('❌ Utente non trovato');

      this.db.removeMod(target.id._serialized, groupId);
      await message.reply(`✅ ${target.name || target.number} non è più moderatore`);
    } catch (error) {
      this.logger.error(`Errore delmod: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async mods(message, groupId) {
    try {
      const group = this.db.getGroup(groupId);
      if (!group || group.moderators.length === 0) {
        return await message.reply('❌ Nessun moderatore in questo gruppo');
      }

      const modList = group.moderators.map(id => `• ${id}`).join('\n');
      await message.reply(`🛡️ *Moderatori*\n\n${modList}`);
    } catch (error) {
      this.logger.error(`Errore mods: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async modlog(message, groupId) {
    try {
      const logs = this.db.getModLogs(groupId, 10);
      
      if (logs.length === 0) {
        return await message.reply('❌ Nessun log di moderazione');
      }

      let text = '📋 *Ultimi 10 log moderazione*\n\n';
      logs.forEach((log, i) => {
        const date = new Date(log.timestamp).toLocaleString('it-IT');
        text += `${i + 1}. *${log.action.toUpperCase()}*\nUtente: ${log.user}\nMod: ${log.moderator}\nMotivo: ${log.reason}\nData: ${date}\n\n`;
      });

      await message.reply(text);
    } catch (error) {
      this.logger.error(`Errore modlog: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  // Configurazione
  async antilink(message, args, groupId) {
    try {
      const setting = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(setting)) {
        return await message.reply('❌ Usa: .antilink on/off');
      }

      const group = this.db.getGroup(groupId);
      if (group) {
        group.settings.antilink = setting === 'on';
        this.db.updateGroup(groupId, group);
      }

      await message.reply(`🔗 Anti-link ${setting === 'on' ? '✅ attivato' : '❌ disattivato'}`);
    } catch (error) {
      this.logger.error(`Errore antilink: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async antiflood(message, args, groupId) {
    try {
      const setting = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(setting)) {
        return await message.reply('❌ Usa: .antiflood on/off');
      }

      const group = this.db.getGroup(groupId);
      if (group) {
        group.settings.antiflood = setting === 'on';
        this.db.updateGroup(groupId, group);
      }

      await message.reply(`💧 Anti-flood ${setting === 'on' ? '✅ attivato' : '❌ disattivato'}`);
    } catch (error) {
      this.logger.error(`Errore antiflood: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async rules(message, groupId) {
    try {
      const group = this.db.getGroup(groupId);
      const rules = group?.rules || 'Nessuna regola impostata';
      await message.reply(`📜 *Regole del Gruppo*\n\n${rules}`);
    } catch (error) {
      this.logger.error(`Errore rules: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async setrules(message, args, groupId) {
    try {
      const rules = args.join(' ');
      if (!rules) return await message.reply('❌ Scrivi le regole');

      const group = this.db.getGroup(groupId);
      if (group) {
        group.rules = rules;
        this.db.updateGroup(groupId, group);
      }

      await message.reply(`✅ Regole aggiornate`);
    } catch (error) {
      this.logger.error(`Errore setrules: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async groupinfo(message, groupId) {
    try {
      const group = this.db.getGroup(groupId);
      const chat = await message.getChat();
      const participants = chat.participants.length;

      const info = `
📊 *Informazioni Gruppo*

*Nome:* ${group?.name || chat.name}
*Partecipanti:* ${participants}
*Owner:* ${group?.owner || 'Sconosciuto'}
*Moderatori:* ${group?.moderators?.length || 0}

🔧 *Impostazioni*
*Anti-link:* ${group?.settings?.antilink ? '✅' : '❌'}
*Anti-flood:* ${group?.settings?.antiflood ? '✅' : '❌'}
      `;

      await message.reply(info);
    } catch (error) {
      this.logger.error(`Errore groupinfo: ${error.message}`);
      await message.reply(`❌ Errore: ${error.message}`);
    }
  }

  async getUserFromMention(mention) {
    // Parsing menzione WhatsApp (@number)
    const number = mention.replace('@', '');
    return {
      id: { _serialized: number + '@c.us' },
      number: number,
      name: 'Utente'
    };
  }
}

module.exports = ModerationCommands;
