import {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Interaction,
} from "discord.js";
import { ICommand } from "wokcommands";
import { db } from "../../index";
export default {
  category: "Birthday",
  description: "Removes your birthday from the DadBot Database",

  slash: true,

  callback: async ({ interaction: msgInt, channel }) => {
    const username = msgInt.user.username;

    const results = await db
      .collection("birthdays")
      .where("username", "==", username)
      .get();

    if (results.empty) return "Your birthday is not in the database.";
    const birthday = results.docs[0];

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("confirm")
          .setEmoji("✔")
          .setLabel("Confirm")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("cancel")
          .setEmoji("❌")
          .setLabel("Cancel")
          .setStyle("DANGER")
      );

    await msgInt.reply({
      content: "Are you sure you want to delete your birthday?",
      components: [row],
      ephemeral: true,
    });

    const filter = (btnInt: Interaction) => {
      return msgInt.user.id === btnInt.user.id;
    };

    const collector = channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 15,
    });

    collector.on("end", async (collection) => {
      let message;

      if (collection.first()?.customId === "confirm") {
        await db.collection("birthdays").doc(birthday.id).delete();
        message = "Your birthday has been deleted.";
      } else {
        message = "Canceled.";
      }

      await msgInt.editReply({
        content: message,
        components: [],
      });
    });

    return;
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
