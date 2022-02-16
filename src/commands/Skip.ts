import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { MusicPlayer } from "../MusicPlayer";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song in queue"),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const song = MusicPlayer.queue.shift();
      const nextSong = MusicPlayer.queue[0];

      if (song) {
        if (nextSong) MusicPlayer.playNextSong(nextSong);

        const embed = new MessageEmbed()
          .setTitle("Skipped")
          .setDescription(`***${song.title}***`)
          .setColor("BLUE")
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }
      return interaction.reply({ content: "No song to skip." });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
