const { SlashCommandBuilder } = require('discord.js');
const { wisdomResponses } = require('../../responses.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wisdom')
		.setDescription('Get some wisdom from the one and only Donald J. Trump.'),
	async execute(interaction) {
		await interaction.reply(wisdomResponses[Math.floor(Math.random() * wisdomResponses.length)]);
	},
};
