const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');

const parser = new Parser({
  requestOptions: {
    headers: { 'User-Agent': 'DiscordBot/1.0 by YourUser' }
  }
});

const SUBREDDIT = '';
const CHANNEL_ID = '';
const CHECK_INTERVAL_MINUTES = 5;

const DATA_PATH = path.join(__dirname, '../data/redditfeed.json');

let SUBREDDIT_ICON = null;
let lastSeen = null;
let checking = false;

function loadState() {
  if (!fs.existsSync(DATA_PATH)) return;
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    lastSeen = data.lastSeen || null;
  } catch {
    lastSeen = null;
  }
}

function saveState() {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ lastSeen }, null, 2));
}

async function getSubredditIcon(subreddit) {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/about.json`, {
      headers: { 'User-Agent': 'DiscordBot/1.0 by YourUser' }
    });
    const data = await res.json();
    return data.data.icon_img || data.data.community_icon || null;
  } catch (err) {
    console.error('[RedditFeed] Failed to fetch subreddit icon:', err);
    return null;
  }
}

module.exports = function startRedditFeedJob(client) {
  loadState();

  async function checkFeed() {
    if (checking) return;
    checking = true;

    try {
      const feed = await parser.parseURL(
        `https://www.reddit.com/r/${SUBREDDIT}/new/.rss`
      );
      if (!feed.items?.length) return;

      const posts = feed.items
        .map(p => ({ ...p, date: new Date(p.pubDate) }))
        .sort((a, b) => a.date - b.date);

      for (const post of posts) {
        if (lastSeen && post.date <= new Date(lastSeen)) continue;

        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel?.isTextBased()) continue;

        const embed = new EmbedBuilder()
          .setTitle(post.title)
          .setColor('#FF4500')
          .setThumbnail(SUBREDDIT_ICON)
          .setDescription(
            post['content:encoded']
            ?.replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/?p>/gi, '')
            .replace(/submitted by.*$/is, '')
            .trim() || ''
          )
          .setURL(post.link)
          .setTimestamp(post.date);

        await channel.send({ embeds: [embed] });
        console.log(`[RedditFeed] Sent new post: ${post.title}`);

        lastSeen = post.date.toISOString();
        saveState();
      }
    } catch (err) {
      console.error('[RedditFeed] RSS error:', err);
    } finally {
      checking = false;
    }
  }

  (async () => {
    SUBREDDIT_ICON = await getSubredditIcon(SUBREDDIT);
    console.log(`[RedditFeed] Started tracking r/${SUBREDDIT}`);

    if (!lastSeen) {
      try {
        const feed = await parser.parseURL(
          `https://www.reddit.com/r/${SUBREDDIT}/new/.rss`
        );
        if (feed.items?.length) {
          lastSeen = new Date(feed.items[0].pubDate).toISOString();
          saveState();
          console.log('[RedditFeed] Initialized lastSeen');
        }
      } catch (err) {
        console.error('[RedditFeed] Initialization error:', err);
      }
    }

    setInterval(checkFeed, CHECK_INTERVAL_MINUTES * 60 * 1000);
  })();
};
