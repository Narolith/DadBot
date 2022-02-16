import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Display information about the current server"),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      if (!interaction.guild)
        return interaction.reply({
          content: "Can't find server information",
          ephemeral: true,
        });
      const guild = await interaction.guild.fetch();
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

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
