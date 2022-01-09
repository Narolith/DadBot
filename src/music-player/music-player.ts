import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  PlayerSubscription,
  VoiceConnection,
} from "@discordjs/voice";
import { MessageEmbed, TextChannel, VoiceChannel } from "discord.js";
import ytdl from "ytdl-core";
import { Song } from "./song";
import Config from "../config";

/**
 * Music player with queue
 */
export abstract class MusicPlayer {
  public static voiceChannel: VoiceChannel | null;
  public static textChannel: TextChannel | null;
  public static connection: VoiceConnection | null;
  public static repeat: boolean;
  public static queue: Song[] = new Array<Song>();
  public static dcTimer: NodeJS.Timeout | null;
  public static subscription: PlayerSubscription | null | undefined;

  public static player = createAudioPlayer()
    .on(AudioPlayerStatus.Idle, async () => {
      if (!MusicPlayer.repeat) {
        MusicPlayer.queue.shift();
      }
      if (MusicPlayer.queue.length > 0) {
        MusicPlayer.playNextSong(MusicPlayer.queue[0]);
      } else {
        MusicPlayer.dcTimer = setTimeout(async () => {
          if (MusicPlayer.connection) {
            MusicPlayer.connection.disconnect();
          }
          MusicPlayer.connection = null;
          MusicPlayer.subscription?.unsubscribe();
          MusicPlayer.subscription = null;
          const embed = new MessageEmbed()
            .setTitle("Inactive")
            .setDescription(
              "Oh would you look at the time, I need to go out for some cigarettes and milk. I'll be back soon."
            )
            .setColor("BLUE")
            .setTimestamp();
          if (MusicPlayer.textChannel) {
            await MusicPlayer.textChannel.send({ embeds: [embed] });
          }
        }, 300000);

        const embed = new MessageEmbed()
          .setTitle("Empty Queue")
          .setDescription("No more songs.")
          .setColor("BLUE")
          .setTimestamp();
        if (MusicPlayer.textChannel) {
          await MusicPlayer.textChannel.send({ embeds: [embed] });
        }
      }
    })
    .on("error", async (error) => {
      const embed = new MessageEmbed()
        .setTitle("ERROR - Music")
        .setDescription("There was a problem playing the next song, skipping.")
        .setFields([{ name: "Error Code", value: error.message }])
        .setColor("RED")
        .setTimestamp();
      if (MusicPlayer.textChannel) {
        await MusicPlayer.textChannel.send({ embeds: [embed] });
      }
      MusicPlayer.queue.shift();
      if (MusicPlayer.queue.length > 0) {
        MusicPlayer.playNextSong(MusicPlayer.queue[0]);
      }
    })
    .on(AudioPlayerStatus.Playing, async () => {
      if (MusicPlayer.dcTimer) {
        clearTimeout(MusicPlayer.dcTimer);
        MusicPlayer.dcTimer = null;
      }
    });

  /**
   * Grabs the song stream from YouTube and submits it to the Music Player to play.
   * @param {Song} song - Song to be played
   */
  public static async playNextSong(song: Song): Promise<void> {
    const stream = ytdl(song.url, {
      filter: "audioonly",
      highWaterMark: 1 << 25,
      requestOptions: {
        type: "opus",
        headers: {
          cookie: Config.youtubeCookie,
        },
      },
      quality: "highestaudio",
    });

    const resource = createAudioResource(stream);

    MusicPlayer.player.play(resource);

    const embed = new MessageEmbed()
      .setThumbnail(song.thumbnailUrl)
      .setTitle("Now Playing")
      .setDescription(`***${song.title}***`)
      .setFields([
        {
          name: "Duration",
          value: `${song.lengthMinutes}:${song.lengthSeconds}`,
        },
      ])
      .setColor("BLUE")
      .setTimestamp();
    if (MusicPlayer.textChannel) {
      await MusicPlayer.textChannel.send({ embeds: [embed] });
    }
  }
}
