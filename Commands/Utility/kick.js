const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deport')
        .setDescription('Deports a HISPANIC from this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The individual you wish to deport out of this Holy land')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for deportation (YOU DO NOT HAVE TO GIVE A REASON)')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'My eye sight is getting bad in my old age. Not even Abe could see the shit im seeing. I cant deport this guy.', flags: MessageFlags.Ephemeral });
        }

        if (!member.kickable) {
            return interaction.reply({ content: 'I, Donald J. Trump, the best, are not able to deport this individual. The courts have ruled in their favor. I am pissed.', flags: MessageFlags.Ephemeral });
        }

        try {
            const invite = await interaction.channel.createInvite({
                maxAge: 0,
                maxUses: 0,
                temporary: false,
                unique: true,
            });

            const messageContent = `OFF TO ALLIGATOR ALCATRAZ WITH YOU \n\n\n${invite.url}`;

            await targetUser.send(messageContent);
        }
        catch (err) {
            console.error(err);

            try {
                await targetUser.send('TO ALLIGATOR ALCATRAZ WITH YOU \n\n\nhttps://discord.gg/yUuHx7CKQ8OFF');
            }
            catch {
                console.warn(`Could not DM ${targetUser.tag}.`);
            }
        }


        try {
            await member.kick(reason);
            await interaction.reply(`**${targetUser.tag}** has been DEPORTED!!!!💥🔨\nReason: ${reason}`);
        }
        catch {
            await interaction.reply({ content: 'something went wrong during the deportation process, the fucking courts are to blame', flags: MessageFlags.Ephemeral });
        }
    },
};
