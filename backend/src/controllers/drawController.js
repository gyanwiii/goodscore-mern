const Draw = require("../models/Draw");
const User = require("../models/User");
const { computeDrawOutcome, poolTotalFor } = require("../utils/drawEngine");

function monthLabel(date) {
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

async function priorJackpotCarry() {
  const last = await Draw.findOne({ status: "published" }).sort({ publishedAt: -1 });
  return last ? last.jackpotCarryOut || 0 : 0;
}

// GET /api/draws  — published only, for the public history page
async function listPublished(req, res, next) {
  try {
    const draws = await Draw.find({ status: "published" }).sort({ publishedAt: -1 }).populate("winners.user", "name");
    res.json({ draws });
  } catch (err) {
    next(err);
  }
}

// GET /api/draws/mine  — the logged-in user's own draw history + win status
async function listMine(req, res, next) {
  try {
    const draws = await Draw.find({ status: "published" }).sort({ publishedAt: -1 });
    const mine = draws.map((d) => {
      const win = d.winners.find((w) => String(w.user) === String(req.user._id));
      return {
        _id: d._id,
        label: d.label,
        numbers: d.numbers,
        poolTotal: d.poolTotal,
        win: win || null,
      };
    });
    res.json({ draws: mine });
  } catch (err) {
    next(err);
  }
}

// GET /api/draws/all  (admin) — includes drafts
async function listAll(req, res, next) {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 }).populate("winners.user", "name email");
    res.json({ draws });
  } catch (err) {
    next(err);
  }
}

// POST /api/draws  (admin) — create this cycle's draft, if none exists
async function createDraft(req, res, next) {
  try {
    const open = await Draw.findOne({ status: { $ne: "published" } });
    if (open) return res.status(409).json({ message: "A draft draw already exists for this cycle." });
    const draw = await Draw.create({ label: monthLabel(new Date()), type: "random", status: "draft" });
    res.status(201).json({ draw });
  } catch (err) {
    next(err);
  }
}

// PUT /api/draws/:id/type  (admin) — change random/algorithmic before simulating
async function setType(req, res, next) {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw || draw.status === "published") return res.status(404).json({ message: "Draft draw not found." });
    draw.type = req.body.type === "algorithmic" ? "algorithmic" : "random";
    draw.numbers = null;
    draw.status = "draft";
    await draw.save();
    res.json({ draw });
  } catch (err) {
    next(err);
  }
}

// POST /api/draws/:id/simulate  (admin) — can be re-run any number of times pre-publish
async function simulate(req, res, next) {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw || draw.status === "published") return res.status(404).json({ message: "Draft draw not found." });

    const users = await User.find({ role: "user" }).lean();
    const carry = await priorJackpotCarry();
    const outcome = computeDrawOutcome(users, draw.type, carry);

    draw.numbers = outcome.numbers;
    draw.poolTotal = outcome.poolTotal;
    draw.tierPools = outcome.tierPools;
    draw.jackpotCarryOut = outcome.jackpotCarryOut;
    draw.winners = outcome.winners;
    draw.status = "simulated";
    await draw.save();
    await draw.populate("winners.user", "name email");
    res.json({ draw });
  } catch (err) {
    next(err);
  }
}

// POST /api/draws/:id/publish  (admin)
async function publish(req, res, next) {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw || !draw.numbers) return res.status(400).json({ message: "Run a simulation before publishing." });
    draw.status = "published";
    draw.publishedAt = new Date();
    await draw.save();
    res.json({ draw });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/draws/:id  (admin) — discard a draft
async function discard(req, res, next) {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw || draw.status === "published") return res.status(404).json({ message: "Draft draw not found." });
    await draw.deleteOne();
    res.json({ message: "Draft discarded." });
  } catch (err) {
    next(err);
  }
}

// POST /api/draws/:id/proof  (user) — upload a data-URL screenshot for their own win
async function uploadProof(req, res, next) {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ message: "Draw not found." });
    const winner = draw.winners.find((w) => String(w.user) === String(req.user._id));
    if (!winner) return res.status(403).json({ message: "You don't have a win recorded on this draw." });
    const { proofUrl } = req.body;
    if (!proofUrl) return res.status(400).json({ message: "Attach an image first." });
    winner.proofUrl = proofUrl;
    winner.payStatus = "pending";
    await draw.save();
    res.json({ message: "Proof submitted — awaiting admin review." });
  } catch (err) {
    next(err);
  }
}

// PUT /api/draws/:id/winners/:winnerId  (admin) — mark paid / rejected
async function setWinnerStatus(req, res, next) {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ message: "Draw not found." });
    const winner = draw.winners.id(req.params.winnerId);
    if (!winner) return res.status(404).json({ message: "Winner record not found." });

    const { payStatus } = req.body;
    if (!["paid", "rejected"].includes(payStatus)) return res.status(400).json({ message: "Invalid status." });
    if (payStatus === "paid" && !winner.proofUrl) return res.status(400).json({ message: "No proof uploaded yet." });

    winner.payStatus = payStatus;
    if (payStatus === "rejected") winner.proofUrl = null;
    await draw.save();
    res.json({ draw });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPublished,
  listMine,
  listAll,
  createDraft,
  setType,
  simulate,
  publish,
  discard,
  uploadProof,
  setWinnerStatus,
  priorJackpotCarry,
};
