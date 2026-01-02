const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const music = require('../../musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a YouTube link or search term')
        .addStringOption(opt => opt.setName('query').setDescription('URL or search').setRequired(true)),
    async execute(interaction) {
        const query = interaction.options.getString('query');
        const member = interaction.member;
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel', ephemeral: true });
        await interaction.deferReply();
        try {
            const song = await music.enqueue(interaction.guildId, voiceChannel, interaction.channel, query, interaction.user.tag);
            const embed = new EmbedBuilder().setTitle(song.title).setDescription(`Queued: ${song.title}`).setURL(song.url || song.streamUrl);
            if (song.thumbnail) embed.setImage(song.thumbnail);
            return interaction.editReply({ embeds: [embed] });
        } catch (err) {
            return interaction.editReply({ content: 'Failed to add track: ' + (err.message || String(err)) });
        }
    }
};