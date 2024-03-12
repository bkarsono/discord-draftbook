const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");
const Bet = require("../../models/Bet.js");
const User = require("../../models/User.js");
const sum = require("../../utils/sum");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: "You can only run this command inside a server.",
        ephemeral: true,
      });
      return;
    }
    try {
      await interaction.deferReply();
      const targetEventId = interaction.options.get("event").value;
      const targetWinner = interaction.options.get("winner").value;
      let query1 = {
        eventId: targetEventId,
        guildId: interaction.guild.id,
      };
      let bet = await Bet.findOne(query1);
      if (!bet) {
        interaction.editReply(`Event "${targetEventId}" not found.`);
        return;
      }
      const sumFirst = sum(bet.first.values());
      const sumSecond = sum(bet.second.values());
      let total = 0;
      let count = 0;
      if (bet.firstId === targetWinner) {
        let firstUser = "";
        let addFirstUser = true;
        for (const currentPair of bet.first) {
          ++count;
          const currentUserId = currentPair[0];
          const currentBerries = currentPair[1];
          if (addFirstUser) {
            addFirstUser = false;
            const targetUserObj = await interaction.guild.members.fetch(
              currentUserId
            );
            firstUser = targetUserObj.user.tag;
          }
          let user = await User.findOne({
            userId: currentUserId,
            guildId: interaction.guild.id,
          });
          const toAdd = Math.floor(
            currentBerries + (currentBerries / sumFirst) * sumSecond
          );
          user.berries += toAdd;
          total += toAdd;
          await user.save();
        }
        if (count === 0) {
          interaction.editReply(
            `WOMP WOMP ${sumSecond} total berries lost on event "${targetEventId}". Should've bet on "${targetWinner}"!`
          );
        } else {
          interaction.editReply(
            `"${targetWinner}" won on event "${targetEventId}"! ${total} berries go to ${firstUser} and ${
              count - 1
            } others.`
          );
        }
        await Bet.findOneAndDelete({ eventId: targetEventId });
        return;
      } else if (bet.secondId === targetWinner) {
        let firstUser = "";
        let addFirstUser = true;
        for (const currentPair of bet.second) {
          ++count;
          const currentUserId = currentPair[0];
          const currentBerries = currentPair[1];
          if (addFirstUser) {
            addFirstUser = false;
            const targetUserObj = await interaction.guild.members.fetch(
              currentUserId
            );
            firstUser = targetUserObj.user.tag;
          }
          let user = await User.findOne({
            userId: currentUserId,
            guildId: interaction.guild.id,
          });
          const toAdd = Math.floor(
            currentBerries + (currentBerries / sumSecond) * sumFirst
          );
          user.berries += toAdd;
          total += toAdd;
          await user.save();
        }
        if (count === 0) {
          interaction.editReply(
            `WOMP WOMP ${sumFirst} total berries lost on event "${targetEventId}". Should've bet on "${targetWinner}"!`
          );
        } else {
          interaction.editReply(
            `"${targetWinner}" won on event "${targetEventId}"! ${total} berries go to ${firstUser} and ${
              count - 1
            } others.`
          );
        }
        await Bet.findOneAndDelete({ eventId: targetEventId });
        return;
      } else {
        interaction.editReply({
          content: `Winner "${targetChoice}" invalid for event "${targetEventId}".`,
          ephemeral: true,
        });
        return;
      }
    } catch (error) {
      console.log(`Error with /bet: ${error}`);
    }
  },
  name: "close",
  description: "Payout for an event!",
  options: [
    {
      name: "event",
      description: "The event you want to close.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "winner",
      description: "The option that won. View options using /options [event].",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  devOnly: true,
};
