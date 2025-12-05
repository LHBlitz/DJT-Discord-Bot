const { SlashCommandBuilder } = require('discord.js');

module.exports = {
        data: new SlashCommandBuilder()
        .setName('emulators')
        .setDescription('Let Donnie help you get the best emulators.'),
    async execute(interaction) {

        const reply = `
        
This list is only for emulators that function on a PC. Usage varies and most support both Windows and Linux.
If something isn't listed, I have a list on Github for various other emulators and stuff related to it.
https://github.com/stars/LHBlitz/lists/emulation-stuff
For obscure and older devices, check this website: https://emulation.gametechwiki.com/index.php/Main_Page
Most emulators have support for RetroAchievements. See more here - https://retroachievements.org/
Before you ask, no there aren't any emulators that can run games from the PS5, Nintendo Switch 2, and Xbox one/Series consoles.
Use the piracy command to get access to BIOS and games.

Multi system:
Mesen2 - https://github.com/SourMesen/Mesen2
Ares - https://ares-emu.net/
RetroArch - https://www.retroarch.com/
RetroArch is the preferred multi system frontend out of these three.

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
NES - https://fceux.com/web/home.html
SNES - https://www.snes9x.com/
GB/GBC - https://github.com/LIJI32/SameBoy
N64 - https://github.com/gopher64/gopher64
GBA - https://mgba.io/
Wii/GameCube - https://dolphin-emu.org/
DS/DSi - https://melonds.kuribo64.net/
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
