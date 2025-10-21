const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const mm = require('music-metadata');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trumpsays')
        .setDescription('Listen to what the Don has to say.'),

    async execute(interaction) {
        // Get all MP3 and FLAC files
        const clips = fs.readdirSync('./audio').filter(file =>
            file.endsWith('.mp3') || file.endsWith('.flac')
        );

        if (clips.length === 0) return interaction.reply("No audio clips found!");

        // Pick a random clip
        const clipName = clips[Math.floor(Math.random() * clips.length)];
        const filePath = path.join('./audio', clipName);
        const audioFile = new AttachmentBuilder(filePath);

        let embed = new EmbedBuilder()
            .setTitle(`Trump clip: ${clipName.replace(/\.(mp3|flac)/, '')}`)
            .setColor(0xffcc00);

        // Handle MP3 cover art
        let tempCoverPath = null;
        if (clipName.endsWith('.mp3')) {
            try {
                const metadata = await mm.parseFile(filePath);
                if (metadata.common.picture && metadata.common.picture.length > 0) {
                    const pic = metadata.common.picture[0];
                    tempCoverPath = path.join('./audio', 'cover_temp.png');
                    fs.writeFileSync(tempCoverPath, pic.data); // save picture as PNG
                    const coverAttachment = new AttachmentBuilder(tempCoverPath);
                    embed.setThumbnail('attachment://cover_temp.png');

                    await interaction.reply({ embeds: [embed], files: [audioFile, coverAttachment] });

                    // Clean up temporary file
                    fs.unlinkSync(tempCoverPath);
                    return;
                }
            } catch (err) {
                console.error('Error reading metadata:', err);
            }
        }

        // If no cover art or non-MP3, just send audio
        await interaction.reply({ embeds: [embed], files: [audioFile] });
    },
};