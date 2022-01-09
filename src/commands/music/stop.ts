import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { MusicPlayer } from "../../music-player/music-player";

export default {
  category: "Music",
  description: "Clears queue and stops Music Player.",

  slash: true,

  callback: async () => {
    MusicPlayer.queue.length = 0;
    MusicPlayer.player.stop();
    const embed = new MessageEmbed()
      .setTitle("Player Stopped")
      .setDescription("Player has been stopped and queue has been cleared!")
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
