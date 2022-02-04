import {
  Guild,
  Intents,
  MessageEmbed,
  TextChannel,
  VoiceState,
} from "discord.js";
import {
  where,
  doc,
  collection,
  deleteDoc,
  getDocs,
  query,
  getFirestore,
  DocumentData,
  QuerySnapshot,
} from "@firebase/firestore";
import { initializeApp, FirebaseOptions } from "firebase/app";
import { MusicPlayer } from "./classes/music-player";
import { schedule } from "node-cron";
import Config from "./config";
import Birthday from "./classes/birthday";
import CommandImporter from "./command-importer";
import CustomClient from "./classes/custom-client";

export const client = new CustomClient({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const appOptions: FirebaseOptions = {
  projectId: Config.fireStoreProjectId,
  databaseURL: Config.dbUrl,
  apiKey: Config.apiKey,
};

const app = initializeApp(appOptions, "DadBot");
export const db = getFirestore(app);

client.once("ready", async () => {
  await CommandImporter();
  birthdayCleanup();
  birthdayAnnouncement();
  console.log("The bot is ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const command = client.commands.get(interaction.commandName);

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

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  checkForDisconnect(newMember, oldMember);
});

client.login(Config.botToken);

/**
 * Checks if bot was kicked/removed from voice channel without the leave command and handles cleanup
 * @param {VoiceState} newMember
 * @param {VoiceState} oldMember
 */
function checkForDisconnect(newMember: VoiceState, oldMember: VoiceState) {
  if (!client.user) return;
  if (newMember.id !== client.user.id) return;
  if (oldMember.channelId !== MusicPlayer.voiceChannel?.id) return;
  if (newMember.channelId !== null) return;

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

function birthdayAnnouncement() {
  schedule("00 10 * * *", async () => {
    const month = Number(new Date().getMonth()) + 1;
    const day = new Date().getDate();
    const docs = await getMonthBirthdays(month, day);

    if (docs.empty) return;
    let birthdayList = buildUsernameList(docs);
    const guild = client.guilds.cache.find(
      (guild) => guild.id === Config.server
    );

    if (!guild) return;
    const { roleToMention, channelToMsg } = getServerInfo(guild);

    const embed = new MessageEmbed()
      .setTitle("Birthday People!")
      .setDescription(
        `${roleToMention}, join me in wishing the following special people a happy birthday!`
      )
      .addField("Members", birthdayList)
      .setThumbnail("https://i.imgur.com/2LQPTEO.png")
      .setColor("BLUE")
      .setTimestamp();

    channelToMsg.send({ embeds: [embed] });
  });
  console.log("Daily Birthday Message Announcement Scheduled");
}

function getServerInfo(guild: Guild) {
  const roleToMention = guild.roles.cache.find(
    (role) => role.id === Config.announcementRole
  );
  const channelToMsg = client.channels.cache.find(
    (channel) => channel.id === Config.generalChannel
  ) as TextChannel;
  return { roleToMention, channelToMsg };
}

function buildUsernameList(docs: QuerySnapshot<DocumentData>) {
  let birthdayList = "";
  docs.forEach((document) => {
    const birthday = Birthday.fromFirestore(document.data());
    birthdayList += `${birthday.username}\n`;
  });
  return birthdayList;
}

async function getMonthBirthdays(month: number, day: number) {
  const q = query(
    collection(db, "birthdays"),
    where("month", "==", month),
    where("day", "==", day)
  );
  const docs = await getDocs(q);
  return docs;
}

function birthdayCleanup() {
  schedule("00 9 * * *", async () => {
    if (!Config.server) return;
    const guild = await client.guilds.fetch(Config.server);
    const members = await guild.members.fetch();

    const usernames: Array<string> = [];
    members.forEach(async (member) => {
      usernames.push(member.user.username);
    });

    const docs = await getDocs(collection(db, "birthdays"));

    docs.forEach(async (document) => {
      const birthday = Birthday.fromFirestore(document);
      if (!usernames.includes(birthday.username)) {
        await deleteDoc(doc(db, "birthdays", document.id));
      }
    });
  });
  console.log("Daily Birthday Cleanup Scheduled");
}
