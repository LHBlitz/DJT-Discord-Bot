// Commands/Utility/about.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('information')
        .setDescription('Information relating to the Donald J. Trump bot.'),
    async execute(interaction) {

        const reply = `

This is a bot made for a private friend based Discord server. Its purpose is to be a tool bot on the likes of MEE6 and Dyno, but with a twist of humor inspired by President Donald J. Trump. It is privately held and ran.

Disclaimer - The functions and humor used in this bot do no reflect the values and views of the creators. It is entirely based on subjective humor relating to the person or persons the bot is based on.

Contributing:
This bot is privately held between the individuals Zanzort and LHBlitz for a private Discord group dedicated to our friends. Therefore, there will be no public contributions outside of these two individuals.
Any other potential contributions will involve individuals we are familiar with. If you are friends with us, you can DM Zanzort or LHBlitz on Discord to discuss getting involved with the project.

MIT License:

Copyright (c) 2025 zanzort/lhblitz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

https://github.com/Crunchcasual/DJT-Discord-Bot
        `;


        await interaction.reply(reply);
    },
};