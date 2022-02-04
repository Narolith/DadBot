import {
  CacheType,
  Client,
  ClientOptions,
  Collection,
  CommandInteraction,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

class CustomClient extends Client {
  constructor(props: ClientOptions) {
    super(props);
    this.commands = new Collection();
  }
  commands: Collection<
    string,
    {
      data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
      execute(interaction: CommandInteraction<CacheType>): any;
    }
  >;
}

export default CustomClient;
