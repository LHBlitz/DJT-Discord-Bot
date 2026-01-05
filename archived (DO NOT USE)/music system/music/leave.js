const { SlashCommandBuilder } = require('discord.js');
const music = require('../../musicManager');

module.exports = {
    data: new SlashCommandBuilder().setName('leave').setDescription('Force bot to leave voice channel'),
    async execute(interaction) {
        const ok = music.leave(interaction.guildId);
        return interaction.reply({ content: ok ? 'Left voice channel.' : 'Not in a voice channel.', ephemeral: true });
    }
};