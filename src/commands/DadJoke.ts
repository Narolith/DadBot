import axios from "axios";
import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("dad-joke")
    .setDescription(
      "Display a randomly pulled dad joke from 'https://icanhazdadjoke.com/'"
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
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

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
