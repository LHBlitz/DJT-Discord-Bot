const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const postedArticlesFile = path.join(__dirname, '../../postedArticles.json');
const roleCacheFile = path.join(__dirname, '../../rolecache.json');

const FEED_CHANNEL_ID = '1374873902437761086';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check the status of the bot and it\'s key features.'),
    async execute(interaction) {
        // ----- Uptime -----
        const uptimeSeconds = process.uptime();
        const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${Math.floor(uptimeSeconds % 60)}s`;

        // ----- Role Cache -----
        let roleCacheCount = 0;
        let roleCacheHealthy = true;
        if (fs.existsSync(roleCacheFile)) {
            try {
                roleCacheCount = Object.keys(JSON.parse(fs.readFileSync(roleCacheFile, 'utf8'))).length;
            } catch (err) {
                roleCacheCount = -1;
                roleCacheHealthy = false;
            }
        } else {
            roleCacheHealthy = false;
        }

        // ----- Articles / Feed -----
        let lastArticlesCount = 0;
        let lastFeedCheck = 'N/A';
        let feedHealthy = true;
        if (fs.existsSync(postedArticlesFile)) {
            try {
                const postedArticles = JSON.parse(fs.readFileSync(postedArticlesFile, 'utf8'));
                lastArticlesCount = postedArticles.length;
                if (postedArticles.length > 0) {
                    lastFeedCheck = new Date().toLocaleString();
                }
            } catch (err) {
                lastArticlesCount = -1;
                feedHealthy = false;
            }
        } else {
            feedHealthy = false;
        }

        // ----- Channel Checks -----
        const feedChannel = interaction.client.channels.cache.get(FEED_CHANNEL_ID);
        const feedChannelHealthy = !!feedChannel;

        // ----- Overall Health -----
        let healthStatus = '✅ Excellent';
        const issues = [];
        if (!roleCacheHealthy) issues.push('Role Cache');
        if (!feedHealthy) issues.push('Feed');
        if (!feedChannelHealthy) issues.push('Feed Channel');

        if (issues.length === 1) healthStatus = '⚠️ Minor Issues';
        else if (issues.length > 1) healthStatus = '❌ Major Issues';

        // ----- Embed -----
        const embed = new EmbedBuilder()
            .setTitle('🛠 Trump Bot Status')
            .setColor(0xffcc00)
            .setDescription(`**Health:** ${healthStatus}${issues.length > 0 ? `\nIssues: ${issues.join(', ')}` : ''}`)
            .addFields(
                { name: 'Uptime', value: uptime, inline: true },
                { name: 'Role Cache Entries', value: roleCacheCount >= 0 ? roleCacheCount.toString() : 'Error', inline: true },
                { name: 'Articles Stored', value: lastArticlesCount >= 0 ? lastArticlesCount.toString() : 'Error', inline: true },
                { name: 'Last Feed Check', value: lastFeedCheck, inline: true },
                { name: 'Feed Channel Exists', value: feedChannelHealthy ? '✅ Yes' : '❌ No', inline: true },
                { name: 'Commands Loaded', value: interaction.client.commands.size.toString(), inline: true }
            )
            .setFooter({ text: 'Trump Bot Status', iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: false }); // public output
    },
};