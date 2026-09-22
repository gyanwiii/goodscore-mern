const Charity = require("../models/Charity");
const User = require("../models/User");

// GET /api/charities
async function list(req, res, next) {
  try {
    const charities = await Charity.find().sort({ createdAt: 1 });
    res.json({ charities });
  } catch (err) {
    next(err);
  }
}

// GET /api/charities/:id
async function getOne(req, res, next) {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: "Charity not found." });
    res.json({ charity });
  } catch (err) {
    next(err);
  }
}

// POST /api/charities  (admin)
async function create(req, res, next) {
  try {
    const { name, emoji, cause, blurb, description } = req.body;
    if (!name) return res.status(400).json({ message: "Give the charity a name." });
    const charity = await Charity.create({ name, emoji, cause, blurb, description });
    res.status(201).json({ charity });
  } catch (err) {
    next(err);
  }
}

// PUT /api/charities/:id  (admin)
async function update(req, res, next) {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!charity) return res.status(404).json({ message: "Charity not found." });
    res.json({ charity });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/charities/:id  (admin)
async function remove(req, res, next) {
  try {
    const inUse = await User.exists({ charity: req.params.id });
    if (inUse) return res.status(409).json({ message: "Can't delete — subscribers are assigned to this charity." });
    await Charity.findByIdAndDelete(req.params.id);
    res.json({ message: "Charity deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne, create, update, remove };
