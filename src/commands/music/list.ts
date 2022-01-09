import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { MusicPlayer } from "../../music-player/music-player";

export default {
  category: "Music",
  description: "Shows the current Music Player queue.",

  slash: true,

  callback: async () => {
    const songs: Array<{ name: string; value: string }> = [];

    MusicPlayer.queue.forEach((song, index) => {
      songs.push({
        name: `${index + 1} - ${song.title}`,
        value: `${song.lengthMinutes}:${song.lengthSeconds}`,
      });
    });
    if (songs.length === 0) {
      songs.push({ name: "Empty", value: "No songs in the queue" });
    }
    const embed = new MessageEmbed()
      .setTitle("Queue List")
      .setDescription("The following songs are in queue!")
      .setFields(songs)
      .setColor("BLUE")
      .setTimestamp();

    return embed;
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
