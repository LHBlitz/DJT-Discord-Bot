const fs = require('fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trumpsays')
        .setDescription('Listen to what the Don has to say.'),

    async execute(interaction) {
        // Read all audio files: .mp3 and .flac
        const clips = fs.readdirSync('./audio').filter(file =>
            file.endsWith('.mp3') || file.endsWith('.flac')
        );

        if (clips.length === 0) return interaction.reply("America LOVES to hear me talk, but I have nothing to say right now.");

        // Pick a random clip
        const clipName = clips[Math.floor(Math.random() * clips.length)];

        // Send the audio file as an attachment
        const file = new AttachmentBuilder(`./audio/${clipName}`);
        await interaction.reply({ content: `Trump clip: **${clipName.replace(/\.(mp3|flac)/,'')}**`, files: [file] });
    },
};