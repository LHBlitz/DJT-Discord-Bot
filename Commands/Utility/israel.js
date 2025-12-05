const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('israel')
		.setDescription('Remind the Don to send Israel more money'),
	async execute(interaction) {
		await interaction.reply('Yes, Israel! Here Netanyahu, this $12 Billion is yours!');
	},
};
