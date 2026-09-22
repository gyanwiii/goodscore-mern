const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  { name: { type: String, required: true }, date: { type: String, required: true } },
  { _id: false }
);

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    emoji: { type: String, default: "🎗️" },
    cause: { type: String, default: "General" },
    blurb: { type: String, default: "" },
    description: { type: String, default: "" },
    events: { type: [eventSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Charity", charitySchema);
