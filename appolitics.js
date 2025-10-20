const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const parser = new Parser();
const postedFile = path.join(__dirname, 'postedArticles.json');

// --- Basic Spanish detection (lightweight heuristic) ---
const spanishWords = [
    'el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'por', 'para',
    'con', 'una', 'un', 'sobre', 'más', 'como', 'su', 'sus', 'al'
];
function isProbablySpanish(text) {
    const lower = text.toLowerCase();
    return spanishWords.some(word => lower.includes(` ${word} `));
}

module.exports = (client, channelId, feedUrl) => {
    let postedArticles = [];

    // Load saved articles
    if (fs.existsSync(postedFile)) {
        try {
            postedArticles = JSON.parse(fs.readFileSync(postedFile, 'utf8'));
        } catch (err) {
            console.error('Error reading postedArticles.json:', err);
        }
    }

    async function checkFeed() {
        try {
            const feed = await parser.parseURL(feedUrl);
            const channel = await client.channels.fetch(channelId);
            if (!channel) return console.log('AP Politics channel not found.');

            // Filter out already-posted articles
            const newArticles = feed.items.filter(item => !postedArticles.includes(item.link));

            // Keep only political & English articles
            const filteredArticles = newArticles.filter(item => {
                const title = item.title?.toLowerCase() || '';
                const category = (item.categories || []).join(' ').toLowerCase();
                const link = item.link?.toLowerCase() || '';
                const isPolitical =
                    title.includes('politic') ||
                    category.includes('politic') ||
                    link.includes('politic');
                const notSpanish = !isProbablySpanish(title);
                return isPolitical && notSpanish;
            });

            if (filteredArticles.length > 0) {
                console.log(`Found ${filteredArticles.length} new political articles.`);

                for (const item of filteredArticles) {
                    // Shorten summary safely
                    const summary = item.contentSnippet
                        ? item.contentSnippet.substring(0, 500) + (item.contentSnippet.length > 500 ? '...' : '')
                        : 'No summary available.';

                    // Attempt to extract image URL
                    let imageUrl = null;
                    if (item.enclosure?.url) {
                        imageUrl = item.enclosure.url;
                    } else if (item['media:content']?.url) {
                        imageUrl = item['media:content'].url;
                    } else if (item.content?.match(/<img[^>]+src="([^">]+)"/)) {
                        imageUrl = item.content.match(/<img[^>]+src="([^">]+)"/)[1];
                    }

                    const embed = new EmbedBuilder()
                        .setColor(0xffcc00)
                        .setTitle(item.title || 'Untitled Article')
                        .setURL(item.link)
                        .setDescription(summary)
                        .setTimestamp(new Date(item.isoDate || Date.now()))
                        .setFooter({
                            text: 'AP Politics',
                            iconURL:
                                'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Associated_Press_logo_2012.svg/512px-Associated_Press_logo_2012.svg.png',
                        });

                    if (imageUrl) {
                        embed.setImage(imageUrl);
                    }

                    await channel.send({ embeds: [embed] }).catch(console.error);
                    postedArticles.push(item.link);
                }

                // Keep the file clean (last 200 articles)
                fs.writeFileSync(postedFile, JSON.stringify(postedArticles.slice(-200), null, 2));
            } else {
                console.log('No new relevant political articles found.');
            }
        } catch (err) {
            console.error('Error checking RSS feed:', err);
        }
    }

    // Run on startup
    checkFeed();

    // Recheck every 10 minutes
    setInterval(checkFeed, 10 * 60 * 1000);
};