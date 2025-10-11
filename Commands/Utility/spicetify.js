// Commands/Utility/spicetify.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('spicetify')
        .setDescription('A simple guide showing you how to setup Spicetify.'),
    async execute(interaction) {

        const reply = `

This command will help you mod the Spotify Windows app and run Spicetify, allowing you to run custom themes, apps,
and a whole lot more. The process can be a bit confusing, so I'll make this as simple as possible. This guide is specifically
made for Windows. Don't use the Microsoft Store version.
This guide will be updated on a regular basis.
Spicetify website - https://spicetify.app/
Spicetify Discord server - https://discord.gg/VnevqPp2Rr

The first thing you need to do is downgrade your existing version of Spotify. This is due to compatibility issues with auto blocking updates.
The best version as of now is 1.2.69.449.

Spotify 1.2.69.449 - https://loadspot.pages.dev/?os=win&search=1.2.69.449&sortVersion=desc
Install it and overwrite your previous install if it asks.
You can log back in at this point.

Now close Spotify and open up Powershell by pressing the Windows key and typing in pw. Once it loads, copy and paste this in.
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex

This will install Spicetify. After a while, it will ask you if you want to install the Marketplace. Put Y to install it, then press enter.
After it's done, you can now see a shopping cart in the top left of the Spotify app. Go back into Powershell and run this command.
spicetify spotify-updates block

You should get a success notice right after running that. This makes it to where Spotify cannot auto update itself.
You can now open Spotify back up and go to the Marketplace app and download the adblockify extension.

If you ever accidentally update Spotify or do anything that messes up your files, you can run the following command in Powershell to restore all your stuff you had installed.
spicetify backup apply

That should cover everything. Ping lhblitz if you need anything.
        `;


        await interaction.reply(reply);
    },
};