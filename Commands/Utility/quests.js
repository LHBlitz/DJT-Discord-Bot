// Commands/Utility/quests.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quests')
        .setDescription('Use this code to automatically complete Discord Quests.'),
    async execute(interaction) {
        await interaction.reply('https://gist.github.com/aamiaa/204cd9d42013ded9faf646fae7f89fbb');
    },
};