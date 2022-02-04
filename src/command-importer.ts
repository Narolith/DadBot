import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v9";
import { client } from ".";
import addBirthday from "./commands/add-birthday";
import dadJoke from "./commands/dad-joke";
import deleteMessages from "./commands/delete-messages";
import info from "./commands/info";
import join from "./commands/join";
import list from "./commands/list";
import play from "./commands/play";
import removeBirthday from "./commands/remove-birthday";
import repeat from "./commands/repeat";
import server from "./commands/server";
import skip from "./commands/skip";
import stop from "./commands/stop";
import Config from "./config";

const CommandImporter = async () => {
  try {
    const commands = [
      addBirthday,
      dadJoke,
      deleteMessages,
      info,
      join,
      list,
      play,
      removeBirthday,
      repeat,
      server,
      skip,
      stop,
    ];

    const commandsJson = commands.map((command) => {
      client.commands.set(command.data.name, command);
      return command.data.toJSON();
    });

    console.log("Started removing old application (/) commands.");
    const rest = new REST({ version: "9" }).setToken(Config.botToken!);
    const app = await client!.application?.fetch();
    const commandArray = await app!.commands.fetch();
    commandArray.map((command) => command.delete());

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
};
export default CommandImporter;
