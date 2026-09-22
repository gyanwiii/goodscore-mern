const User = require("../models/User");
const Draw = require("../models/Draw");
const Charity = require("../models/Charity");
const { poolTotalFor } = require("../utils/drawEngine");
const { PLAN_PRICE } = require("../utils/constants");

const today = () => new Date().toISOString().slice(0, 10);
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// GET /api/admin/users
async function listUsers(req, res, next) {
  try {
    const users = await User.find({ role: "user" }).populate("charity", "name emoji").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/status  { status: 'active' | 'inactive' }
async function setUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.status = req.body.status === "active" ? "active" : "inactive";
    if (user.status === "active" && (!user.renewalDate || user.renewalDate < today())) {
      user.renewalDate = addDays(today(), user.plan === "yearly" ? 365 : 30);
    }
    await user.save();
    res.json({ user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id/scores  — admin edits/adds a score for any user
async function upsertUserScore(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const { date, score } = req.body;
    const value = Math.round(Number(score));
    if (!date || !(value >= 1 && value <= 45)) {
      return res.status(400).json({ message: "Enter a date and a score between 1 and 45." });
    }
    const existing = user.scores.find((s) => s.date === date);
    if (existing) existing.score = value;
    else {
      user.scores.push({ date, score: value });
      if (user.scores.length > 5) {
        user.scores.sort((a, b) => a.date.localeCompare(b.date));
        user.scores.shift();
      }
    }
    await user.save();
    res.json({ scores: user.scores });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id/scores/:date
async function deleteUserScore(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.scores = user.scores.filter((s) => s.date !== req.params.date);
    await user.save();
    res.json({ scores: user.scores });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/reports
async function reports(req, res, next) {
  try {
    const users = await User.find({ role: "user" }).populate("charity", "name emoji");
    const active = users.filter((u) => u.status === "active");
    const drawsRun = await Draw.countDocuments({ status: "published" });
    const pool = poolTotalFor(users);

    const charities = await Charity.find();
    const charityTotals = charities
      .map((c) => {
        const total = users
          .filter((u) => (u.status === "active" || u.status === "lapsed") && String(u.charity?._id || u.charity) === String(c._id))
          .reduce((s, u) => s + (PLAN_PRICE[u.plan] || 0) * (u.charityPercent / 100), 0);
        return { charity: { _id: c._id, name: c.name, emoji: c.emoji }, total: Math.round(total * 100) / 100 };
      })
      .sort((a, b) => b.total - a.total);

    res.json({
      totalUsers: users.length,
      activeSubscribers: active.length,
      currentPool: pool,
      drawsRun,
      charityTotals,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, setUserStatus, upsertUserScore, deleteUserScore, reports };
