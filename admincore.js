// admincore.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const LOGS_DIR = path.join(__dirname, 'logs');
const BACKUP_DIR = path.join(__dirname, 'backups');
const ALERT_CHANNEL_ID = 'PUT_ID_HERE';
const ADMIN_ROLE_ID = 'PUT_ID_HERE';

// Ensure folders exist
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

function timestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

// Core Admin Utilities
const AdminCore = {
  /**
   * Check if a user has the admin role
   */
  hasAdminPerms: (member) => {
    if (!member || !member.roles) return false;
    return member.roles.cache.has(ADMIN_ROLE_ID);
  },

  /**
   * Log an event to a file
   */
  logEvent: (type, message) => {
    const logMsg = `[${timestamp()}] [${type.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(path.join(LOGS_DIR, 'bot.log'), logMsg, 'utf8');
    console.log(logMsg.trim());
  },

  /**
   * Backup a JSON file
   */
  backupFile: (filePath) => {
    if (!fs.existsSync(filePath)) return false;
    const fileName = path.basename(filePath);
    const backupName = `${fileName.replace('.json', '')}_${Date.now()}.bak.json`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    fs.copyFileSync(filePath, backupPath);
    AdminCore.logEvent('BACKUP', `Created backup for ${fileName}`);
    return backupPath;
  },

  /**
   * Send a mod alert message
   */
  async sendAlert(client, title, description) {
    try {
      const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
      if (!channel) return;
      const embed = new EmbedBuilder()
        .setTitle(`⚠️ ${title}`)
        .setDescription(description)
        .setColor('#ff0000')
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to send alert:', err);
    }
  },

  /**
   * Initialize periodic backups (every X minutes)
   */
  startAutoBackup: (filePath, minutes = 60) => {
    setInterval(() => {
      AdminCore.backupFile(filePath);
    }, minutes * 60 * 1000);
    AdminCore.logEvent('INIT', `Auto-backup started for ${filePath} every ${minutes} min`);
  }
};

module.exports = AdminCore;