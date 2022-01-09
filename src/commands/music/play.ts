import {
  GuildMember,
  MessageEmbed,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { ICommand } from "wokcommands";
import * as ytdl from "ytdl-core";
import * as yt from "youtube-search-without-api-key";
import { MusicPlayer } from "../../music-player/music-player";
import { Song } from "../../music-player/song";
import {
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from "@discordjs/voice";

export default {
  category: "Music",
  description: "Play or Queue a song for the music player.",
  expectedArgs: "<YouTube URL or Song Name>",
  minArgs: 1,

  slash: true,

  callback: async ({ interaction: msgInt, args }) => {
    const voiceChannel = (msgInt.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      return msgInt.reply({
        content: "You must be in a voice channel",
        ephemeral: true,
      });
    }

    const permissions = voiceChannel.permissionsFor(msgInt.user);
    if (
      permissions === null ||
      !permissions.has("CONNECT") ||
      !permissions.has("SPEAK")
    )
      return msgInt.reply({
        content: "You dont have the correct permissions",
        ephemeral: true,
      });

    if (MusicPlayer.voiceChannel === voiceChannel) {
      return msgInt.reply({
        content: "Already connected to your voice channel!",
        ephemeral: true,
      });
    }

    MusicPlayer.voiceChannel = voiceChannel as VoiceChannel;
    MusicPlayer.textChannel = msgInt.channel as TextChannel;

    if (!args.length) return "Missing search query parameters!";
    const query = args[0];

    if (query.includes("soundcloud.com")) {
      return "Soundcloud support is current unavailable but in the works as soon as Soundcloud allows new Application (such as this bot) requests";
    }

    const song = await createSong(query);

    if (typeof song === "string") return song;
    MusicPlayer.queue.push(song);
    if (!msgInt.guild) return "Can't find Server Info";

    const voiceChannelOptions = {
      channelId: voiceChannel.id,
      guildId: msgInt.guild.id,
      adapterCreator: msgInt.guild
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    };

    const connection = joinVoiceChannel(voiceChannelOptions);

    if (!MusicPlayer.connection) {
      MusicPlayer.connection = connection;
    }

    if (!MusicPlayer.subscription) {
      MusicPlayer.subscription = connection.subscribe(MusicPlayer.player);
    }

    if (MusicPlayer.queue.length > 1) {
      const embed = new MessageEmbed()
        .setThumbnail(song.thumbnailUrl)
        .setTitle("Added To Queue")
        .setDescription(`***${song.title}***`)
        .setFields([
          {
            name: "Duration",
            value: `${song.lengthMinutes}:${song.lengthSeconds}`,
          },
        ])
        .setColor("BLUE")
        .setTimestamp();

      return embed;
    } else {
      MusicPlayer.playNextSong(MusicPlayer.queue[0]);
      msgInt.reply({
        content: "Successful",
        ephemeral: true,
      });
    }
  },

  error: ({ error, command }) => {
    return new MessageEmbed()
      .setTitle("Error")
      .setDescription(error)
      .setFields([{ name: "Command", value: command }])
      .setColor("RED")
      .setTimestamp();
  },
} as ICommand;

/**
 * Creates a new song based off of the query provided
 * @param {string} query - YouTube URL or string description of song to create
 * @return {Song}
 */
async function createSong(query: string): Promise<string | Song> {
  if (ytdl.validateURL(query)) {
    const songInfo = await ytdl.getInfo(query);

    const song = new Song(
      songInfo.videoDetails.title,
      songInfo.videoDetails.video_url,
      songInfo.videoDetails.thumbnails[0].url
    );
    song.setDuration(+songInfo.videoDetails.lengthSeconds);

    return song;
  } else {
    const results = await yt.search(query);
    const video = results.length > 1 ? results[0] : null;

    if (video) {
      const song = new Song(
        video.title,
        video.url,
        video.snippet.thumbnails.url
      );
      const durationStr: string = video.snippet.duration;
      const durationSplit = durationStr.split(":");
      let seconds = 0;
      let minutes = 1;

      while (durationSplit.length > 0) {
        const placeValue = durationSplit.pop();
        if (placeValue) {
          seconds += minutes * parseInt(placeValue, 10);
          minutes *= 60;
        }
      }

      song.setDuration(seconds);
      return song;
    } else {
      return "Error finding video! Validate your search and only use youtube links/searches.";
    }
  }
}
