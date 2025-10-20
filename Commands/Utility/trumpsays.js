const fs = require('fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trumpsays')
        .setDescription('Listen to what the Don has to say'),

    async execute(interaction) {
        // Read all MP3 files in the audio folder
        const clips = fs.readdirSync('./audio').filter(file => file.endsWith('.mp3'));
        if (clips.length === 0) return interaction.reply("No audio clips found!");

        // Pick a random clip
        const clipName = clips[Math.floor(Math.random() * clips.length)];

        // Send the audio file as an attachment
        const file = new AttachmentBuilder(`./audio/${clipName}`);
        await interaction.reply({ content: `Trump clip: **${clipName.replace('.mp3','')}**`, files: [file] });
    },
};