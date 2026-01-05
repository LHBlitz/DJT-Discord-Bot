const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('selfdeport')
		.setDescription('Turn yourself in'),
	async execute(interaction) {
		const member = interaction.member;

		if (!member.kickable) {
			return interaction.reply({ content: '', flags: MessageFlags.Ephemeral });
		}

		try {
			await interaction.user.send('GET THE FUCK OUT');
		}
		catch {
			console.warn(`Could not DM ${interaction.user.tag}.`);
		}

		try {
			await interaction.reply({ content: `${interaction.user.tag}` });
			await member.kick();
		}
		catch {
			await interaction.followUp({ content: '', flags: MessageFlags.Ephemeral });
		}
	},

};
