const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");
const Bet = require("../../models/Bet.js");
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
      await interaction.deferReply({ ephemeral: true });
      const targetEventId = interaction.options.get("event").value;
      const targetFirstId = interaction.options.get("option1").value;
      const targetSecondId = interaction.options.get("option2").value;
      let query = {
        eventId: targetEventId,
        guildId: interaction.guild.id,
      };
      let bet = await Bet.findOne(query);
      if (!bet) {
        bet = new Bet({
          ...query,
          firstId: targetFirstId,
          secondId: targetSecondId,
        });
        await bet.save();
      } else if (
        !(bet.firstId === targetFirstId) ||
        !(bet.secondId === targetSecondId)
      ) {
        interaction.editReply(
          `Incorrect options for event ${targetEventId}. Use /options [event] to find options.`
        );
      }
      let sumFirst = sum(bet.first.values());
      let sumSecond = sum(bet.second.values());
      interaction.editReply(
        `Stats for event "${bet.eventId}": ${sumFirst} berries on "${bet.firstId}", ${sumSecond} berries on "${bet.secondId}".`
      );
    } catch (error) {
      console.log(`Error with /event: ${error}`);
    }
  },
  name: "event",
  description: "Create an event to bet on!",
  options: [
    {
      name: "event",
      description: "The event you want to bet on.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "option1",
      description: "Option 1",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "option2",
      description: "Option 2",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};
