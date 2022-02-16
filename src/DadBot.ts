import {
  CacheType,
  Client,
  Collection,
  CommandInteraction,
  Intents,
  VoiceState,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types";
import Commands from "./CommandExporter";
import Config from "./Config";
import { MusicPlayer } from "./MusicPlayer";

/**
 * Creates an instance of DadBot. This includes the discord client, firebase app, firestore db, and commands collection.
 */
class DadBot {
  constructor() {
    //initialize discord bot client
    this.client = new Client({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
    });
    //initialize firebase app
    this.app = initializeApp(
      {
        projectId: Config.fireStoreProjectId,
        databaseURL: Config.dbUrl,
        apiKey: Config.apiKey,
      },
      "DadBot"
    );
    //initialize firestore database
    this.db = getFirestore(this.app);
    //initialize collection to house bot commands
    this.commands = new Collection();
  }
  client: Client;
  app: FirebaseApp;
  db: Firestore;
  commands: Collection<
    string,
    {
      data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
      execute(interaction: CommandInteraction<CacheType>): any;
    }
  >;

  /**
   * Imports commands from files and then reset
   */
  async ImportCommands() {
    try {
      //Build list of commands from files
      const commands = Commands.map((command) => {
        return command;
      });

      //Convert commands to JSON for server
      const commandsJson = commands.map((command) => {
        this.commands.set(command.data.name, command);
        return command.data.toJSON();
      });
      const rest = new REST({ version: "9" }).setToken(Config.botToken!);

      //Grabs list of old commands and deletes them
      const app = await this.client?.application?.fetch();
      const commandArray = await app?.commands.fetch();
      console.log("Started removing old application (/) commands.");
      commandArray?.map((command) => command.delete());

      //Grabs JSON command list and pushes to server
      console.log("Started refreshing application (/) commands.");
      await rest.put(
        Routes.applicationGuildCommands(Config.appId!, Config.server!),
        {
          body: commandsJson,
        }
      );

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Checks if bot was kicked/removed from voice channel without the leave command and handles cleanup
   * @param {VoiceState} newMember
   * @param {VoiceState} oldMember
   */
  CheckForDisconnect(newMember: VoiceState, oldMember: VoiceState) {
    //Checks if the user is the bot
    if (!this.client.user) return;
    if (newMember.id !== this.client.user.id) return;

    //Checks if the bot was in a channel playing music
    if (oldMember.channelId !== MusicPlayer.voiceChannel?.id) return;

    //Checks if bot was disconnected from the channel
    if (newMember.channelId !== null) return;

    //If all the above gates pass, bot was disconnected from channel
    //and needs MusicPlayer settings need to be reset to work again
    if (MusicPlayer.connection) {
      MusicPlayer.connection.disconnect();
      MusicPlayer.connection = null;
    }

    if (MusicPlayer.subscription) {
      MusicPlayer.subscription.unsubscribe();
      MusicPlayer.subscription = null;
    }

    if (MusicPlayer.queue.length > 0) {
      MusicPlayer.queue.length = 0;
    }
  }
}

export default DadBot;
