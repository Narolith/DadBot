import {
  CacheType,
  CommandInteraction,
  GuildMember,
  MessageEmbed,
} from "discord.js";
import * as ytdl from "ytdl-core";
import * as yt from "youtube-search-without-api-key";
import { MusicPlayer } from "../classes/music-player";
import { Song } from "../classes/song";
import {
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from "@discordjs/voice";
import join from "./join";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play or Queue a song for the music player.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("<YouTube URL or Song Name>")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const voiceChannel = (interaction.member as GuildMember).voice.channel;
      if (!voiceChannel)
        return interaction.reply({
          content: "You must be connected to a voice channel",
          ephemeral: true,
        });
      if (MusicPlayer.voiceChannel !== voiceChannel)
        join.execute?.(interaction);

      const query = interaction.options.get("query")?.value as string;
      if (!query?.length)
        return interaction.reply({
          content: "Missing search query parameters!",
          ephemeral: true,
        });

      if (query.includes("soundcloud.com"))
        return interaction.reply({
          content:
            "Soundcloud support is current unavailable but in the works as soon as Soundcloud allows new Application (such as this bot) requests",
          ephemeral: true,
        });

      const song = await createSong(query);

      if (typeof song === "string")
        return interaction.reply({ content: song, ephemeral: true });
      MusicPlayer.queue.push(song);
      if (!interaction.guild)
        return interaction.reply({
          content: "Can't find Server Info",
          ephemeral: true,
        });

      const voiceChannelOptions = {
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
      };

      const connection = joinVoiceChannel(voiceChannelOptions);

      if (!MusicPlayer.connection) MusicPlayer.connection = connection;

      if (!MusicPlayer.subscription)
        MusicPlayer.subscription = connection.subscribe(MusicPlayer.player);

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

        return interaction.reply({ embeds: [embed] });
      } else {
        MusicPlayer.playNextSong(MusicPlayer.queue[0]);
        interaction.reply({
          content: "Successful",
          ephemeral: true,
        });
      }
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};

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
    const video = results?.[0];

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
