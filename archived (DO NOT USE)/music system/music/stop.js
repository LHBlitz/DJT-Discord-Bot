const { SlashCommandBuilder } = require('discord.js');
const music = require('../../musicManager');

module.exports = {
    data: new SlashCommandBuilder().setName('stop').setDescription('Stop and clear the queue'),
    async execute(interaction) {
        const member = interaction.member;
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel', ephemeral: true });
        const ok = music.stop(interaction.guildId);
        return interaction.reply({ content: ok ? 'Stopped and cleared queue.' : 'Nothing was playing.', ephemeral: true });
    }
};