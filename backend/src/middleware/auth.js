const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Not authenticated — please log in." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).populate("charity");
    if (!user) return res.status(401).json({ message: "Account no longer exists." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired or invalid — please log in again." });
  }
}

// Like `protect`, but does not reject the request when there's no/invalid
// token — used by routes that work for both guests and logged-in users
// (e.g. subscribing for the first time vs. changing an existing plan).
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).populate("charity");
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }
  next();
}

module.exports = { protect, optionalAuth, adminOnly };
