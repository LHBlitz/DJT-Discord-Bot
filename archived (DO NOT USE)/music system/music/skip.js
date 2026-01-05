const { SlashCommandBuilder } = require('discord.js');
const music = require('../../musicManager');

module.exports = {
    data: new SlashCommandBuilder().setName('skip').setDescription('Skip current track'),
    async execute(interaction) {
        const member = interaction.member;
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel', ephemeral: true });
        const ok = music.skip(interaction.guildId);
        return interaction.reply({ content: ok ? 'Skipped.' : 'Nothing to skip.', ephemeral: true });
    }
};