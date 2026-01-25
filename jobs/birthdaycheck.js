const cron = require("node-cron");
const { getBirthdaysForGuild, markCelebrated } = require("../data/birthdays");
const { EmbedBuilder } = require("discord.js");

module.exports = function startBirthdayJob(client) {
  cron.schedule("* * * * *", async () => {
    const nowUTC = new Date();

    for (const guild of client.guilds.cache.values()) {
      const birthdays = getBirthdaysForGuild(guild.id);

      const announcementChannel = guild.channels.cache.get("");
      if (!announcementChannel) continue;

      const birthdayRole = guild.roles.cache.find(r => r.name === "Birthday");

      for (const b of birthdays) {
        const local = new Date(
          nowUTC.toLocaleString("en-US", { timeZone: b.timezone })
        );

        if (
          local.getMonth() + 1 !== b.month ||
          local.getDate() !== b.day ||
          b.lastCelebrated === local.getFullYear()
        ) continue;

        const member = await guild.members.fetch(b.userId).catch(() => null);
        if (!member) continue;

        const age = b.year ? local.getFullYear() - b.year : null;

        const embed = new EmbedBuilder()
          .setTitle("Happy Birthday!")
          .setDescription(`Happy birthday, ${member}! You just turned ${age}. Thank you for being a true PATRIOT and helping keep America safe from the RADICAL lefties. God bless you, God bless America, and happy birthday.`)
          .setColor("Gold")
          .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }));

        await announcementChannel.send({ embeds: [embed] });

        if (birthdayRole) {
          await member.roles.add(birthdayRole).catch(() => {});
        }

        markCelebrated(b.userId, guild.id, local.getFullYear());
      }

      if (birthdayRole) {
        for (const member of birthdayRole.members.values()) {
          const record = birthdays.find(b => b.userId === member.id);
          if (!record) continue;

          const local = new Date(
            nowUTC.toLocaleString("en-US", { timeZone: record.timezone })
          );

          if (
            local.getMonth() + 1 !== record.month ||
            local.getDate() !== record.day
          ) {
            await member.roles.remove(birthdayRole).catch(() => {});
          }
        }
      }
    }
  });

  console.log("[BirthdayJob] Started");
};
