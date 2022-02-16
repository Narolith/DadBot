import Config from "./Config";
import DadBot from "./DadBot";
import BirthdayAnnouncement from "./BirthdayAnnouncement";
import BirthdayCleanup from "./BirthdayCleanup";

//Create Instance of Bot
export const dadBot = new DadBot();

//Run once Bot is online
dadBot.client.once("ready", async () => {
  //
  await dadBot.ImportCommands();
  BirthdayCleanup();
  BirthdayAnnouncement();
  console.log("The bot is ready!");
});

dadBot.client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = dadBot.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

dadBot.client.on("voiceStateUpdate", async (oldMember, newMember) => {
  dadBot.CheckForDisconnect(newMember, oldMember);
});

dadBot.client.login(Config.botToken);
