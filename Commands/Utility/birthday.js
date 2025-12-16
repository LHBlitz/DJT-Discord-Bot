const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  setBirthday,
  removeBirthday,
  getBirthday,
  getUpcomingBirthdays
} = require("../../data/birthdays");

const northAmericaTimezones = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Manage birthday settings")
    .addSubcommand(sub =>
      sub.setName("set")
        .setDescription("Set your birthday")
        .addIntegerOption(o =>
          o.setName("month").setRequired(true).setDescription("1-12"))
        .addIntegerOption(o =>
          o.setName("day").setRequired(true).setDescription("1-31"))
        .addStringOption(o =>
          o.setName("timezone")
            .setRequired(true)
            .setDescription("Select your timezone")
            .addChoices(
              ...northAmericaTimezones.map(tz => ({ name: tz, value: tz }))
            )
        )
    )
    .addSubcommand(sub =>
  sub.setName("remove")
    .setDescription("Remove your birthday."))
.addSubcommand(sub =>
  sub.setName("view")
    .setDescription("View your saved birthday."))
.addSubcommand(sub =>
  sub.setName("upcoming")
    .setDescription("See upcoming birthdays."))
.addSubcommand(sub =>
  sub.setName("timezones")
    .setDescription("See a list of valid North American timezones."))
.addSubcommand(sub =>
  sub.setName("world")
    .setDescription("View timezones from all over the world.")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "set") {
      const month = interaction.options.getInteger("month");
      const day = interaction.options.getInteger("day");
      const timezone = interaction.options.getString("timezone");

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return interaction.reply({ content: "Invalid date.", ephemeral: true });
      }

      try {
        Intl.DateTimeFormat("en-US", { timeZone: timezone });
      } catch {
        return interaction.reply({ content: "Invalid timezone.", ephemeral: true });
      }

      setBirthday(interaction.user.id, interaction.guild.id, month, day, timezone);

      return interaction.reply({
        content: "Birthday saved!",
        ephemeral: true
      });
    }

    if (sub === "remove") {
      removeBirthday(interaction.user.id, interaction.guild.id);
      return interaction.reply({
        content: "Birthday removed.",
        ephemeral: true
      });
    }

    if (sub === "view") {
      const b = getBirthday(interaction.user.id, interaction.guild.id);
      if (!b) {
        return interaction.reply({ content: "You don't have a birthday set.", ephemeral: true });
      }

      return interaction.reply({
        content: `Your birthday is **${b.month}/${b.day}** (${b.timezone})`,
        ephemeral: true
      });
    }

    if (sub === "upcoming") {
      const list = getUpcomingBirthdays(interaction.guild.id);
      if (!list.length) {
        return interaction.reply({ content: "No upcoming birthdays.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle("Upcoming Birthdays")
        .setDescription(
          list.map(b => `<@${b.userId}> — **${b.month}/${b.day}**`).join("\n")
        )
        .setColor("Gold");

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "world") {
  return interaction.reply({
    content: "View all worldwide timezones here: https://momentjs.com/timezone/"
  });
}
  
    if (sub === "timezones") {
      const embed = new EmbedBuilder()
        .setTitle("North American Timezones")
        .setColor("Blue");

      const chunkSize = 10;
      for (let i = 0; i < northAmericaTimezones.length; i += chunkSize) {
        const chunk = northAmericaTimezones.slice(i, i + chunkSize);
        embed.addFields({ name: "\u200B", value: chunk.join("\n") });
      }

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};