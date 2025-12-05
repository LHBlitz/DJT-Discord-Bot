const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const play = require('play-dl');
const ytdl = require('ytdl-core');

const queues = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('TESTING DEVS ONLY')
    .addStringOption(option =>
      option
        .setName('query')
        .setDescription('YouTube link or search term')
        .setRequired(true),
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel)
      return interaction.reply('Join a voice channel first!');

    let guildQueue = queues.get(interaction.guild.id);

    if (!guildQueue) {
      console.log(`Joining voice channel: ${voiceChannel.name}`);
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      connection.on('error', (err) => {
        console.error('❌ Voice connection error:', err);
      });

      connection.on('stateChange', (oldState, newState) => {
        console.log(`Voice state: ${oldState.status} → ${newState.status}`);
      });

      const player = createAudioPlayer();
      guildQueue = { connection, player, songs: [] };
      queues.set(interaction.guild.id, guildQueue);
      connection.subscribe(player);
    }

    try {
      let songInfo;

      if (query.includes('youtube.com') || query.includes('music.youtube.com')) {
        songInfo = await play.video_basic_info(query);
      } else {
        const search = await play.search(query, { limit: 1 });
        if (!search.length)
          return interaction.reply('❌ No results found!');
        songInfo = search[0];
      }

      const details = songInfo.video_details || songInfo;
      let url = details.url;
      if (!url && details.id) url = `https://www.youtube.com/watch?v=${details.id}`;
      if (!url) return interaction.reply('Could not determine a valid video URL.');

      const song = {
        title: details.title || 'Unknown Title',
        url,
        duration: details.durationRaw || 'Unknown',
        thumbnail: details.thumbnails?.[0]?.url || null,
        requester: member.user.username,
      };

      guildQueue.songs.push(song);
      await interaction.reply(`Added **${song.title}** to the queue.`);

      if (guildQueue.songs.length === 1) {
        playSong(interaction.guild.id, interaction.channel);
      }
    } catch (err) {
      console.error('Error in /play command:', err);
      interaction.reply('Error fetching that track.');
    }
  },
};

async function playSong(guildId, textChannel) {
  const guildQueue = queues.get(guildId);
  if (!guildQueue || guildQueue.songs.length === 0) {
    guildQueue?.connection.destroy();
    queues.delete(guildId);
    return;
  }

  const song = guildQueue.songs[0];
  try {
    console.log('🎵 Attempting to stream:', song.url);

    let stream;
    try {
      stream = await play.stream(song.url);
      console.log('Stream fetched via play-dl:', !!stream?.stream);
    } catch (err) {
      console.warn('play-dl failed, falling back to ytdl-core:', err.message);
      stream = { stream: ytdl(song.url, { filter: 'audioonly', highWaterMark: 1 << 25 }), type: 'unknown' };
    }

    if (!stream?.stream) throw new Error('Stream not valid or undefined.');

    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    guildQueue.player.play(resource);

    const embed = new EmbedBuilder()
      .setTitle('Now Playing')
      .setDescription(`[${song.title}](${song.url})`)
      .addFields(
        { name: 'Duration', value: song.duration, inline: true },
        { name: 'Requested by', value: song.requester, inline: true },
      )
      .setThumbnail(song.thumbnail)
      .setColor('Random');

    textChannel.send({ embeds: [embed] });

    guildQueue.player.once(AudioPlayerStatus.Idle, () => {
      guildQueue.songs.shift();
      playSong(guildId, textChannel);
    });
  } catch (err) {
    console.error('Error playing stream:', err);
    textChannel.send('Error playing the current track. Skipping...');
    guildQueue.songs.shift();
    playSong(guildId, textChannel);
  }
}