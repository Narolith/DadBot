import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("delete-messages")
    .setDescription("Deletes a set amount of messages")
    .addNumberOption((option) =>
      option.setName("msg-count").setDescription("<0-99>").setRequired(true)
    )
    .setDefaultPermission(false),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const messageCount = interaction.options.get("msg-count")
        ?.value as number;
      if (messageCount > 99 || messageCount < 0)
        return interaction.reply({
          content: "Please provide a number between 1 and 99",
          ephemeral: true,
        });
      const channel = interaction.channel;
      if (!channel || channel.type === "DM")
        return interaction.reply({
          content: "Can't delete in direct messages",
          ephemeral: true,
        });
      channel.bulkDelete(messageCount, true);
      const embed = new MessageEmbed()
        .setTitle("Deleted messages successfully")
        .setDescription(
          `I may not have deleted all ${messageCount} messages as I can't delete messages older than 14 days old.`
        )
        .setColor("BLUE")
        .setTimestamp();

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
