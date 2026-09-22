const today = () => new Date().toISOString().slice(0, 10);

// Real-time subscription validation (§04) — call at the top of any
// authenticated route that should reflect a lapsed subscription immediately.
async function refreshStatus(user) {
  if (user.status === "active" && user.renewalDate && user.renewalDate < today()) {
    user.status = "lapsed";
    await user.save();
  }
  return user;
}

// PUT /api/users/me
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    if (name) req.user.name = name;
    if (email) req.user.email = email.toLowerCase();
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/me/scores  { date, score }  — insert or edit (§05: one per date)
async function upsertScore(req, res, next) {
  try {
    const user = await refreshStatus(req.user);
    if (user.status !== "active") {
      return res.status(403).json({ message: "Renew your subscription to log scores." });
    }
    const { date, score } = req.body;
    const value = Math.round(Number(score));
    if (!date || !(value >= 1 && value <= 45)) {
      return res.status(400).json({ message: "Enter a date and a score between 1 and 45." });
    }
    const existing = user.scores.find((s) => s.date === date);
    if (existing) {
      existing.score = value;
    } else {
      user.scores.push({ date, score: value });
      if (user.scores.length > 5) {
        user.scores.sort((a, b) => a.date.localeCompare(b.date));
        user.scores.shift(); // drop the oldest — only the latest 5 are retained
      }
    }
    await user.save();
    res.json({ scores: user.scores });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/users/me/scores/:date
async function deleteScore(req, res, next) {
  try {
    req.user.scores = req.user.scores.filter((s) => s.date !== req.params.date);
    await req.user.save();
    res.json({ scores: req.user.scores });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, upsertScore, deleteScore, refreshStatus };
