require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const parser = new Parser();

const ACCOUNTS = [
    {
        username: 'DecisionDeskHQ',
        channelId: '1382884586790326353',
        nitterInstance: 'https://xcancel.com/',
        displayName: 'DecisionDeskHQ',
    },
    {
        username: 'Acyn',
        channelId: '1382884586790326353',
        nitterInstance: 'https://xcancel.com/',
        displayName: 'Acyn',
    },
];

const botStartTime = new Date();

async function fetchTweets(username, nitterInstance) {
    try {
        const feedUrl = `${nitterInstance.replace(/\/$/, '')}/${username}/rss`;
        const feed = await parser.parseURL(feedUrl);
        return feed.items || [];
    } catch (err) {
        console.error(`[TwitterFeed] RSS error for ${username}:`, err.message);
        return [];
    }
}

function isOriginalTweet(tweet) {
    const title = tweet.title || '';
    const description = tweet.contentSnippet || '';

    if (title.startsWith('RT ')) return false;

    if (/^@\w+/.test(title) || /^@\w+/.test(description)) return false;

    return true;
}

async function processAccount(account) {
    const { username, channelId, nitterInstance, displayName } = account;
    const tweets = await fetchTweets(username, nitterInstance);
    if (!tweets.length) return;

    tweets.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));

    for (const tweet of tweets) {
        const tweetDate = new Date(tweet.pubDate || tweet.isoDate || 0);
        if (tweetDate < botStartTime) continue;
        if (!isOriginalTweet(tweet)) continue;

        const tweetIdMatch = tweet.link.match(/status\/(\d+)/);
        if (!tweetIdMatch) continue;
        const tweetId = tweetIdMatch[1];
        const fxLink = `https://fxtwitter.com/${username}/status/${tweetId}`;

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel) continue;

            const embed = new EmbedBuilder()
                .setColor(0x1da1f2)
                .setAuthor({ name: displayName, url: `https://twitter.com/${username}` })
                .setDescription(fxLink)
                .setTimestamp(tweetDate);

            await channel.send({ embeds: [embed] });
            console.log(`[TwitterFeed] Posted tweet from @${username}: ${fxLink}`);
        } catch (err) {
            console.error(`[TwitterFeed] Failed to post tweet from @${username}:`, err.message);
        }
    }
}

async function checkAllAccounts() {
    for (const account of ACCOUNTS) {
        await processAccount(account);
    }
}

client.once('ready', async () => {
    console.log(`[TwitterFeed] Logged in as ${client.user.tag}`);
    await checkAllAccounts();
    setInterval(checkAllAccounts, 30 * 1000);
});

client.login(process.env.DISCORD_TOKEN);