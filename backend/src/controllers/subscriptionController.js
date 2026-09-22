const User = require("../models/User");
const { signToken } = require("../utils/token");

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const today = () => new Date().toISOString().slice(0, 10);

// POST /api/subscriptions
// Works two ways: logged-in user subscribing/changing plan, OR a brand-new
// visitor signing up and subscribing in one step (name/email/password in body).
// `card` is only validated for shape here — see README, payment is simulated.
async function subscribe(req, res, next) {
  try {
    const { plan, charity, charityPercent, card, name, email, password } = req.body;

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ message: "Choose a monthly or yearly plan." });
    }
    if (!charity) return res.status(400).json({ message: "Choose a charity to support." });
    const pct = Number(charityPercent);
    if (!(pct >= 10 && pct <= 100)) {
      return res.status(400).json({ message: "Charity contribution must be between 10% and 100%." });
    }
    if (!card || String(card).replace(/\s/g, "").length < 12) {
      return res.status(400).json({ message: "Enter a valid card number (this is a simulated gateway)." });
    }

    let user = req.user || null;
    if (!user) {
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required to subscribe." });
      }
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(409).json({ message: "An account with that email already exists — log in instead." });
      user = await User.create({ name, email, password });
    }

    user.plan = plan;
    user.status = "active";
    user.renewalDate = addDays(today(), plan === "monthly" ? 30 : 365);
    user.charity = charity;
    user.charityPercent = pct;
    await user.save();

    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// PUT /api/subscriptions/me/charity
async function updateCharity(req, res, next) {
  try {
    const { charity, charityPercent } = req.body;
    const pct = Number(charityPercent);
    if (!(pct >= 10 && pct <= 100)) {
      return res.status(400).json({ message: "Charity contribution must be between 10% and 100%." });
    }
    req.user.charity = charity;
    req.user.charityPercent = pct;
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/subscriptions/me
async function cancel(req, res, next) {
  try {
    req.user.status = "inactive";
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { subscribe, updateCharity, cancel };
