const User = require("../models/User");
const { signToken } = require("../utils/token");

// POST /api/auth/register  — create an account only (no subscription yet)
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with that email already exists." });

    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password || ""))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    const token = signToken(user);
    res.json({ token, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user.toSafeJSON() });
}

module.exports = { register, login, me };
