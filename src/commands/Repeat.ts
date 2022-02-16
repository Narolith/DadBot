import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { MusicPlayer } from "../MusicPlayer";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Loops the next or current song until turned off.")
    .addBooleanOption((option) =>
      option.setName("toggle").setDescription("<On or Off>").setRequired(true)
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const toggle = interaction.options.get("toggle")?.value as boolean;
      let embed: MessageEmbed;
      if (toggle === true) {
        MusicPlayer.repeat = true;

        embed = new MessageEmbed()
          .setTitle("Repeat On")
          .setDescription(
            "The current song, or next song if not playing one, will repeat until turned off."
          )
          .setColor("BLUE")
          .setTimestamp();
      } else if (toggle === false) {
        MusicPlayer.repeat = false;
        embed = new MessageEmbed()
          .setTitle("Repeat Off")
          .setDescription(
            "The current song, or next song if not playing one, will no longer repeat."
          )
          .setColor("BLUE")
          .setTimestamp();
      } else {
        embed = new MessageEmbed()
          .setTitle("Music")
          .setDescription('Must use "!repeat on" or "!repeat off"')
          .setColor("BLUE")
          .setTimestamp();
      }
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
