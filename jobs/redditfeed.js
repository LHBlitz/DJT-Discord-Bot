const Parser = require('rss-parser');
const parser = new Parser();
const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');

const SUBREDDIT = 'CrackWatch';
const CHANNEL_ID = '1148765788329758750';
const CHECK_INTERVAL_MINUTES = 5;

let SUBREDDIT_ICON = null;
let lastPostId = null;

async function getSubredditIcon(subreddit) {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/about.json`);
    const data = await res.json();
    return data.data.icon_img || data.data.community_icon || null;
  } catch (err) {
    console.error('[RedditFeed] Failed to fetch subreddit icon:', err);
    return null;
  }
}

module.exports = function startRedditFeedJob(client) {
  async function checkFeed() {
    try {
      const feed = await parser.parseURL(`https://www.reddit.com/r/${SUBREDDIT}/new/.rss`);
      if (!feed.items || !feed.items.length) return;

      const newPosts = feed.items.reverse();
      for (const post of newPosts) {
        if (post.id === lastPostId) break;
        if (lastPostId !== null) {
          const channel = client.channels.cache.get(CHANNEL_ID);
          if (!channel) continue;

          let content = post.contentSnippet || '';
          if (content.length > 4000) content = content.slice(0, 3997) + '...';

          const authorName = (post.creator || post.author || 'unknown').replace(/^\/?u\//, '');
          const authorLink = `https://www.reddit.com/user/${authorName}`;

          const embed = new EmbedBuilder()
            .setTitle(post.title)
            .setColor('#FF4500')
            .setThumbnail(SUBREDDIT_ICON)
            .setDescription(content)
            .addFields({ name: 'Author', value: `[${authorName}](${authorLink})` })
            .setFooter({ text: `r/${SUBREDDIT} — [View Full Post](${post.link})` })
            .setTimestamp(new Date(post.pubDate));

          const imageMatch = post.content.match(/<img src="(.*?)"/);
          if (imageMatch && imageMatch[1]) embed.setImage(imageMatch[1]);

          await channel.send(`New post from r/${SUBREDDIT}.`);
          await channel.send({ embeds: [embed] }).catch(console.error);
        }
      }

      lastPostId = feed.items[0].id;
    } catch (err) {
      console.error('[RedditFeed] Error fetching RSS:', err);
    }
  }

  client.once('ready', async () => {
    SUBREDDIT_ICON = await getSubredditIcon(SUBREDDIT);
    console.log(`[RedditFeed] Started tracking r/${SUBREDDIT}, icon: ${SUBREDDIT_ICON}`);

    try {
      const feed = await parser.parseURL(`https://www.reddit.com/r/${SUBREDDIT}/new/.rss`);
      if (feed.items && feed.items.length) lastPostId = feed.items[0].id;
    } catch (err) {
      console.error('[RedditFeed] Error initializing lastPostId:', err);
    }

    setInterval(checkFeed, CHECK_INTERVAL_MINUTES * 60 * 1000);
  });
};