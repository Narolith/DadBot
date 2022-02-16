import { MessageEmbed, Guild, TextChannel } from "discord.js";
import {
  QuerySnapshot,
  DocumentData,
  query,
  collection,
  where,
  getDocs,
} from "firebase/firestore";
import { schedule } from "node-cron";
import { dadBot } from ".";
import Birthday from "./Birthday";
import Config from "./Config";

/**
 * Sets birthday annoucement scheduled for 10am (server time) every day
 */
export default function BirthdayAnnouncement() {
  schedule("00 10 * * *", async () => {
    //Check if there are any birthdays for the day
    const docs = await getMonthBirthdays();
    if (docs.empty) return;

    //Build a list for birthday annoucement
    let birthdayList = buildUsernameList(docs);
    const guild = dadBot.client.guilds.cache.find(
      (guild: { id: string | undefined }) => guild.id === Config.server
    );
    if (!guild) return;

    //Build birthday message and send to Discord server
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

/**
 * Obtains the role and channel used in annoucements
 * @param guild Discord Server
 * @returns Discord Role and Channel
 */
function getServerInfo(guild: Guild) {
  const roleToMention = guild.roles.cache.find(
    (role) => role.id === Config.announcementRole
  );
  const channelToMsg = dadBot.client.channels.cache.find(
    (channel: { id: string | undefined }) =>
      channel.id === Config.generalChannel
  ) as TextChannel;
  return { roleToMention, channelToMsg };
}

/**
 * Builds a list of users from the docs provided
 * @param docs Firestore docs with user information
 * @returns String of usernames (1 per line)
 */
function buildUsernameList(docs: QuerySnapshot<DocumentData>) {
  let birthdayList = "";
  docs.forEach((document) => {
    const birthday = Birthday.fromFirestore(document.data());
    birthdayList += `${birthday.username}\n`;
  });
  return birthdayList;
}

/**
 * Queries Firestore for users with a birthday for the current month and day
 * @returns Firestore docs with user information
 */
async function getMonthBirthdays() {
  const month = Number(new Date().getMonth()) + 1;
  const day = new Date().getDate();
  const q = query(
    collection(dadBot.db, "birthdays"),
    where("month", "==", month),
    where("day", "==", day)
  );
  const docs = await getDocs(q);
  return docs;
}
