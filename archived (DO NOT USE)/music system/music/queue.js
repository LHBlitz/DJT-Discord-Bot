const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const music = require('../../musicManager');

module.exports = {
    data: new SlashCommandBuilder().setName('queue').setDescription('Show current queue'),
    async execute(interaction) {
        const q = music.getQueue(interaction.guildId);
        if (!q || (!q.playing && q.songs.length === 0)) return interaction.reply({ content: 'Queue is empty.', ephemeral: true });
        const now = q.playing && q.songs.length ? q.songs[0] : null;
        const upcoming = q.songs.slice(0, 10);
        const embed = new EmbedBuilder().setTitle('Queue').setDescription(now ? `Now: ${now.title}` : 'Now: none');
        if (upcoming.length) embed.addFields({ name: 'Up next', value: upcoming.map((s, i) => `${i+1}. ${s.title}`).join('\n') });
        return interaction.reply({ embeds: [embed] });
    }
};