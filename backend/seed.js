require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Charity = require("./src/models/Charity");
const Draw = require("./src/models/Draw");
const { computeDrawOutcome } = require("./src/utils/drawEngine");

const today = () => new Date().toISOString().slice(0, 10);
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await connectDB();

  console.log("🧹 Clearing existing users, charities and draws…");
  await Promise.all([User.deleteMany({}), Charity.deleteMany({}), Draw.deleteMany({})]);

  console.log("🎗️  Creating charities…");
  const charities = await Charity.insertMany([
    {
      name: "Second Chance Paws", emoji: "🐾", cause: "Animals",
      blurb: "Rescues and rehomes shelter dogs across the region.",
      description: "Second Chance Paws runs a no-kill shelter network, funding vet care, foster placements and adoption days for dogs that would otherwise be euthanised.",
      events: [{ name: "Autumn Adoption Fair", date: "2026-10-18" }],
    },
    {
      name: "Bright Futures Literacy", emoji: "📚", cause: "Education",
      blurb: "Puts books and reading mentors in under-funded schools.",
      description: "Bright Futures pairs volunteer reading mentors with primary schools and stocks classroom libraries in areas where school budgets can't.",
      events: [{ name: "Book Drive Kickoff", date: "2026-11-02" }],
    },
    {
      name: "Clearwater Relief", emoji: "💧", cause: "Environment",
      blurb: "Restores clean drinking water access after flooding events.",
      description: "Clearwater Relief deploys filtration units and rebuilds wells in communities hit by flood damage, working with local engineers.",
      events: [{ name: "Community Well Rebuild Day", date: "2026-10-25" }],
    },
    {
      name: "Fairway Forward Youth Golf", emoji: "🏌️", cause: "Youth Sport",
      blurb: "Free junior coaching and equipment loans for first-generation players.",
      description: "Fairway Forward removes the cost barrier to golf for kids who'd never otherwise pick up a club — coaching, loaner clubs, and course access.",
      events: [{ name: "Junior Clinic Day", date: "2026-11-14" }],
    },
  ]);

  console.log("👤 Creating demo accounts…");
  const admin = await User.create({
    name: "Gyanwi Gupta", email: "admin@goodscore.app", password: "admin123", role: "admin",
  });

  const alex = await User.create({
    name: "PS", email: "ps@example.com", password: "player123",
    plan: "monthly", status: "active", renewalDate: addDays(today(), 14),
    charity: charities[0]._id, charityPercent: 15,
    scores: [
      { date: "2026-09-15", score: 34 }, { date: "2026-09-08", score: 28 },
      { date: "2026-09-01", score: 41 }, { date: "2026-08-24", score: 19 },
      { date: "2026-08-17", score: 12 },
    ],
  });

  const sam = await User.create({
    name: "RJ", email: "rj@example.com", password: "player123",
    plan: "yearly", status: "active", renewalDate: addDays(today(), 200),
    charity: charities[1]._id, charityPercent: 10,
    scores: [
      { date: "2026-09-12", score: 41 }, { date: "2026-09-05", score: 34 },
      { date: "2026-08-29", score: 30 }, { date: "2026-08-22", score: 34 },
      { date: "2026-08-15", score: 22 },
    ],
  });

  await User.create({
    name: "RS", email: "rs@example.com", password: "player123",
    plan: "monthly", status: "lapsed", renewalDate: addDays(today(), -5),
    charity: charities[2]._id, charityPercent: 10,
    scores: [{ date: "2026-08-30", score: 27 }],
  });

  console.log("Publishing one demo draw with a pending winner…");
  const users = await User.find({ role: "user" }).lean();
  const outcome = computeDrawOutcome(users, "random", 0);
  if (outcome.winners.length === 0) {
    outcome.winners.push({ user: alex._id, tier: 3, amount: Math.round(outcome.poolTotal * 0.25 * 100) / 100, proofUrl: null, payStatus: "pending" });
  }
  await Draw.create({
    label: "August 2026", type: "random", status: "published", publishedAt: new Date(),
    numbers: outcome.numbers, poolTotal: outcome.poolTotal, tierPools: outcome.tierPools,
    jackpotCarryOut: outcome.jackpotCarryOut, winners: outcome.winners,
  });

  console.log("\n✅ Seed complete. Demo credentials:");
  console.log("   Admin        admin@goodscore.app / admin123");
  console.log("   Subscriber   ps@example.com    / player123  (active, monthly)");
  console.log("   Subscriber   rj@example.com     / player123  (active, yearly)");
  console.log("   Subscriber   rs@example.com  / player123  (lapsed)\n");

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
