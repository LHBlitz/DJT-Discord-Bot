const INACTIVITY_HOURS = 1;
const CHECK_INTERVAL_MINUTES = 5;

const GENERAL_CHANNEL_ID = "1375295434997891183";

const reviveMessages = [
  "Where all the bitches at?",
  "It's so quiet in here you could hear me blowing Bill.",
  "Why's it so quiet? Is it because of black fatigue?",
  "Man, it's silent here. We used to make more noise on Jeff's island."
];

module.exports = function startChatReviveJob(client) {
  let lastActivity = Date.now();
  let reviveSent = false;

  client.on("messageCreate", message => {
    if (message.author.bot) return;
    if (message.channel.id !== GENERAL_CHANNEL_ID) return;

    lastActivity = Date.now();
    reviveSent = false;
  });

  async function checkInactivity() {
    if (reviveSent) return;

    const now = Date.now();
    const inactiveFor = now - lastActivity;
    const threshold = INACTIVITY_HOURS * 60 * 60 * 1000;

    if (inactiveFor >= threshold) {
      const channel = await client.channels.fetch(GENERAL_CHANNEL_ID).catch(() => null);
      if (!channel) return;

      const message = reviveMessages[Math.floor(Math.random() * reviveMessages.length)];
      await channel.send(message);
      reviveSent = true;
    }
  }

  client.once("ready", async () => {
    const channel = await client.channels.fetch(GENERAL_CHANNEL_ID).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const messages = await channel.messages.fetch({ limit: 1 }).catch(() => null);
    const lastMsg = messages?.first();
    if (lastMsg && !lastMsg.author.bot) lastActivity = lastMsg.createdTimestamp;

    console.log("[ChatRevive] Tracking started");

    await checkInactivity();

    setInterval(checkInactivity, CHECK_INTERVAL_MINUTES * 60 * 1000);
  });
};
