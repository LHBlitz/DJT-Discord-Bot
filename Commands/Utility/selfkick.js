// Commands/Utility/selfkick.js

const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('selfdeport')
		.setDescription('Turn yourself in'),
	async execute(interaction) {
		const member = interaction.member;

		if (!member.kickable) {
			return interaction.reply({ content: 'What? Why would want to do this? Donny wants to keep the whites in this country...', flags: MessageFlags.Ephemeral });
		}

		try {
			await interaction.user.send('GET THE FUCK OUT');
		}
		catch {
			console.warn(`Could not DM ${interaction.user.tag}.`);
		}

		try {
			await interaction.reply({ content: `GET THE FUCK OUT OF MY COUNTRY ${interaction.user.tag}     FAGGOT` });
			await member.kick();
		}
		catch {
			await interaction.followUp({ content: 'I COULDNT DEPORT YOU NIGGA', flags: MessageFlags.Ephemeral });
		}
	},
};