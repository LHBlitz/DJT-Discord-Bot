const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../data/levels.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setxp')
    .setDescription('Set a user\'s XP (admin only). Accepts negative values.')
    .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(opt => opt.setName('xp').setDescription('XP value (can be negative)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const xpVal = interaction.options.getInteger('xp');

    let levels = {};
    try { if (fs.existsSync(filePath)) levels = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) {
      console.error(e);
      return interaction.reply({ content: 'Failed to read levels file.', ephemeral: true });
    }

    if (!levels[target.id]) levels[target.id] = { xp: 0, level: 0 };

    levels[target.id].xp = xpVal;

    try { fs.writeFileSync(filePath, JSON.stringify(levels, null, 2)); } catch (e) {
      console.error(e);
      return interaction.reply({ content: 'Failed to write levels file.', ephemeral: true });
    }

    console.log(`ADMIN SETXP: ${interaction.user.tag} set ${target.tag} (${target.id}) XP to ${xpVal}`);
    return interaction.reply({ content: `Set ${target.tag}'s XP to ${xpVal}.`, ephemeral: true });
  },
};