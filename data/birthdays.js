const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'birthdays.json');

let birthdays = {};
if (fs.existsSync(filePath)) birthdays = JSON.parse(fs.readFileSync(filePath));

function save() {
  fs.writeFileSync(filePath, JSON.stringify(birthdays, null, 2));
}

function setBirthday(userId, guildId, month, day, timezone) {
  if (!birthdays[guildId]) birthdays[guildId] = {};
  birthdays[guildId][userId] = { month, day, timezone };
  save();
}

function removeBirthday(userId, guildId) {
  if (birthdays[guildId]?.[userId]) {
    delete birthdays[guildId][userId];
    save();
  }
}

function getBirthday(userId, guildId) {
  return birthdays[guildId]?.[userId] || null;
}

function getUpcomingBirthdays(guildId) {
  if (!birthdays[guildId]) return [];
  return Object.entries(birthdays[guildId]).map(([userId, data]) => ({
    userId,
    ...data
  }));
}

module.exports = { setBirthday, removeBirthday, getBirthday, getUpcomingBirthdays };