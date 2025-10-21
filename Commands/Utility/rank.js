const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const xpFile = path.join(__dirname, '../../data/xp.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your or another user’s level and XP.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;

    // If the file doesn't exist, return early
    if (!fs.existsSync(xpFile)) {
      return interaction.reply({ content: 'No XP data found yet!', flags: 1 << 6 });
    }

    const xpData = JSON.parse(fs.readFileSync(xpFile, 'utf8'));
    const userData = xpData[target.id];

    if (!userData) {
      return interaction.reply({ content: `${target.username} has no XP yet!`, flags: 1 << 6 });
    }

    const { xp, level } = userData;
    const nextLevelXp = level * 100; // XP needed to level up
    const progress = Math.min((xp / nextLevelXp) * 100, 100).toFixed(1);

    const embed = new EmbedBuilder()
      .setColor('#00AAFF')
      .setAuthor({ name: `${target.username}'s Rank`, iconURL: target.displayAvatarURL() })
      .addFields(
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${xp} / ${nextLevelXp}`, inline: true },
        { name: 'Progress', value: `${progress}%`, inline: true }
      )
      .setFooter({ text: 'Keep chatting to level up!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
