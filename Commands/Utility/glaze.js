const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('glaze')
		.setDescription('Yes I am Donald Trump. I am the best bot to exist.'),
	async execute(interaction) {
		await interaction.reply('Yes, hello, I am the best, no need to remind me. I am so very rich and famous. Thank you.');
	},
};
