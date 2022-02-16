import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import { schedule } from "node-cron";
import { dadBot } from ".";
import Birthday from "./Birthday";
import Config from "./Config";

/**
 * Scrubs the Firestore database of users that are no longer part of the server
 */
export default function BirthdayCleanup() {
  //Schedule cleanup at 9am (server time) every day
  schedule("00 9 * * *", async () => {
    if (!Config.server) return;
    const guild = await dadBot.client.guilds.fetch(Config.server);
    const members = await guild.members.fetch();

    //Build list of users currently in the server
    const usernames: Array<string> = [];
    members.forEach(async (member: { user: { username: string } }) => {
      usernames.push(member.user.username);
    });

    //Grab full list of user info from Firestore
    const docs = await getDocs(collection(dadBot.db, "birthdays"));

    //Compare server list with Firestore list and delete any records of users with no match
    docs.forEach(async (document) => {
      const birthday = Birthday.fromFirestore(document);
      if (!usernames.includes(birthday.username)) {
        await deleteDoc(doc(dadBot.db, "birthdays", document.id));
      }
    });
  });
  console.log("Daily Birthday Cleanup Scheduled");
}
