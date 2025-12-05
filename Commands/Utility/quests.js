const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('quests')
        .setDescription('Use this script to automatically complete Discord Quests.'),
    async execute(interaction) {

        const reply = `

Note: This script requires the Discord desktop app. It doesn't work on the web, mobile and Vencord browser based app.
https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb
        `;


        await interaction.reply(reply);
    },
};
