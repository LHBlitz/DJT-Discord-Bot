const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const filePath = path.join('C:/Users/hersw/Downloads/DJT-Discord-Bot-main/data/levels.json');
const fontPath = path.join(__dirname, '../../assets/Poppins-SemiBold.ttf');
GlobalFonts.registerFromPath(fontPath, 'Poppins');

function getXPNeeded(level) {
  return Math.floor(100 * Math.pow(1.25, level));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Shows a visual leaderboard of the top 10 users'),

  async execute(interaction) {
    await interaction.deferReply();

    let levels = {};
    try {
      if (fs.existsSync(filePath)) {
        levels = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (err) {
      console.error('Error reading levels.json:', err);
      return interaction.editReply({ content: '❌ Failed to read levels data.' });
    }

    const users = Object.entries(levels);
    if (users.length === 0) {
      return interaction.editReply({ content: 'No XP data found yet!' });
    }

    // Sort descending by level then XP
    users.sort(([, a], [, b]) => b.level - a.level || b.xp - a.xp);
    const topUsers = users.slice(0, 10);

    // Dynamic canvas dimensions
    const width = 1000;
    const rowHeight = 100;
    const paddingTop = 150;
    const height = paddingTop + topUsers.length * rowHeight + 50; // extra padding at bottom
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load US flag as background
    try {
      const flag = await loadImage(path.join(__dirname, '../../assets/american_flag.png'));

      // Scale flag to fill width, maintain aspect ratio
      const scale = width / flag.width;
      const scaledHeight = flag.height * scale;
      ctx.drawImage(flag, 0, 0, width, scaledHeight);

      // Optional overlay for readability
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, width, height);
    } catch {
      console.warn('American flag image not found, using gradient.');
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#ff416c');
      gradient.addColorStop(1, '#ff4b2b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Title
    ctx.font = 'bold 50px "Poppins"';
    ctx.fillStyle = '#fff';
    ctx.fillText('Leaderboard', 50, 60);

    // Draw each user
    let y = paddingTop;
    for (let i = 0; i < topUsers.length; i++) {
      const [userId, data] = topUsers[i];
      const level = data.level;
      const xp = data.xp;
      const nextXP = getXPNeeded(level);
      const progress = Math.min(xp / nextXP, 1);

      // Load avatar
      let avatar;
      try {
        const user = await interaction.client.users.fetch(userId);
        avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 128 }));
      } catch { avatar = null; }

      if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(60, y + rowHeight / 2, 40, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 20, y + 10, 80, 80);
        ctx.restore();
      }

      // Username + Level
      ctx.font = 'bold 28px "Poppins"';
      ctx.fillStyle = '#fff';
      let username = userId;
      try {
        const user = await interaction.client.users.fetch(userId);
        username = user.username;
      } catch {}
      ctx.fillText(`${i + 1}. ${username}`, 120, y + rowHeight / 2 + 10);
      ctx.fillText(`Level ${level} | XP: ${xp}`, 400, y + rowHeight / 2 + 10);

      // XP bar
      const barX = 400;
      const barY = y + rowHeight / 2 + 20;
      const barWidth = 500;
      const barHeight = 15;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = '#00ffcc';
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);

      y += rowHeight;
    }

    const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'leaderboard.png' });
    return interaction.editReply({ files: [attachment] });
  },
};