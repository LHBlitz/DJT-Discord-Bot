// falcons.js
const fetch = require('node-fetch').default; // Node-fetch v3
const { EmbedBuilder } = require('discord.js');

const TEAM_ID = '134777'; // Atlanta Falcons
const API_KEY = '123'; // Free API key
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let lastLastGameId = null; // to prevent reposting
let lastNextGameId = null;

module.exports = (client, channelId) => {
    const fetchJSON = async (url) => {
        try {
            const res = await fetch(url);
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (err) {
                console.error('API did not return valid JSON. Raw response:', text.substring(0, 500));
                return null;
            }
        } catch (err) {
            console.error('Error fetching URL:', err);
            return null;
        }
    };

    const postGameEmbed = async (channel, game, type) => {
        if (!game) return;

        const embed = new EmbedBuilder()
            .setTitle(`🏈 ${type}: ${game.strEvent}`)
            .setURL(game.strVideo || game.strEvent)
            .setColor(0xE03A3E)
            .setDescription(
                `**Date:** ${game.dateEvent || 'TBD'}\n` +
                `**Time:** ${game.strTime || 'TBD'}\n` +
                `**Venue:** ${game.strVenue || 'Unknown'}\n` +
                (type === 'Last Game' ? `**Score:** ${game.intHomeScore || 0} - ${game.intAwayScore || 0}` : '')
            )
            .setTimestamp(new Date(game.dateEvent || Date.now()))
            .setFooter({ text: 'TheSportsDB - Atlanta Falcons' });

        await channel.send({ embeds: [embed] });
    };

    const checkGames = async () => {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return console.log('Falcons channel not found.');

        // --- Last finished game ---
        const lastData = await fetchJSON(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${TEAM_ID}`);
        const lastGame = lastData?.results?.[0];
        if (lastGame && lastGame.idEvent !== lastLastGameId) {
            lastLastGameId = lastGame.idEvent;
            await postGameEmbed(channel, lastGame, 'Last Game');
            console.log('Posted last Falcons game.');
        }

        // --- Next scheduled game ---
        const nextData = await fetchJSON(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsnext.php?id=${TEAM_ID}`);
        const nextGame = nextData?.events?.[0];
        if (nextGame && nextGame.idEvent !== lastNextGameId) {
            lastNextGameId = nextGame.idEvent;
            await postGameEmbed(channel, nextGame, 'Next Game');
            console.log('Posted next Falcons game.');
        }
    };

    // Initial check
    checkGames();

    // Repeat every 5 minutes
    setInterval(checkGames, CHECK_INTERVAL);
};