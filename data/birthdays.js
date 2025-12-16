const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'birthdays.json');

let birthdays = {};
if (fs.existsSync(filePath)) birthdays = JSON.parse(fs.readFileSync(filePath));

function save() {
  fs.writeFileSync(filePath, JSON.stringify(birthdays, null, 2));
}

function setBirthday(userId, guildId, month, day, year, timezone) {
  if (!birthdays[guildId]) birthdays[guildId] = {};

  birthdays[guildId][userId] = {
    month,
    day,
    year,
    timezone,
    lastCelebrated: birthdays[guildId][userId]?.lastCelebrated ?? null
  };

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

function getBirthdaysForGuild(guildId) {
  const guildData = birthdays[guildId];
  if (!guildData) return [];

  return Object.entries(guildData).map(([userId, data]) => ({
    userId,
    ...data
  }));
}

function markCelebrated(userId, guildId, year) {
  if (!birthdays[guildId]?.[userId]) return;
  birthdays[guildId][userId].lastCelebrated = year;
  save();
}

module.exports = {
  setBirthday,
  removeBirthday,
  getBirthday,
  getUpcomingBirthdays,
  getBirthdaysForGuild,
  markCelebrated,
};
