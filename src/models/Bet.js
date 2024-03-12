const { Schema, model, Collection } = require("mongoose");

const betSchema = new Schema({
  eventId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  firstId: {
    type: String,
    default: "",
  },
  secondId: {
    type: String,
    default: "",
  },
  first: {
    type: Map,
    default: new Map(),
  },
  second: {
    type: Map,
    default: new Map(),
  },
});

module.exports = model("Bet", betSchema);
