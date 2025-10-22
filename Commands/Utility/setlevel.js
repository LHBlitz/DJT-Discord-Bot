const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data');
const filePath = path.join(dataPath, 'levels.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user’s level (admin only) — accepts negative levels, keeps XP')
    .addUserOption(opt => opt.setName('user').setDescription('The user').setRequired(true))
    .addIntegerOption(opt => opt.setName('level').setDescription('The level to set (can be negative)').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const newLevel = interaction.options.getInteger('level');

    // Load levels file safely
    let levels = {};
    try {
      if (fs.existsSync(filePath)) levels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error('Error reading levels.json:', err);
      return interaction.reply({ content: '❌ Failed to read levels file.', ephemeral: true });
    }

    if (!levels[target.id]) levels[target.id] = { xp: 0, level: 0 };

    // Set new level (can be negative)
    levels[target.id].level = newLevel;

    try {
      fs.writeFileSync(filePath, JSON.stringify(levels, null, 2));
    } catch (err) {
      console.error('Error writing levels.json:', err);
      return interaction.reply({ content: '❌ Failed to write levels file.', ephemeral: true });
    }

    // Optional: log the change to console for audit
    console.log(`ADMIN SETLEVEL: ${interaction.user.tag} set ${target.tag} (${target.id}) to level ${newLevel}`);

    return interaction.reply({ content: `✅ Set ${target.tag}'s level to ${newLevel} (XP unchanged).`, ephemeral: true });
  },
};