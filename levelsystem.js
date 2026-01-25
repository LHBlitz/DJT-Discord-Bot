const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data');
if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath);
const filePath = path.join(dataPath, 'levels.json');

let levels = fs.existsSync(filePath)
  ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
  : {};

GlobalFonts.registerFromPath(
  path.join(__dirname, '../assets/fonts/Poppins-SemiBold.ttf'),
  'Poppins'
);

function getXPNeeded(level) {
  const safeLevel = Math.max(level, 1);
  return Math.floor(100 * Math.pow(1.25, safeLevel));
}

const BOOSTED_USERS = [
  '',
];
const XP_MULTIPLIER = -999; 

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    if (!levels[userId]) levels[userId] = { xp: 0, level: 1 };

    let xpGain = Math.floor(Math.random() * 15) + 5;
    console.log(xpGain);

    if (BOOSTED_USERS.includes(userId)) {
      xpGain *= XP_MULTIPLIER;
    }

    levels[userId].xp += xpGain;

    const nextXP = getXPNeeded(levels[userId].level);
    if (levels[userId].xp >= nextXP) {
      levels[userId].xp -= nextXP;
      levels[userId].level++;

      const canvas = createCanvas(900, 300);
      const ctx = canvas.getContext('2d');

      const avatar = await loadImage(
        message.author.displayAvatarURL({ extension: 'png', size: 512 })
      );

      const gradient = ctx.createLinearGradient(0, 0, 900, 300);
      gradient.addColorStop(0, '#ff416c');
      gradient.addColorStop(1, '#ff4b2b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 900, 300);

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
      ctx.fillText('LEVEL UP!', 300, 150);

      ctx.shadowBlur = 0;
      ctx.font = '32px "Poppins"';
      ctx.fillStyle = '#f2f2f2';
      ctx.fillText(`You are now Level ${levels[userId].level}`, 300, 220);

      const barX = 300, barY = 240, barWidth = 500, barHeight = 25;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      let progress = 0;
      const step = () => {
        if (progress < 1) {
          progress += 0.05;
          ctx.fillStyle = '#00ffcc';
          ctx.fillRect(barX, barY, barWidth * progress, barHeight);
          return true;
        }
        return false;
      };

      for (let i = 0; i <= 20; i++) step();

      const attachment = new AttachmentBuilder(await canvas.encode('png'), {
        name: 'levelup.png',
      });

      await message.channel.send({
        content: `Good shit,${message.author}! Your patriot level is now **Level ${levels[userId].level}**!`,
        files: [attachment],
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(levels, null, 2));
  });
};

