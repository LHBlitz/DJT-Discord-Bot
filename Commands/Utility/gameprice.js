const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gameprice')
        .setDescription('Donald and Israel are gonna help you find all the deals.')
        .addStringOption(option =>
            option
                .setName('game')
                .setDescription('The name of the game')
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('store')
                .setDescription('Select a store or choose "All"')
                .setAutocomplete(true)
        ),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true);

        if (focused.name === 'game') {
            if (focused.value.length < 3) return interaction.respond([]);

            const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(focused.value)}`);
            const data = await res.json();

            const results = data.slice(0, 10).map(game => ({
                name: game.external,
                value: game.gameID
            }));

            return interaction.respond(results);
        }

        if (focused.name === 'store') {
            const storeRes = await fetch('https://www.cheapshark.com/api/1.0/stores');
            const stores = await storeRes.json();

            const filtered = stores
                .filter(s => s.isActive === 1)
                .map(s => ({
                    name: s.storeName,
                    value: s.storeID.toString()
                }))
                .slice(0, 25);

            filtered.unshift({ name: "All Stores", value: "all" });

            return interaction.respond(filtered);
        }
    },

    async execute(interaction) {
        const gameID = interaction.options.getString('game');
        const storeID = interaction.options.getString('store');

        await interaction.deferReply();

        const res = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameID}`);
        const data = await res.json();

        if (!data.deals || data.deals.length === 0) {
            return interaction.editReply("Sorry pal, Israel already took all the deals. (No deals found)");
        }

        let deals = data.deals;
        if (storeID && storeID !== "all") {
            deals = deals.filter(d => d.storeID === storeID);
        }

        if (deals.length === 0) {
            return interaction.editReply("Sorry pal, Israel already took all the deals. (No deals found for the selected store)");
        }

        const cheapest = deals.reduce((a, b) =>
            parseFloat(a.price) < parseFloat(b.price) ? a : b
        );

        const storeRes = await fetch('https://www.cheapshark.com/api/1.0/stores');
        const storeList = await storeRes.json();
        const storeName = storeList.find(s => s.storeID == cheapest.storeID)?.storeName || "Unknown Store";

        const embed = new EmbedBuilder()
            .setTitle(data.info.title)
            .setURL(`https://www.cheapshark.com/redirect?dealID=${cheapest.dealID}`)
            .setDescription(`**$${cheapest.price}** (Normal: $${cheapest.retailPrice})\nStore: **${storeName}**`)
            .setThumbnail(data.info.thumb);

        interaction.editReply({ embeds: [embed] });
    }
};