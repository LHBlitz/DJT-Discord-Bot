const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Shows how long DJT has been online for'),

	async execute(interaction) {
		const seconds = Math.floor(process.uptime());
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;

		await interaction.reply(`Uptime: ${h}h ${m}m ${s}s`);
	},
};
