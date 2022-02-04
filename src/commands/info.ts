import {
  CacheType,
  CommandInteraction,
  GuildMember,
  MessageEmbed,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Display information about a user")
    .addStringOption((option) =>
      option.setName("display-name").setDescription("<Display Name>")
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      let identifier: string;
      const displayName = interaction.options.get("display-name")
        ?.value as string;
      if (displayName?.startsWith("<@")) {
        identifier = displayName.slice(3, displayName.length - 1);
      } else if (displayName?.length > 0) {
        identifier = displayName;
      } else {
        identifier = (interaction.member as GuildMember).id;
      }

      if (!interaction.guild)
        return interaction.reply({
          content: "Can't find server information",
          ephemeral: true,
        });
      const guild = await interaction.guild.fetch();
      const members = await guild.members.fetch();
      const member = members.find(
        (member) =>
          member.id === identifier ||
          member.displayName.toLowerCase() === identifier.toLowerCase()
      );

      if (!member)
        return interaction.reply({
          content: `Could not find info on ${identifier}`,
          ephemeral: true,
        });

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

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
