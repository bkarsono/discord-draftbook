const { Client, Interaction } = require("discord.js");
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
      let result = "Events:";
      let allBets = await Bet.find({
        guildId: interaction.guild.id,
      }).select("-_id eventId firstId secondId");
      for (const bet of allBets) {
        result = result.concat('\n"', bet.eventId);
        result += '"';
      }
      interaction.editReply(result);
    } catch (error) {
      console.log(`Error with /event: ${error}`);
    }
  },
  name: "events",
  description: "List of all current events.",
};
