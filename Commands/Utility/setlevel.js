const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data');
const filePath = path.join(dataPath, 'levels.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('Set a user’s level (admin only, keeps XP)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to modify')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('The level to set')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // only admins can use

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const newLevel = interaction.options.getInteger('level');

    if (newLevel < 1) return interaction.reply({ content: '❌ Level must be at least 1.', ephemeral: true });

    // Load levels.json safely
    let levels = {};
    try {
      if (fs.existsSync(filePath)) {
        levels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (err) {
      console.error('Error reading levels.json:', err);
      return interaction.reply({ content: '❌ Failed to read levels file.', ephemeral: true });
    }

    if (!levels[target.id]) levels[target.id] = { xp: 0, level: 1 };

    // Set new level but keep XP
    levels[target.id].level = newLevel;

    // Save back to file
    try {
      fs.writeFileSync(filePath, JSON.stringify(levels, null, 2));
    } catch (err) {
      console.error('Error writing levels.json:', err);
      return interaction.reply({ content: '❌ Failed to write levels file.', ephemeral: true });
    }

    return interaction.reply({ content: `✅ Set ${target.tag}'s level to ${newLevel}, XP unchanged.`, ephemeral: false });
  },
};