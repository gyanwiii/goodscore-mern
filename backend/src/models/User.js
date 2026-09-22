const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const scoreSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD, one entry per date (§05)
    score: { type: Number, required: true, min: 1, max: 45 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    plan: { type: String, enum: ["monthly", "yearly", null], default: null },
    status: { type: String, enum: ["active", "inactive", "lapsed"], default: "inactive" },
    renewalDate: { type: String, default: null }, // YYYY-MM-DD

    charity: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", default: null },
    charityPercent: { type: Number, min: 10, max: 100, default: 10 },

    // Only the 5 most recent entries are kept — enforced in the pre-save hook below.
    scores: { type: [scoreSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("scores") && this.scores.length > 5) {
    this.scores = [...this.scores].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
