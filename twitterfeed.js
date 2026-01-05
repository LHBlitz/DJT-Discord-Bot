require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

const twitter = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).v2;

const DATA_DIR = path.join(__dirname, 'lastTweets');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const ACCOUNTS = [
  { username: 'DecisionDeskHQ', channelId: '' },
];

function lastTweetFile(username) {
  return path.join(DATA_DIR, `${username}.json`);
}

function getLastTweetId(username) {
  const file = lastTweetFile(username);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')).id || null;
  } catch {
    return null;
  }
}

function setLastTweetId(username, id) {
  fs.writeFileSync(lastTweetFile(username), JSON.stringify({ id }, null, 2));
}

const blockedAccounts = {};
const BLOCKED_FILE = path.join(DATA_DIR, 'blockedAccounts.json');

function loadBlockedAccounts() {
  if (!fs.existsSync(BLOCKED_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(BLOCKED_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveBlockedAccounts() {
  fs.writeFileSync(BLOCKED_FILE, JSON.stringify(blockedAccounts, null, 2));
}

Object.assign(blockedAccounts, loadBlockedAccounts());

async function fetchTweets(username) {
  const blockedUntil = blockedAccounts[username];
  const now = Date.now();

  if (blockedUntil && now < blockedUntil) {

    return [];
  } else if (blockedUntil && now >= blockedUntil) {

    delete blockedAccounts[username];
    saveBlockedAccounts();
    console.log(`[TwitterFeed] @${username} unblocked, resuming fetch.`);
  }

  try {
    const user = await twitter.userByUsername(username);
    if (!user?.data?.id) return [];

    const sinceId = getLastTweetId(username) || undefined;
    const res = await twitter.userTimeline(user.data.id, {
      since_id: sinceId,
      max_results: 5,
      exclude: 'replies',
    });

    return res?.data?.data || [];
  } catch (err) {
    if (err?.data?.title === 'UsageCapExceeded') {
      console.warn(`[TwitterFeed] @${username} hit the monthly API limit. Blocking until next reset.`);

      const now = new Date();
      let reset = new Date(now.getFullYear(), now.getMonth(), 7, 0, 0, 0);
      if (now.getDate() >= 7) reset.setMonth(reset.getMonth() + 1);

      blockedAccounts[username] = reset.getTime();
      saveBlockedAccounts();
      return [];
    }
    console.error(`[TwitterFeed] Error fetching @${username}:`, err);
    return [];
  }
}

async function processAccount(discordClient, account) {
  const { username, channelId } = account;
  const lastId = getLastTweetId(username);

  const tweets = await fetchTweets(username);

  const newTweets = tweets
    .filter(t => t.id && t.id !== lastId)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (!newTweets.length) return;

  const channel = await discordClient.channels.fetch(channelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  for (const tweet of newTweets) {
    const url = `https://fxtwitter.com/${username}/status/${tweet.id}`;
    await channel.send(url).catch(console.error);
    setLastTweetId(username, tweet.id);
    console.log(`[TwitterFeed] Posted @${username}: ${url}`);
  }
}

async function loop(discordClient) {
  console.log('[TwitterFeed] Started');

  while (true) {
    for (const account of ACCOUNTS) {
      await processAccount(discordClient, account);
      await new Promise(r => setTimeout(r, 2000));
    }

    await new Promise(r => setTimeout(r, 5 * 60 * 1000));
  }
}

module.exports = (discordClient) => loop(discordClient);
