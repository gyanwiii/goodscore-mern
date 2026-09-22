const mongoose = require("mongoose");

const winnerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tier: { type: Number, enum: [3, 4, 5], required: true },
    amount: { type: Number, required: true },
    proofUrl: { type: String, default: null }, // data URL in this build — swap for cloud storage in production
    payStatus: { type: String, enum: ["pending", "paid", "rejected"], default: "pending" },
  },
  { _id: true }
);

const drawSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // e.g. "March 2026"
    type: { type: String, enum: ["random", "algorithmic"], default: "random" },
    status: { type: String, enum: ["draft", "simulated", "published"], default: "draft" },
    numbers: { type: [Number], default: null },
    poolTotal: { type: Number, default: 0 },
    tierPools: {
      type: mongoose.Schema.Types.Mixed, // { "3": Number, "4": Number, "5": Number }
      default: {},
    },
    jackpotCarryOut: { type: Number, default: 0 },
    winners: { type: [winnerSchema], default: [] },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Draw", drawSchema);
