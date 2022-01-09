import { MessageEmbed } from "discord.js";
import { ICommand } from "wokcommands";

export default {
  category: "Moderation",
  description: "Deletes a set amount of messages",

  slash: true,

  expectedArgs: "<0-99>",
  minArgs: 1,
  requiredPermissions: ["MANAGE_MESSAGES"],

  callback: async ({ interaction: msgInt, channel, args }) => {
    const messageCount = Number(args[0]);
    if (messageCount > 99 || messageCount < 0)
      return "Please provide a number between 1 and 99";
    channel.bulkDelete(messageCount, true);

    const embed = new MessageEmbed()
      .setTitle("Deleted messages successfully")
      .setDescription(
        `I may not have deleted all ${messageCount} messages as I can't delete messages older than 14 days old.`
      )
      .setColor("BLUE")
      .setTimestamp();

    return msgInt.reply({
      embeds: [embed],
      ephemeral: true,
    });
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
