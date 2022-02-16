import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { MusicPlayer } from "../MusicPlayer";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Clears queue and stops the Music Player"),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      MusicPlayer.queue.length = 0;
      MusicPlayer.player.stop();
      const embed = new MessageEmbed()
        .setTitle("Player Stopped")
        .setDescription("Player has been stopped and queue has been cleared!")
        .setColor("BLUE")
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
