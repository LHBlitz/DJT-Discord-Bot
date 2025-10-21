const Parser = require('rss-parser');
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const parser = new Parser();
const postedFile = path.join(__dirname, 'postedArticles.json');

// --- Spanish detection (lightweight heuristic) ---
const spanishWords = [
    'el', 'la', 'los', 'las', 'de', 'del', 'y', 'en', 'por', 'para',
    'con', 'una', 'un', 'sobre', 'más', 'como', 'su', 'sus', 'al'
];
function isProbablySpanish(text) {
    const lower = text.toLowerCase();
    return spanishWords.some(word => lower.includes(` ${word} `));
}

// --- Political keyword detection ---
const politicalKeywords = [
    'politic', 'election', 'vote', 'voter', 'democrat', 'republican',
    'congress', 'senate', 'house', 'biden', 'trump', 'government',
    'campaign', 'policy', 'white house', 'supreme court'
];
function isPolitical(text) {
    const lower = text.toLowerCase();
    return politicalKeywords.some(keyword => lower.includes(keyword));
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

    async function checkFeed(force = false) {
        try {
            const feed = await parser.parseURL(feedUrl);
            const channel = await client.channels.fetch(channelId);
            if (!channel) return console.log('AP Politics channel not found.');

            console.log(`\n🔍 Checking feed (${feed.items.length} total items)...`);

            const newArticles = feed.items.filter(item => !postedArticles.includes(item.link));

            let relevant = [];
            let skippedSpanish = 0;
            let skippedNonPolitical = 0;

            for (const item of newArticles) {
                const title = item.title || '';
                const description = item.contentSnippet || '';
                const categories = (item.categories || []).join(' ');

                if (isProbablySpanish(title) || isProbablySpanish(description)) {
                    skippedSpanish++;
                    continue;
                }

                if (!isPolitical(title) && !isPolitical(description) && !isPolitical(categories)) {
                    skippedNonPolitical++;
                    continue;
                }

                relevant.push(item);
            }

            if (relevant.length > 0 || force) {
                console.log(`✅ Found ${relevant.length} new relevant political articles.`);
                if (skippedSpanish > 0) console.log(`⚠️ Skipped ${skippedSpanish} Spanish articles.`);
                if (skippedNonPolitical > 0) console.log(`📰 Skipped ${skippedNonPolitical} non-political articles.`);

                for (const item of relevant) {
                    const summary = item.contentSnippet
                        ? item.contentSnippet.substring(0, 500) + (item.contentSnippet.length > 500 ? '...' : '')
                        : 'No summary available.';

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

                    if (imageUrl) embed.setImage(imageUrl);

                    await channel.send({ embeds: [embed] }).catch(console.error);
                    postedArticles.push(item.link);
                }

                fs.writeFileSync(postedFile, JSON.stringify(postedArticles.slice(-200), null, 2));
            } else {
                console.log(`No new relevant political articles found. (Skipped ${skippedSpanish + skippedNonPolitical})`);
            }
        } catch (err) {
            console.error('Error checking RSS feed:', err);
        }
    }

    // Run on startup
    checkFeed();

    // Recheck every 10 minutes
    setInterval(checkFeed, 10 * 60 * 1000);

    // Allow manual trigger for testing
    client.on('messageCreate', msg => {
        if (msg.content.toLowerCase() === '!checkfeed') {
            if (msg.channel.id === channelId) {
                msg.reply('🔄 Checking AP feed manually...');
                checkFeed(true);
            }
        }
    });
};