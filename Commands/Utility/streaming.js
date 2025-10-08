// Commands/Utility/streaming.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('streaming')
        .setDescription('Use this command to get free streaming sites and alternatives to music services.'),
    async execute(interaction) {

        const reply = `

In this command, you'll find links to online streaming sites for TV shows, movies, and even anime. You'll also find links to
certain versions of apps that allow you to use their services for free. No VPN is required. Please ping lhblitz if a site is down.

First things first, make sure you use an ad blocker paired with Firefox.
https://www.firefox.com/en-US/
https://github.com/gorhill/uBlock

Movies/TV Shows/Anime:
https://www.cineby.app/
https://dlhd.dad/
https://xprime.tv/
https://watch.spencerdevs.xyz/
https://www.beech.watch/
https://yflix.to/
https://kimcartoon.si/CartoonList

Anime only:
https://animekai.to/home
https://hianime.to/
https://kaa.to/

Live sports (football, wrestling, baseball, etc):
https://ppvs.su/
https://watchkobestreams.info/
https://v2.streameast.ga/
https://nflbite.digital/

Music Apps (PC):
Spotify - Mod with Spicetify - https://spicetify.app/
YT Music - Native desktop app with built in ad blocker and plugins - https://github.com/ytmd-devs/ytmd
SoundCloud - Also has a native desktop app with a built in ad blocker and plugins - https://github.com/richardhbtz/soundcloud-rpc
        `;


        await interaction.reply(reply);
    },
};