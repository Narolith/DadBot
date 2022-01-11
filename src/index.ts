import { Client, Intents, MessageEmbed, TextChannel } from "discord.js";
import WOKComands from "wokcommands";
import * as path from "path";
import { MusicPlayer } from "./music-player/music-player";
import { schedule } from "node-cron";
import Config from "./config";
import Birthday from "./classes/birthday";
import * as firebase from "firebase-admin";

import { ServiceAccount } from "firebase-admin";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const serviceAccount: ServiceAccount = {
  projectId: Config.fireStoreProjectId,
  clientEmail: Config.fireStoreClientEmail,
  privateKey: Config.fireStorePrivateKey,
};

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

export const db = firebase.firestore();

client.once("ready", async () => {
  new WOKComands(client, {
    commandDir: path.join(__dirname, "commands"),
    botOwners: ["145787000425938944", "144999776708984832"],
  });

  schedule("00 9 * * *", async () => {
    if (!Config.server) return;
    const guild = await client.guilds.fetch(Config.server);
    const members = await guild.members.fetch();

    const usernames: Array<string> = [];
    members.forEach(async (member) => {
      usernames.push(member.user.username);
    });

    const docs = await db.collection("birthdays").get();

    docs.forEach((doc) => {
      const birthday = Birthday.fromFirestore(doc);
      if (!usernames.includes(birthday.username)) {
        db.collection("birthdays").doc(doc.id).delete();
      }
    });
  });
  console.log("Daily Birthday Cleanup Scheduled");

  schedule("00 10 * * *", async () => {
    const month = Number(new Date().getMonth()) + 1;
    const day = new Date().getDate();

    const docs = await db
      .collection("birthdays")
      .where("month", "==", month)
      .where("day", "==", day)
      .get();

    if (docs.empty) return;

    let birthdayList = "";
    docs.forEach((doc) => {
      const birthday = Birthday.fromFirestore(doc.data());
      birthdayList += `${birthday.username}\n`;
    });
    const guild = client.guilds.cache.find(
      (guild) => guild.id === Config.server
    );

    if (!guild) return;
    const roleToMention = guild.roles.cache.find(
      (role) => role.id === Config.announcementRole
    );
    const channelToMsg = client.channels.cache.find(
      (channel) => channel.id === Config.generalChannel
    ) as TextChannel;

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

  console.log("Daily Birthday Message Check Scheduled");

  console.log("The bot is ready!");
});

client.on("voiceStateUpdate", async (oldMember, newMember) => {
  if (!client.user) return;
  if (newMember.id === client.user.id) {
    if (oldMember.channelId === MusicPlayer.voiceChannel?.id) {
      if (newMember.channelId === null) {
        if (MusicPlayer.connection) {
          MusicPlayer.connection.disconnect();
          MusicPlayer.connection = null;
        }

        if (MusicPlayer.subscription) {
          MusicPlayer.subscription?.unsubscribe();
          MusicPlayer.subscription = null;
        }

        if (MusicPlayer.queue.length > 0) {
          MusicPlayer.queue.length = 0;
        }
      }
    }
  }
});

client.login(Config.botToken);
