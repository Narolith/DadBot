import { GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { ICommand } from "wokcommands";
import { MusicPlayer } from "../../music-player/music-player";
import {
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from "@discordjs/voice";

export default {
  category: "Music",
  description: "Joins the current voice channel.",

  slash: true,

  callback: async ({ interaction: msgInt }) => {
    const voiceChannel = (msgInt.member as GuildMember).voice.channel;
    if (!voiceChannel) {
      return msgInt.reply({
        content: "You must be in a voice channel",
        ephemeral: true,
      });
    }

    const permissions = voiceChannel.permissionsFor(msgInt.user);
    if (
      permissions === null ||
      !permissions.has("CONNECT") ||
      !permissions.has("SPEAK")
    )
      return msgInt.reply({
        content: "You dont have the correct permissions",
        ephemeral: true,
      });

    if (MusicPlayer.voiceChannel === voiceChannel) {
      return msgInt.reply({
        content: "Already connected to your voice channel!",
        ephemeral: true,
      });
    }

    MusicPlayer.voiceChannel = voiceChannel as VoiceChannel;
    MusicPlayer.textChannel = msgInt.channel as TextChannel;

    if (!msgInt.guild) return "Can't find Server Info";

    const voiceChannelOptions = {
      channelId: voiceChannel.id,
      guildId: msgInt.guild.id,
      adapterCreator: msgInt.guild
        .voiceAdapterCreator as DiscordGatewayAdapterCreator,
    };

    const connection = joinVoiceChannel(voiceChannelOptions);

    if (!MusicPlayer.connection) {
      MusicPlayer.connection = connection;
    }

    if (!MusicPlayer.subscription) {
      MusicPlayer.subscription = connection.subscribe(MusicPlayer.player);
    }

    msgInt.reply({
      ephemeral: true,
      content: "Join Successful",
    });
  },
} as ICommand;
