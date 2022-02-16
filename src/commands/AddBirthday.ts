import { CacheType, CommandInteraction, MessageEmbed } from "discord.js";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import Birthday from "../Birthday";
import { SlashCommandBuilder } from "@discordjs/builders";
import { dadBot } from "..";
export default {
  data: new SlashCommandBuilder()
    .setName("add-birthday")
    .setDescription("Adds or updates your birthday to the DadBot Database")
    .addNumberOption((option) =>
      option.setName("month").setDescription("<Month 1-12>").setRequired(true)
    )
    .addNumberOption((option) =>
      option.setName("day").setDescription("<Day 1-31>").setRequired(true)
    ),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const month = interaction.options.get("month")?.value as number;
      const day = interaction.options.get("day")?.value as number;
      const username = interaction.user.username;
      if (!month || !day)
        return interaction.reply({
          content:
            "Something went wrong with your month or day.  Please try again.",
          ephemeral: true,
        });

      const validation = inputValidation({ month: month, day: day });
      if (validation)
        return interaction.reply({ content: validation, ephemeral: true });
      const newBirthday = new Birthday(username, month, day);

      const q = query(
        collection(dadBot.db, "birthdays"),
        where("username", "==", newBirthday.username)
      );
      const birthday = await getDocs(q);

      const embed = new MessageEmbed()
        .setThumbnail("https://i.imgur.com/2LQPTEO.png")
        .setColor("BLUE")
        .setTimestamp();

      if (birthday.empty) {
        addDoc(
          collection(dadBot.db, "birthdays"),
          Birthday.toFirestore(newBirthday)
        );
        embed
          .setTitle("Birthday Added")
          .setDescription(`Your birthday has been added for ${month}/${day}`);
      } else {
        setDoc(
          doc(dadBot.db, "birthdays", birthday.docs[0].id),
          Birthday.toFirestore(newBirthday)
        );
        embed
          .setTitle("Birthday Updated")
          .setDescription(`Your birthday has been updated to ${month}/${day}`);
      }

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};

function inputValidation(input: { month: number; day: number }) {
  const { month, day } = input;

  if (month < 1 || month > 12) return "Please provide a month between 1 and 12";
  if (day < 1 || day > 31) return "Please provide a day between 1 and 31";
  if (month === 2 && day > 29) return "February can not have a day over 29";
  if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30)
    return "April, June, September, October and November can not have a day over 30";
  return false;
}
