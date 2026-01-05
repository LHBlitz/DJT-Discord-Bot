const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');

const queues = new Map();

async function ensureStream(url) {
    if (play.yt_validate(url) === 'video') {
        const stream = await play.stream(url, { quality: 2 });
        return { stream: stream.stream, type: stream.type };
    }
    const searched = await play.search(url, { limit: 1 });
    if (!searched || searched.length === 0) return null;
    const video = searched[0].url;
    const stream = await play.stream(video, { quality: 2 });
    return { stream: stream.stream, type: stream.type, title: searched[0].title, url: video, thumbnail: searched[0].thumbnail };
}

function getQueue(guildId) {
    if (!queues.has(guildId)) queues.set(guildId, { connection: null, player: null, songs: [], playing: false, textChannel: null });
    return queues.get(guildId);
}

async function enqueue(guildId, voiceChannel, textChannel, query, requester) {
    const queue = getQueue(guildId);
    queue.textChannel = queue.textChannel || textChannel;
    const info = await ensureStream(query);
    if (!info) throw new Error('No results');
    const song = {
        title: info.title || query,
        url: info.url || query,
        requestedBy: requester,
        thumbnail: info.thumbnail || null,
        streamType: info.type,
        streamUrl: info.url || query
    };
    queue.songs.push(song);
    if (!queue.playing) await playNext(guildId, voiceChannel);
    return song;
}

async function playNext(guildId, voiceChannel) {
    const queue = getQueue(guildId);
    if (!queue.songs.length) {
        queue.playing = false;
        const conn = getVoiceConnection(guildId);
        if (conn) conn.destroy();
        queue.connection = null;
        return;
    }
    queue.playing = true;
    const next = queue.songs.shift();
    if (!queue.connection) {
        queue.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });
    }
    if (!queue.player) {
        queue.player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        queue.player.on('stateChange', (oldState, newState) => {
            if (newState.status === AudioPlayerStatus.Idle) {
                playNext(guildId, voiceChannel).catch(() => {});
            }
        });
        queue.player.on('error', () => {
            playNext(guildId, voiceChannel).catch(() => {});
        });
        queue.connection.subscribe(queue.player);
    }
    const info = await ensureStream(next.url || next.streamUrl || next.title);
    if (!info) {
        playNext(guildId, voiceChannel).catch(() => {});
        return;
    }
    const resource = createAudioResource(info.stream, { inputType: info.type });
    queue.player.play(resource);
    queue.textChannel?.send({ content: `Now playing: ${next.title} — <${next.url}>` }).catch(() => {});
}

function skip(guildId) {
    const queue = queues.get(guildId);
    if (!queue || !queue.player) return false;
    queue.player.stop();
    return true;
}

function stop(guildId) {
    const queue = queues.get(guildId);
    if (!queue) return false;
    queue.songs = [];
    if (queue.player) queue.player.stop();
    const conn = getVoiceConnection(guildId);
    if (conn) conn.destroy();
    queues.delete(guildId);
    return true;
}

function leave(guildId) {
    const conn = getVoiceConnection(guildId);
    if (conn) conn.destroy();
    queues.delete(guildId);
    return true;
}

function getQueueSnapshot(guildId) {
    const q = queues.get(guildId);
    if (!q) return { now: null, upcoming: [] };
    const now = q.playing ? (q.songs.length ? q.songs[0] : null) : null;
    const upcoming = q.songs.slice(0, 20);
    return { now, upcoming };
}

module.exports = { enqueue, skip, stop, leave, getQueueSnapshot, getQueue };