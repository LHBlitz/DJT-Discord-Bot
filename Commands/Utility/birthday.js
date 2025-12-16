const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  setBirthday,
  removeBirthday,
  getBirthday,
  getUpcomingBirthdays
} = require("../../data/birthdays");

const timezones = [
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
          o.setName("month")
            .setRequired(true)
            .setDescription("1-12"))
        .addIntegerOption(o =>
          o.setName("day")
            .setRequired(true)
            .setDescription("1-31"))
        .addIntegerOption(o =>
          o.setName("year")
            .setRequired(true)
            .setDescription("Your birth year")
            .setMinValue(1900)
            .setMaxValue(new Date().getFullYear()))
        .addStringOption(o =>
          o.setName("timezone")
            .setRequired(true)
            .setDescription("Select your timezone")
            .addChoices(
              ...timezones.map(tz => ({ name: tz, value: tz }))
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
        .setDescription("View worldwide timezone list.")),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "set") {
      const month = interaction.options.getInteger("month");
      const day = interaction.options.getInteger("day");
      const year = interaction.options.getInteger("year");
      const timezone = interaction.options.getString("timezone");

      if (month < 1 || month > 12 || day < 1 || day > 31) {
        return interaction.reply({ content: "Invalid date.", ephemeral: true });
      }

      try {
        Intl.DateTimeFormat("en-US", { timeZone: timezone });
      } catch {
        return interaction.reply({ content: "Invalid timezone.", ephemeral: true });
      }

      setBirthday(
        interaction.user.id,
        interaction.guild.id,
        month,
        day,
        year,
        timezone
      );

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

      const now = new Date();
      let nextBirthday = new Date(now);
      nextBirthday.setMonth(b.month - 1);
      nextBirthday.setDate(b.day);
      nextBirthday.setFullYear(now.getFullYear());
      if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);

      const age = b.year ? nextBirthday.getFullYear() - b.year : null;

      return interaction.reply({
        content: `**${b.month}/${b.day}/${b.year}**\nYou will turn **${age}** on your next birthday.\nTimezone: **${b.timezone}**`,
        ephemeral: true
      });
    }

    if (sub === "upcoming") {
      const list = getUpcomingBirthdays(interaction.guild.id);
      if (!list.length) {
        return interaction.reply({ content: "No upcoming birthdays.", ephemeral: true });
      }

      const now = new Date();

      const upcoming = list.map(b => {
        let nextBirthday = new Date(now);
        nextBirthday.setMonth(b.month - 1);
        nextBirthday.setDate(b.day);
        nextBirthday.setFullYear(now.getFullYear());
        if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);

        const age = b.year ? nextBirthday.getFullYear() - b.year : null;
        const yearTurning = nextBirthday.getFullYear();

        return {
          userId: b.userId,
          month: b.month,
          day: b.day,
          age,
          yearTurning,
        };
      });

      upcoming.sort((a, b) => {
        const aDate = new Date(`${a.month}/${a.day}/${a.yearTurning}`);
        const bDate = new Date(`${b.month}/${b.day}/${b.yearTurning}`);
        return aDate - bDate;
      });

      const embed = new EmbedBuilder()
        .setTitle("Upcoming Birthdays")
        .setColor("Gold")
        .setDescription(
          upcoming.map(b => `<@${b.userId}> — **${b.month}/${b.day}** (turning ${b.age} in ${b.yearTurning})`).join("\n")
        );

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "world") {
      return interaction.reply({
        content: "View all worldwide timezones here:\nhttps://momentjs.com/timezone/"
      });
    }

    if (sub === "timezones") {
      const embed = new EmbedBuilder()
        .setTitle("North American Timezones")
        .setColor("Blue")
        .setDescription(timezones.join("\n"));

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
