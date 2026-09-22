function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 11000) {
    return res.status(409).json({ message: "That email is already registered." });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0]?.message || "Invalid data." });
  }
  res.status(err.status || 500).json({ message: err.message || "Something went wrong." });
}

module.exports = { notFound, errorHandler };
