import { ICommand } from "wokcommands";
import { GuildMember, MessageEmbed } from "discord.js";

export default {
  category: "General",
  description: "Display information about a user",

  slash: true,
  expectedArgs: "<Display Name>",

  callback: async ({ interaction: msgInt, args }) => {
    let identifier: string;
    if (args[0].startsWith("<@")) {
      identifier = args[0].slice(3, args[0].length - 1);
    } else if (args[0].length > 0) {
      identifier = args[0];
    } else {
      identifier = (msgInt.member as GuildMember).id;
    }

    console.log(identifier);
    if (!msgInt.guild) return "Can't find server information";
    const guild = await msgInt.guild.fetch();
    const members = await guild.members.fetch();
    const member = members.find(
      (member) =>
        member.id === identifier ||
        member.displayName.toLowerCase() === identifier.toLowerCase()
    );

    if (!member) return `Could not find info on ${identifier}`;

    const embed = new MessageEmbed()
      .setTitle(`${member.displayName}`)
      .setDescription(`Information about ${member.displayName}`)
      .setThumbnail(`${member.displayAvatarURL()}`)
      .setColor("BLUE")
      .addFields([
        {
          name: "Date Created",
          value: new Date(member.user.createdTimestamp).toDateString(),
        },
        {
          name: "Joined",
          value: member.joinedAt ? member.joinedAt.toDateString() : "N/A",
        },
        {
          name: "Roles",
          value: member.roles.cache.map((role) => role.name).join(", "),
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
