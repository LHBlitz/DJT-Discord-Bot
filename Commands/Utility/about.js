// Commands/Utility/about.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('information')
        .setDescription('Information relating to the Donald J. Trump bot.'),
    async execute(interaction) {

        const reply = `

A multipurpose Discord bot paired with administrative tools and humor.
https://github.com/DJT-Bot/DJT-Discord-Bot

This is a bot made for a private friend based Discord server. Its purpose is to be a tool bot on the likes of MEE6 and Dyno, but with a twist of humor
inspired by President Donald J. Trump. It is privately held and ran.

Disclaimer - The functions and humor used in this bot do no reflect the values and views of the creators. It is entirely based on subjective humor
relating to the person or persons the bot is based on.

Contributing:
This bot is privately held between the individuals Zanzort and LHBlitz for a private Discord group dedicated to our friends. Therefore, there will be no public contributions
outside of these two individuals. Any other potential contributions will involve individuals we are familiar with. If you are friends with us, you can DM Zanzort or LHBlitz
on Discord to discuss getting involved with the project.

Licensed under the Apache License
See here - https://github.com/DJT-Bot/About-DJT-Bot

Copyright 2025 Zanzort/LHBlitz
        `;


        await interaction.reply(reply);
    },
};