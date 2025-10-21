// commands/Utility/testap.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testap')
        .setDescription('For devs only to test the AP feed.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xffcc00)
            .setTitle('🗞️ TEST: AP Politics Bot Working!')
            .setDescription('This is a test post to verify the RSS integration.')
            .setURL('https://apnews.com/politics')
            .setTimestamp(new Date())
            .setFooter({
                text: 'AP Politics (Test)',
                iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Associated_Press_logo_2012.svg/512px-Associated_Press_logo_2012.svg.png',
            })
            .setImage('https://upload.wikimedia.org/wikipedia/commons/4/44/US_Capitol_west_side.JPG');

        await interaction.reply({ embeds: [embed] });
    },
};