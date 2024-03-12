const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");
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
      const mentionedUserId = interaction.options.get("target-user")?.value;
      const targetUserId = mentionedUserId || interaction.member.id;
      const targetUserObj = await interaction.guild.members.fetch(targetUserId);
      let query = {
        userId: targetUserId,
        guildId: interaction.guild.id,
      };
      let user = await User.findOne(query);
      if (!user) {
        user = new User({
          ...query,
          lastDaily: new Date("2014-02-02"),
        });
        await user.save();
      }
      let allUsers = await User.find({ guildId: interaction.guild.id }).select(
        "-_id userId berries"
      );
      allUsers.sort((a, b) => {
        b.berries - a.berries;
      });
      let currentRank =
        allUsers.findIndex((u) => u.userId === targetUserId) + 1;
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} has ${user.berries} berries at rank ${currentRank}.`
          : `You have ${user.berries} berries at rank ${currentRank}.`
      );
    } catch (error) {
      console.log(`Error with /berries: ${error}`);
    }
  },
  name: "berries",
  description: "Check someone's berries!",
  options: [
    {
      name: "target-user",
      description:
        "The user whose berries you want to see. (Leave blank to view your own)",
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
