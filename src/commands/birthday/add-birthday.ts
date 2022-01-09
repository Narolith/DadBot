import { MessageEmbed, Constants } from "discord.js";
import { ICommand } from "wokcommands";
import Birthday from "../../classes/birthday";
import { db } from "../../index";
export default {
  category: "Birthday",
  description: "Adds or updates your birthday to the DadBot Database",

  slash: true,
  expectedArgs: "<Month 1-12> <Day 1-31>",
  minArgs: 2,
  maxArgs: 2,

  options: [
    {
      name: "month",
      description: "Birthday Month Number 1-12",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.NUMBER,
    },
    {
      name: "day",
      description: "Birthday Month day 1-31",
      required: true,
      type: Constants.ApplicationCommandOptionTypes.NUMBER,
    },
  ],

  callback: async ({ interaction: msgInt, args }) => {
    try {
      const month = parseInt(args[0]);
      const day = parseInt(args[1]);
      const username = msgInt.user.username;

      if (month < 1 || month > 12)
        return "Please provide a month between 1 and 12";
      if (day < 1 || day > 31) return "Please provide a day between 1 and 31";
      if (month === 2 && day > 29) return "February can not have a day over 29";
      if (
        (month === 4 || month === 6 || month === 9 || month === 11) &&
        day > 30
      )
        return "April, June, September, October and November can not have a day over 30";

      const data = new Birthday(username, month, day);

      const birthday = await db
        .collection("birthdays")
        .where("username", "==", data.username)
        .get();

      const embed = new MessageEmbed()
        .setThumbnail("https://i.imgur.com/2LQPTEO.png")
        .setColor("BLUE")
        .setTimestamp();

      if (birthday.empty) {
        db.collection("birthdays").add(Birthday.toFirestore(data));
        embed
          .setTitle("Birthday Added")
          .setDescription(`Your birthday has been added for ${month}/${day}`);
      } else {
        db.collection("birthdays")
          .doc(birthday.docs[0].id)
          .set(Birthday.toFirestore(data));
        embed
          .setTitle("Birthday Updated")
          .setDescription(`Your birthday has been updated to ${month}/${day}`);
      }

      return msgInt.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
    }
  },

  error: ({ error, command }) => {
    return new MessageEmbed()
      .setTitle("Error")
      .setDescription(error)
      .setFields([{ name: "Command", value: command }])
      .setColor("RED")
      .setTimestamp();
  },
} as ICommand;
