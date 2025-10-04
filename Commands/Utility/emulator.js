// Commands/Utility/emulator.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('emulators')
        .setDescription('Emulators you should be using.'),
    async execute(interaction) {

        const reply = `
        
        This list is only for emulators that function on a PC. Usage varies and most support both Windows and Linux. If something isn't listed, I have a list on Github for various other emulators and stuff related to it.
https://github.com/stars/LHBlitz/lists/emulation-stuff

Before you ask, no there aren't any emulators for PS5 and Xbox one/Series consoles.

Multi system:
Ares - https://ares-emu.net/
RetroArch - https://www.retroarch.com/
Use this for systems released up to the DS. Supports all the old school systems. RetroArch is best used if you want to unlock Achievements.
See more here -https://retroachievements.org/

Individual:
PlayStation
PS1 - https://www.duckstation.org/
PS2 - https://pcsx2.net/
PS3 - https://rpcs3.net/
PS4 - https://shadps4.net/
PSP - https://www.ppsspp.org/
PS Vita - https://vita3k.org/

Xbox
OG Xbox - https://xemu.app/
Xbox 360 - https://xenia.jp/

Nintendo
Wii/GameCube - https://dolphin-emu.org/
DS - https://melonds.kuribo64.net/
3DS - https://github.com/azahar-emu/azahar
Wii U - https://cemu.info/
Switch:
https://github.com/Ryubing/
https://github.com/Kenji-NX/
https://eden-emu.dev/

Sega
Genesis - https://github.com/ekeeke/Genesis-Plus-GX
Dreamcast - https://flyinghead.github.io/flycast-builds/#
Saturn - https://www.yabasanshiro.com/
        
        `;


        await interaction.reply(reply);
    },
};