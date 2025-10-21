const { EmbedBuilder } = require('discord.js');

// CONFIG
const ADMIN_ID = 'YOUR_DISCORD_ID_HERE'; // your user ID to ping
const ALERT_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE'; // the dedicated alerts channel

module.exports = (client) => {
  const sendAlert = async (title, description) => {
    try {
      const channel = await client.channels.fetch(ALERT_CHANNEL_ID);
      if (!channel) return console.error('⚠️ Alert channel not found.');

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(`🚨 ${title}`)
        .setDescription(description)
        .setTimestamp();

      await channel.send({ content: `<@${ADMIN_ID}>`, embeds: [embed] });
    } catch (err) {
      console.error('Failed to send alert:', err);
    }
  };

  // ---- 🧠 BOT HEALTH / CORE MONITORING ----

  // General errors
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    sendAlert('Uncaught Exception', `\`\`\`${err.stack || err.message}\`\`\``);
  });

  // Unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    sendAlert('Unhandled Rejection', `\`\`\`${reason}\`\`\``);
  });

  // API or request errors (optional hook)
  client.on('apiRequest', (request) => {
    if (request.error) {
      sendAlert('API Request Error', `\`\`\`${request.error}\`\`\``);
    }
  });

  // Discord rate limit
  client.rest.on('rateLimited', (info) => {
    sendAlert('Rate Limit Hit', `Bot is being rate-limited.\nTimeout: ${info.timeout}ms`);
  });

  // ---- 🔒 SECURITY / ADMIN ALERTS ----

  // Unauthorized command attempts
  client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') && !message.content.startsWith('/')) return;

    // Example: Protect a fake admin command
    if (message.content.startsWith('!shutdown') || message.content.startsWith('/shutdown')) {
      if (message.author.id !== ADMIN_ID) {
        sendAlert(
          'Unauthorized Command Attempt',
          `User <@${message.author.id}> tried to use a restricted command in <#${message.channel.id}>.\nContent: \`${message.content}\``
        );
      }
    }
  });

  // Bot permission / removal alerts
  client.on('guildDelete', (guild) => {
    sendAlert('Bot Removed From Server', `❌ Left **${guild.name}** (${guild.id})`);
  });

  client.on('error', (err) => {
    sendAlert('Client Error', `\`\`\`${err.stack || err.message}\`\`\``);
  });

  console.log('✅ ErrorPing system initialized.');
};