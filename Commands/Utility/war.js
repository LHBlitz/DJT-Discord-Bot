const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('declarewar')
		.setDescription('Declare war against someone...')
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The user to declare war to...')
				.setRequired(true)),
	async execute(interaction) {
		const targetUser = interaction.options.getUser('target');

		try {
			await targetUser.send(
				'They saying we might go to war. Its crazy cuz ever since we stopped talking, ive been at war with myself. Idk why but this lran shit got me thinking about how I ran from your love. Hope everything is good with you tho shorty, be safe out there',
			);

			await interaction.reply({
				content: `Declared war against ${targetUser.tag}.`,
				flags: MessageFlags.Ephemeral,
			});
		}
		
		catch (error) {
			console.warn(`Declare war request blocked: ${interaction.user.tag} → ${targetUser.tag}`);

			await interaction.reply({
				content: `Couldn't declare war against ${targetUser.tag}.`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};