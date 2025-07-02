// Commands/Utility/glaze.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jomar')
		.setDescription('Remind him that he is not supposed to be in this country'),
	async execute(interaction) {
		await interaction.reply('<@827174001049862164>, get out of my COUNTRY!!! You do not have LEGAL CITIZENSHIP! That green card doesnt mean shit when youre a fucking mex!');
	},
};
