const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
const charityRoutes = require("./routes/charityRoutes");
const drawRoutes = require("./routes/drawRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "5mb" })); // generous limit — winner proof screenshots are sent as data URLs
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, service: "goodscore-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
