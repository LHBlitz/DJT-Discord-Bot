const fs = require("fs");
const Parser = require("rss-parser");
const parser = new Parser();

const STORAGE_FILE = "./posted_politics.json";

module.exports = function setupPoliticsFeed(client, channelId, feedUrls) {

    let posted = new Set();

    if (fs.existsSync(STORAGE_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8"));
            posted = new Set(data);
        } catch (err) {
            console.error("Failed to load posted_politics.json:", err);
        }
    }

    function savePosted() {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify([...posted], null, 2));
    }

    async function checkFeeds() {
        try {
            let articles = [];

            for (const url of feedUrls) {
                try {
                    const feed = await parser.parseURL(url);

                    if (!feed.items) continue;

                    const mapped = feed.items.map(item => ({
                        title: item.title || "Untitled",
                        link: item.link,
                        date: new Date(item.isoDate || item.pubDate || 0),
                        source: feed.title || "News"
                    }));

                    articles.push(...mapped);
                } catch (err) {
                    console.error(`Failed to fetch ${url}:`, err.message);
                }
            }

            if (articles.length === 0) {
                console.log("No articles found.");
                return;
            }

            articles.sort((a, b) => b.date - a.date);

            const channel = client.channels.cache.get(channelId);
            if (!channel) return;

            for (const article of articles) {
                if (!article.link) continue;

                if (posted.has(article.link)) continue;

                if (article.date < startTime) continue;

                posted.add(article.link);
                savePosted();

                await channel.send(
                    `**${article.source}**\n` +
                    `**${article.title}**\n` +
                    `${article.link}`
                ).catch(console.error);

                console.log(`[Politics] Posted: ${article.title}`);
            }

        } catch (err) {
            console.error("Error checking RSS feed:", err);
        }
    }

    const startTime = new Date();

    setInterval(checkFeeds, 10 * 60 * 1000);
    checkFeeds();

    console.log("Political feed started using:", feedUrls);
};
