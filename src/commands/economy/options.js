const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");
const Bet = require("../../models/Bet.js");

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
      let allBets = await Bet.find({
        guildId: interaction.guild.id,
      }).select("-_id eventId firstId secondId");
      let result = 'Option 1: "';
      let found = false;
      for (const bet of allBets) {
        if (bet.eventId === targetEventId) {
          result = result.concat("", bet.firstId);
          result = result.concat('". Option 2: "', bet.secondId);
          result += '".';
          found = true;
          break;
        }
      }
      if (!found) {
        interaction.editReply(`Event "${targetEventId}" not found.`);
      }
      interaction.editReply(result);
    } catch (error) {
      console.log(`Error with /event: ${error}`);
    }
  },
  name: "options",
  description: "Options for a given event.",
  options: [
    {
      name: "event",
      description: "Event you want to know options for.",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};
