const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");
const Bet = require("../../models/Bet.js");
const User = require("../../models/User.js");

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
      await interaction.deferReply({ ephemeral: true });
      const targetEventId = interaction.options.get("event").value;
      const targetChoice = interaction.options.get("choice").value;
      const targetAmount = interaction.options.get("amount").value;
      if (!Number.isInteger(targetAmount)) {
        interaction.editReply(`${targetAmount} is not an integer.`);
        return;
      }
      if (targetAmount < 0) {
        interaction.editReply(`${targetAmount} is negative.`);
        return;
      }
      let query1 = {
        eventId: targetEventId,
        guildId: interaction.guild.id,
      };
      let bet = await Bet.findOne(query1);
      if (!bet) {
        interaction.editReply(`Event "${targetEventId}" not found.`);
        return;
      }
      let query2 = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };
      let user = await User.findOne(query2);
      if (!user) {
        user = new User({
          ...query2,
          lastDaily: new Date("2014-02-02"),
        });
        await user.save();
      }
      if (user.berries < targetAmount) {
        interaction.editReply(
          `You only have ${user.berries} berries in your account.`
        );
        return;
      }
      if (bet.firstId === targetChoice) {
        if (!(bet.second.get(interaction.member.id) === undefined)) {
          interaction.editReply("You have already bet on the other option.");
          return;
        }
        if (bet.first.get(interaction.member.id) === undefined) {
          bet.first.set(interaction.member.id, 0);
        }
        bet.first.set(
          interaction.member.id,
          bet.first.get(interaction.member.id) + targetAmount
        );
        user.berries -= targetAmount;
        await user.save();
        await bet.save();
        interaction.editReply(
          `You now have ${bet.first.get(
            interaction.member.id
          )} berries on "${targetChoice}" for event "${targetEventId}". Good luck!`
        );
        return;
      } else if (bet.secondId === targetChoice) {
        if (!(bet.first.get(interaction.member.id) === undefined)) {
          interaction.editReply("You have already bet on the other option.");
          return;
        }
        if (bet.second.get(interaction.member.id) === undefined) {
          bet.second.set(interaction.member.id, 0);
        }
        bet.second.set(
          interaction.member.id,
          bet.second.get(interaction.member.id) + targetAmount
        );
        user.berries -= targetAmount;
        await user.save();
        await bet.save();
        interaction.editReply(
          `You now have ${bet.second.get(
            interaction.member.id
          )} berries on "${targetChoice}" for event "${targetEventId}". Good luck!`
        );
        return;
      } else {
        interaction.editReply(
          `Choice "${targetChoice}" invalid for event "${targetEventId}".`
        );
        return;
      }
    } catch (error) {
      console.log(`Error with /bet: ${error}`);
    }
  },
  name: "bet",
  description: "Bet on an event!",
  options: [
    {
      name: "event",
      description: "The event you want to bet on.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "choice",
      description:
        "Choose which option you want to bet on. View options using /options [event].",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "amount",
      description: "The amount you want to bet.",
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
};
