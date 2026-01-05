const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jomar')
		.setDescription('Remind him that he is not supposed to be in this country'),
	async execute(interaction) {
		await interaction.reply('');
	},
};

