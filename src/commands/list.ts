import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { MusicPlayer } from "../classes/music-player";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("Shows the current Music Player queue."),

  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const songs: Array<{ name: string; value: string }> = [];

      MusicPlayer.queue.forEach((song, index) => {
        songs.push({
          name: `${index + 1} - ${song.title}`,
          value: `${song.lengthMinutes}:${song.lengthSeconds}`,
        });
      });

      if (songs.length === 0)
        songs.push({ name: "Empty", value: "No songs in the queue" });

      const embed = new MessageEmbed()
        .setTitle("Queue List")
        .setDescription("The following songs are in queue!")
        .setFields(songs)
        .setColor("BLUE")
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
