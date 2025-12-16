import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Show detailed information about a user.")
  .addUserOption(option =>
    option.setName("target").setDescription("Choose a user.").setRequired(false)
  );

export async function execute(interaction /** @type {ChatInputCommandInteraction} */) {
  const user = interaction.options.getUser("target") || interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
  const joinedAt = member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "N/A";

  const roles = member ? member.roles.cache
    .filter(r => r.id !== interaction.guild.id)
    .map(r => `@${r.name}`)
    .join(", ") || "None" : "N/A";;

  let status = "Offline";
  if (member?.presence) {
    status = member.presence.status
      .replace("dnd", "Do Not Disturb")
      .replace("idle", "Idle")
      .replace("online", "Online")
      .replace("offline", "Offline");
  }

  const activities = member?.presence?.activities || [];
  const activityList = activities.length
    ? activities.map(a => `**${a.type}**: ${a.name}${a.state ? ` — ${a.state}` : ""}`).join("")
    : "None";

  const fetchedUser = await user.fetch();
  const flags = fetchedUser.flags?.toArray() || [];
  const badgeList = flags.length ? flags.map(f => `• ${f}`).join("") : "None";

  const avatarURL = user.displayAvatarURL({ size: 1024, extension: "png" });
  const bannerURL = user.bannerURL({ size: 1024, extension: "png" });

  const nitro = fetchedUser.premiumType ? "Yes" : "No";
  const boosting = member?.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : "No";
  const nickname = member?.nickname || "None";
  const highestRole = member?.roles.highest?.toString() || "None";
  const permissions = member ? member.permissions.toArray().join(", ") || "None" : "N/A";
  const joinedPosition = member ? [...interaction.guild.members.cache.sorted((a, b) => a.joinedTimestamp - b.joinedTimestamp).keys()].indexOf(member.id) + 1 : "N/A";
  const isBot = user.bot ? "Yes" : "No";
  
  const embed = new EmbedBuilder()
    .setTitle(`User Info — ${user.tag}`)
    .setThumbnail(avatarURL)
    .setColor(member?.displayHexColor || "#2b2d31")
    .addFields(
      { name: "Username", value: user.tag, inline: true },
      { name: "User ID", value: user.id, inline: true },
      { name: "Bot Account", value: isBot, inline: true },
      { name: "Nickname", value: nickname, inline: true },
      { name: "Status", value: status, inline: true },
      { name: "Highest Role", value: highestRole, inline: true },
      { name: "Account Created", value: createdAt, inline: true },
      { name: "Joined Server", value: joinedAt, inline: true },
      { name: "Join Position", value: String(joinedPosition), inline: true },
      { name: "Roles", value: roles, inline: false },
      { name: "Activities", value: activityList, inline: false },
      { name: "Badges", value: badgeList, inline: false },
      { name: "Nitro", value: nitro, inline: true },
      { name: "Boosting Server", value: boosting, inline: true },
      { name: "Permissions", value: permissions, inline: false },
      { name: "Avatar URL", value: avatarURL, inline: false },
      { name: "Banner URL", value: bannerURL || "None", inline: false }
    );

  if (bannerURL) embed.setImage(bannerURL);

  return interaction.reply({ embeds: [embed] });
}