import { ICommand } from "wokcommands";
import { MessageEmbed } from "discord.js";
export default {
  category: "General",
  description: "Display information about the current server",

  slash: true,

  callback: async ({ interaction: msgInt }) => {
    if (!msgInt.guild) return "Can't find server information";
    const guild = await msgInt.guild.fetch();
    const owner = await guild.fetchOwner();
    const guildMembers = guild.members.cache.filter(
      (member) => !member.user.bot
    );
    const memberCountOnline = [];

    guildMembers.forEach((member) => {
      if (member.presence && member.presence.status === "online") {
        memberCountOnline.push(member);
      }
    });

    const embed = new MessageEmbed()
      .setTitle(`${guild.name}`)
      .setDescription(`Server Information for ${guild.name}`)
      .setThumbnail(`${guild.iconURL()}`)
      .setColor("BLUE")
      .addFields([
        {
          name: "Owner",
          value: owner.displayName,
        },
        {
          name: "Date Created",
          value: new Date(guild.createdTimestamp).toDateString(),
        },
        {
          name: "Total Members",
          value: guildMembers.size.toString(),
        },
        {
          name: "Online Members",
          value: memberCountOnline.length.toString(),
        },
      ])
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
