require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { TwitterApi } = require("twitter-api-v2");
const Parser = require("rss-parser");

const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).v2;
const rss = new Parser();

const DATA_DIR = path.join(__dirname, "lastTweets");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USER_ID_FILE = path.join(DATA_DIR, "userIds.json");
const MODE_FILE = path.join(DATA_DIR, "mode.json");

const ACCOUNTS = [
  { username: "DecisionDeskHQ", channelId: "1382884586790326353" },
  { username: "realCrackWatch", channelId: "1148765788329758750" },
  { username: "WumpusCentral", channelId: "1347316973943394315" },
  { username: "Steam", channelId: "1148765788329758750" },
];

const NITTERS = [
  "https://nitter.net",
  "https://nitter.privacydev.net",
  "https://nitter.fdn.fr",
];

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function lastTweetFile(username) {
  return path.join(DATA_DIR, `${username}.json`);
}

function getLastTweetId(username) {
  return loadJson(lastTweetFile(username), {}).id || null;
}

function setLastTweetId(username, id) {
  saveJson(lastTweetFile(username), { id });
}

let mode = loadJson(MODE_FILE, { mode: "API" }).mode;

function setMode(m) {
  mode = m;
  saveJson(MODE_FILE, { mode });
  console.log(`[TwitterFeed] Mode switched to ${mode}`);
}

let userIds = loadJson(USER_ID_FILE, {});

async function getUserId(username) {
  if (userIds[username]) return userIds[username];

  const user = await twitter.userByUsername(username);
  if (!user?.data?.id) return null;

  userIds[username] = user.data.id;
  saveJson(USER_ID_FILE, userIds);
  return user.data.id;
}

async function fetchViaApi(username) {
  const userId = await getUserId(username);
  if (!userId) return [];

  const sinceId = getLastTweetId(username);

  try {
    const res = await twitter.userTimeline(userId, {
      since_id: sinceId || undefined,
      max_results: 5,
      exclude: "replies",
    });

    return res?.data?.data || [];
  } catch (err) {
    if (err.code === 429) {
      setMode("NITTER");
      return [];
    }
    throw err;
  }
}

function extractTweetId(url) {
  return url.split("/status/")[1];
}

async function fetchViaNitter(username) {
  for (const base of NITTERS) {
    try {
      const feed = await rss.parseURL(`${base}/${username}/rss`);
      return feed.items || [];
    } catch {}
  }
  return [];
}

async function processAccount(discordClient, account) {
  const { username, channelId } = account;
  const lastId = getLastTweetId(username);
  let tweets = [];

  if (mode === "API") {
    tweets = await fetchViaApi(username);
  } else {
    const items = await fetchViaNitter(username);
    tweets = items
      .map(i => ({ id: extractTweetId(i.link) }))
      .filter(t => t.id && t.id !== lastId);
  }

  if (!tweets.length) return;

  const channel = await discordClient.channels.fetch(channelId);

  for (const tweet of tweets.reverse()) {
    const url = `https://fxtwitter.com/${username}/status/${tweet.id}`;
    await channel.send(url);
    setLastTweetId(username, tweet.id);
    console.log(`[TwitterFeed] Posted @${username}: ${url}`);
  }
}

async function loop(discordClient) {
  console.log("[TwitterFeed] Started");

  while (true) {
    for (const account of ACCOUNTS) {
      try {
        await processAccount(discordClient, account);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        console.error("[TwitterFeed] Error:", e);
      }
    }

    await new Promise(r => setTimeout(r, 5 * 60 * 1000));
  }
}

module.exports = (discordClient) => loop(discordClient);
