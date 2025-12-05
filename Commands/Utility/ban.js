const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a non-American USERPER.')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addUserOption(option =>
			option.setName('target')
				.setDescription('The Terrorist to exterminate')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Reason for extermination')
				.setRequired(false)),
	async execute(interaction) {
		const targetUser = interaction.options.getUser('target');
		const reason = interaction.options.getString('reason') || 'No reason provided';

		const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

		if (!member) {
			return interaction.reply({ content: 'I am the best. However, I cannot bring down the hammer of AMERICAN JUSTICE to someone who is not in this server.', flags: MessageFlags.Ephemeral });
		}

		if (!member.bannable) {
			return interaction.reply({ content: 'This person is from Israel. I cannot EXTERMINATE them using the WILL of GOD. Choose someone who isnt Jewsish please.', flags: MessageFlags.Ephemeral });
		}

		try {
			await member.ban({ reason });
			await interaction.reply(`💥 **${targetUser.tag}** has been EXTERIMINATED by THREE FIGHTER JET MISSILES.\nReason: ${reason}`);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'In my old age, Ive had a sudden stroke that has made me not able to ban this user.', flags: MessageFlags.Ephemeral });
		}
	},
};
