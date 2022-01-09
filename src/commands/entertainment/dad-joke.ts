import axios from "axios";
import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {
  category: "Entertainment",
  description:
    "Display a randomly pulled dad joke from \"https://icanhazdadjoke.com/\"",

  slash: true,

  callback: async () => {
    const uri = "https://icanhazdadjoke.com/";
    const { data } = await axios.get(uri, {
      headers: {
        Accept: "application/json",
        "User-Agent": "DadBot (https://github.com/narolith/DadBot)",
      },
    });

    const embed = new MessageEmbed()
      .setTitle("Dad Joke")
      .setDescription(data.joke)
      .setThumbnail("https://i.imgur.com/cCbgCwj.png")
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
