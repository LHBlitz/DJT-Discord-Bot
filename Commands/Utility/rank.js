const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const filePath = path.join('C:/Users/hersw/Downloads/DJT-Discord-Bot-main/data/levels.json');
const fontPath = path.join(__dirname, '../assets/fonts/Poppins-SemiBold.ttf');

GlobalFonts.registerFromPath(fontPath, 'Poppins');

function getXPNeeded(level) {
  return Math.floor(100 * Math.pow(1.25, level));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check a user\'s level and XP')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;

    let levels = {};
    try {
      if (fs.existsSync(filePath)) {
        levels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (err) {
      console.error('Error reading levels.json:', err);
      return interaction.reply({ content: 'Failed to read levels data.', ephemeral: true });
    }

    if (!levels[target.id]) {
      return interaction.reply({ content: `No XP data found for ${target.tag} yet!`, ephemeral: true });
    }

    const { xp, level } = levels[target.id];
    const nextXP = getXPNeeded(level);
    const progress = Math.min(xp / nextXP, 1);

    const canvas = createCanvas(900, 300);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 900, 300);
    gradient.addColorStop(0, '#ff416c');
    gradient.addColorStop(1, '#ff4b2b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 300);

    const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 50, 200, 200);
    ctx.restore();

    ctx.font = 'bold 70px "Poppins"';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 25;
    ctx.fillText(target.username, 300, 120);

    ctx.shadowBlur = 0;
    ctx.font = '32px "Poppins"';
    ctx.fillStyle = '#f2f2f2';
    ctx.fillText(`Level ${level}`, 300, 180);
    ctx.fillText(`XP: ${xp} / ${nextXP}`, 300, 220);

    const barX = 300, barY = 240, barWidth = 500, barHeight = 25;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'rank.png' });

    return interaction.reply({ files: [attachment] });
  },
};