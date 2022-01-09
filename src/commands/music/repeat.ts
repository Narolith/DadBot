import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";
import { MusicPlayer } from "../../music-player/music-player";

export default {
  category: "Music",
  description: "Loops the next or current song until turned off.",
  expectedArgs: "<On or Off>",
  minArgs: 1,
  slash: true,

  callback: async ({ args }) => {
    if (args[0] === "on") {
      MusicPlayer.repeat = true;

      return new MessageEmbed()
        .setTitle("Repeat On")
        .setDescription(
          "The current song, or next song if not playing one, will repeat until turned off."
        )
        .setColor("BLUE")
        .setTimestamp();
    } else if (args[0] === "off") {
      MusicPlayer.repeat = false;
      return new MessageEmbed()
        .setTitle("Repeat Off")
        .setDescription(
          "The current song, or next song if not playing one, will no longer repeat."
        )
        .setColor("BLUE")
        .setTimestamp();
    } else {
      return new MessageEmbed()
        .setTitle("Music")
        .setDescription("Must use \"!repeat on\" or \"!repeat off\"")
        .setColor("BLUE")
        .setTimestamp();
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
