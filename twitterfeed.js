require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { TwitterApi } = require('twitter-api-v2');

const clientV2 = new TwitterApi(process.env.TWITTER_BEARER_TOKEN).v2;
const DATA_DIR = path.join(__dirname, 'lastTweets');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const ACCOUNTS = [
    { username: "DecisionDeskHQ", channelId: "1382884586790326353" },
    { username: "WumpusCentral", channelId: "1347316973943394315" },
];

function fileFor(username) {
    return path.join(DATA_DIR, `${username}.json`);
}

function getLastTweetId(username) {
    const f = fileFor(username);
    if (!fs.existsSync(f)) return null;
    try {
        return JSON.parse(fs.readFileSync(f, 'utf8')).id;
    } catch {
        return null;
    }
}

function saveLastTweetId(username, id) {
    fs.writeFileSync(fileFor(username), JSON.stringify({ id }));
}

async function safeApiCall(callFn, username) {
    while (true) {
        try {
            return await callFn();
        } catch (err) {
            if (err.code === 429) {
                const reset = err.rateLimit?.reset;
                const now = Math.floor(Date.now() / 1000);
                const waitMs = Math.max((reset - now) * 1000, 5000);
                console.log(`[TwitterFeed] Rate limit hit. Waiting ${Math.round(waitMs / 1000)}s (reset @ ${reset})`);
                await new Promise(res => setTimeout(res, waitMs));
                continue;
            }
            console.error(`[TwitterFeed] Error fetching @${username}:`, err);
            return null;
        }
    }
}

async function fetchLatestTweet(username) {
    const user = await safeApiCall(
        () => clientV2.userByUsername(username, { "user.fields": ["id"] }),
        username
    );
    if (!user?.data) return null;

    const tweets = await safeApiCall(
        () => clientV2.userTimeline(user.data.id, { max_results: 5, exclude: "replies" }),
        username
    );

    return tweets?.data?.data?.[0] || null;
}

async function processAccount(discordClient, { username, channelId }) {
    const latestTweet = await fetchLatestTweet(username);
    if (!latestTweet) return;

    const lastId = getLastTweetId(username);
    if (lastId === latestTweet.id) {
        console.log(`[TwitterFeed] No new tweet for @${username}`);
        return;
    }

    const fx = `https://fxtwitter.com/${username}/status/${latestTweet.id}`;

    try {
        const ch = await discordClient.channels.fetch(channelId);
        await ch.send(fx);
        saveLastTweetId(username, latestTweet.id);
        console.log(`[TwitterFeed] New tweet from @${username}: ${fx}`);
    } catch (e) {
        console.error(`[TwitterFeed] Failed to post tweet for @${username}`, e);
    }
}

async function queueLoop(discordClient) {
    console.log("[TwitterFeed] Queue started (rate-limit safe)");

    while (true) {
        for (const account of ACCOUNTS) {
            await processAccount(discordClient, account);
            await new Promise(res => setTimeout(res, 2000));
        }

        console.log("[TwitterFeed] Cycle complete. Waiting 5 minutes...");
        await new Promise(res => setTimeout(res, 5 * 60 * 1000));
    }
}

module.exports = (discordClient) => {
    console.log("[TwitterFeed] Twitter module initialized");
    queueLoop(discordClient);
};
