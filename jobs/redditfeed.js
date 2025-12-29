const fs = require('fs');
const path = require('path');
const Parser = require('rss-parser');
const parser = new Parser({
  requestOptions: {
    headers: { 'User-Agent': 'DiscordBot/1.0 by YourUser' }
  }
});
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');

const SUBREDDIT = 'CrackWatch';
const CHANNEL_ID = '1148765788329758750';
const CHECK_INTERVAL_MINUTES = 5;

const DATA_PATH = path.join(__dirname, '../data/redditfeed.json');

let SUBREDDIT_ICON = null;
let sentPosts = {};

function loadSentPosts() {
  if (!fs.existsSync(DATA_PATH)) return;
  try {
    sentPosts = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  } catch (err) {
    console.error('[RedditFeed] Failed to parse redditfeed.json:', err);
    sentPosts = {};
  }
}

function saveSentPosts() {
  fs.writeFileSync(DATA_PATH, JSON.stringify(sentPosts, null, 2));
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
  loadSentPosts();
  if (!sentPosts[SUBREDDIT]) sentPosts[SUBREDDIT] = [];

  async function checkFeed() {
    try {
      const feed = await parser.parseURL(`https://www.reddit.com/r/${SUBREDDIT}/new/.rss`);
      if (!feed.items || !feed.items.length) return;
      const newPosts = feed.items.reverse().filter(post => !sentPosts[SUBREDDIT].includes(post.id));
      for (const post of newPosts) {
        const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
        if (!channel || !channel.isTextBased()) continue;

        const embed = new EmbedBuilder()
          .setTitle(post.title)
          .setColor('#FF4500')
          .setThumbnail(SUBREDDIT_ICON)
          .setDescription(post.contentSnippet || '')
          .setFooter({ text: `r/${SUBREDDIT} — [View Full Post](${post.link})` })
          .setTimestamp(new Date(post.pubDate));

        await channel.send({ embeds: [embed] }).catch(console.error);
        console.log(`[RedditFeed] Sent new post: ${post.title}`);

        sentPosts[SUBREDDIT].push(post.id);
        saveSentPosts();
      }
    } catch (err) {
      console.error('[RedditFeed] Error fetching RSS:', err);
    }
  }

  (async () => {
    SUBREDDIT_ICON = await getSubredditIcon(SUBREDDIT);
    console.log(`[RedditFeed] Started tracking r/${SUBREDDIT}, icon: ${SUBREDDIT_ICON}`);

    try {
      const feed = await parser.parseURL(`https://www.reddit.com/r/${SUBREDDIT}/new/.rss`);
      if (feed.items && feed.items.length) {
        for (const post of feed.items) {
          if (!sentPosts[SUBREDDIT].includes(post.id)) {
            sentPosts[SUBREDDIT].push(post.id);
          }
        }
        saveSentPosts();
        console.log(`[RedditFeed] Recorded ${feed.items.length} existing posts as sent`);
      }
    } catch (err) {
      console.error('[RedditFeed] Error initializing sent posts:', err);
    }

    setInterval(checkFeed, CHECK_INTERVAL_MINUTES * 60 * 1000);
  })();
};
