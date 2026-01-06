console.log("[ChatRevive] File loaded");

const INACTIVITY_HOURS = 3;
const CHECK_INTERVAL_MINUTES = 5;

const GENERAL_CHANNEL_ID = "";

const reviveMessages = [
];

module.exports = function startChatReviveJob(client) {
  let lastActivity = Date.now();
  let reviveSent = false;

  client.on("messageCreate", message => {
    if (message.author.bot) return;
    if (message.channel.id !== GENERAL_CHANNEL_ID) return;

    const time = new Date().toLocaleTimeString();
    lastActivity = Date.now();

    if (reviveSent) {
      reviveSent = false;
      console.log(`[ChatRevive] reviveSent reset due to activity at ${time}`);
    }

    console.log(`[ChatRevive] Activity detected at ${time} by ${message.author.tag}`);
  });

  async function checkInactivity() {
    const now = Date.now();
    const inactiveFor = now - lastActivity;
    const inactiveMinutes = Math.floor(inactiveFor / (60 * 1000));
    const threshold = INACTIVITY_HOURS * 60 * 60 * 1000;

    console.log(`[ChatRevive] Channel has been quiet for ${inactiveMinutes} minute(s)`);

    if (reviveSent) return;

    if (inactiveFor >= threshold) {
      const channel = await client.channels.fetch(GENERAL_CHANNEL_ID).catch(() => null);
      if (!channel || !channel.isTextBased()) return;

      const message = reviveMessages[Math.floor(Math.random() * reviveMessages.length)];
      await channel.send(message).catch(console.error);
      reviveSent = true;

      console.log(`[ChatRevive] Sent revive message in #${channel.name}`);
    }
  }

  (async () => {
    const channel = await client.channels.fetch(GENERAL_CHANNEL_ID).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
    const lastMsg = messages?.filter(msg => !msg.author.bot).first();
    if (lastMsg) lastActivity = lastMsg.createdTimestamp;

    console.log("[ChatRevive] Tracking started");

    await checkInactivity();

    setInterval(checkInactivity, CHECK_INTERVAL_MINUTES * 60 * 1000);
  })();
};


