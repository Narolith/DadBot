import {
  CacheType,
  CommandInteraction,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { MusicPlayer } from "../MusicPlayer";
import {
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from "@discordjs/voice";
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Dadbot will join your current voice channel"),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const voiceChannel = (interaction.member as GuildMember).voice.channel;
      if (!voiceChannel)
        return interaction.reply({
          content: "You must be in a voice channel",
          ephemeral: true,
        });

      const permissions = voiceChannel.permissionsFor(interaction.user);
      if (
        permissions === null ||
        !permissions.has("CONNECT") ||
        !permissions.has("SPEAK")
      )
        return interaction.reply({
          content: "You dont have the correct permissions",
          ephemeral: true,
        });

      if (MusicPlayer.voiceChannel === voiceChannel)
        return interaction.reply({
          content: "Already connected to your voice channel!",
          ephemeral: true,
        });

      MusicPlayer.voiceChannel = voiceChannel as VoiceChannel;
      MusicPlayer.textChannel = interaction.channel as TextChannel;

      if (!interaction.guild)
        return interaction.reply({
          content: "Can't find Server Info",
          ephemeral: true,
        });

      const voiceChannelOptions = {
        channelId: voiceChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
      };

      const connection = joinVoiceChannel(voiceChannelOptions);

      if (!MusicPlayer.connection) MusicPlayer.connection = connection;

      if (!MusicPlayer.subscription)
        MusicPlayer.subscription = connection.subscribe(MusicPlayer.player);

      interaction.channel!.send({
        content: "Join Successful",
      });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
