const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const LOGS_DIR = path.join(__dirname, 'logs');
const BACKUP_DIR = path.join(__dirname, 'backups');
const ALERT_CHANNEL_ID = '';
const ADMIN_ROLE_ID = '';

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

function timestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

const AdminCore = {
  hasAdminPerms: (member) => {
    if (!member || !member.roles) return false;
    return member.roles.cache.has(ADMIN_ROLE_ID);
  },

  logEvent: (type, message) => {
    const logMsg = `[${timestamp()}] [${type.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(path.join(LOGS_DIR, 'bot.log'), logMsg, 'utf8');
    console.log(logMsg.trim());
  },

  backupFile: (filePath) => {
    if (!fs.existsSync(filePath)) return false;
    const fileName = path.basename(filePath);
    const backupName = `${fileName.replace('.json', '')}_${Date.now()}.bak.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    fs.copyFileSync(filePath, backupPath);
    AdminCore.logEvent('BACKUP', `Created backup for ${fileName}`);
    return backupPath;
  },

  async sendAlert(client, title, description) {
    try {
      const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
      if (!channel) return;
      const embed = new EmbedBuilder()
        .setTitle(`${title}`)
        .setDescription(description)
        .setColor('#ff0000')
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to send alert:', err);
    }
  },

  startAutoBackup: (filePath, minutes = 60) => {
    setInterval(() => {
      AdminCore.backupFile(filePath);
    }, minutes * 60 * 1000);
    AdminCore.logEvent('INIT', `Auto-backup started for ${filePath} every ${minutes} min`);
  }
};

module.exports = AdminCore;

