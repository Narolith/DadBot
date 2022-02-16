import {
  MessageActionRow,
  MessageButton,
  Interaction,
  CommandInteraction,
  CacheType,
} from "discord.js";
import {
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { SlashCommandBuilder } from "@discordjs/builders";
import { dadBot } from "..";

export default {
  data: new SlashCommandBuilder()
    .setName("remove-birthday")
    .setDescription("Removes your birthday from the DadBot Database"),
  async execute(interaction: CommandInteraction<CacheType>) {
    try {
      const username = interaction.user.username;

      const q = query(
        collection(dadBot.db, "birthdays"),
        where("username", "==", username)
      );
      const results = await getDocs(q);

      if (results.empty)
        return interaction.reply({
          content: "Your birthday is not in the database.",
          ephemeral: true,
        });
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

      await interaction.reply({
        content: "Are you sure you want to delete your birthday?",
        components: [row],
        ephemeral: true,
      });

      const filter = (btnInt: Interaction) => {
        return interaction.user.id === btnInt.user.id;
      };
      if (!interaction.channel)
        return interaction.editReply({
          content: "Can't detect channel",
        });
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        max: 1,
        time: 1000 * 15,
      });

      collector.on("end", async (collection) => {
        let message;

        if (collection.first()?.customId === "confirm") {
          await deleteDoc(doc(dadBot.db, "birthdays", birthday.id));
          message = "Your birthday has been deleted.";
        } else {
          message = "Canceled.";
        }

        await interaction.editReply({
          content: message,
          components: [],
        });
      });

      return;
    } catch (err) {
      console.log(err);
      return interaction.reply({ content: "Failed", ephemeral: true });
    }
  },
};
