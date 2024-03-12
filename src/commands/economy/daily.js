const { Client, Interaction } = require("discord.js");
const User = require("../../models/User.js");

const dailyAmount = 100;

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
      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };
      let user = await User.findOne(query);
      if (user) {
        const lastDailyDate = user.lastDaily.toDateString();
        const currentDate = new Date().toDateString();
        if (lastDailyDate === currentDate) {
          interaction.editReply(
            "You have already collected your dailies today. Come back tomorrow!"
          );
          return;
        }
        user.lastDaily = new Date();
      } else {
        user = new User({
          ...query,
          lastDaily: new Date(),
        });
      }
      user.berries += dailyAmount;
      await user.save();
      interaction.editReply(
        `${dailyAmount} berries were added to your account. You now have ${user.berries} berries!`
      );
    } catch (error) {
      console.log(`Error with /daily: ${error}`);
    }
  },
  name: "daily",
  description: "Collect your daily berries!",
};
