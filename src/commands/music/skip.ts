import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { MusicPlayer } from "../../music-player/music-player";

export default {
  category: "Music",
  description: "Skips the current song in queue.",

  slash: true,

  callback: async () => {
    const song = MusicPlayer.queue.shift();
    const nextSong = MusicPlayer.queue[0];

    if (song) {
      if (nextSong) {
        MusicPlayer.playNextSong(nextSong);
      }
      return new MessageEmbed()
        .setTitle("Skipped")
        .setDescription(`***${song.title}***`)
        .setColor("BLUE")
        .setTimestamp();
    }
    return;
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
