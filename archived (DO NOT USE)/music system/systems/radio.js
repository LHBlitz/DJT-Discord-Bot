const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior
} = require("@discordjs/voice");

const play = require("play-dl");

const VOICE_CHANNEL_ID = "1148758625314160643";
const LOOP_URL = "https://www.youtube.com/watch?v=CeADaAg0f_w";

module.exports = async function startRadio(client) {
    console.log("Radio booting…");

    const channel = client.channels.cache.get(VOICE_CHANNEL_ID);
    if (!channel) return console.error("Voice channel not found.");

    const connection = joinVoiceChannel({
        channelId: VOICE_CHANNEL_ID,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
    });

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play,
        },
    });

    connection.subscribe(player);

    async function playLoop() {
        try {
            const stream = await play.stream(LOOP_URL);
            const resource = createAudioResource(stream.stream, {
                inputType: stream.type
            });

            player.play(resource);

            console.log("Now looping the track…");
        } catch (err) {
            console.error("Stream error:", err);
            setTimeout(playLoop, 5000);
        }
    }

    player.on(AudioPlayerStatus.Idle, () => {
        setTimeout(playLoop, 500);
    });

    playLoop();
};