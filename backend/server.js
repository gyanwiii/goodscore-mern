require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.json({
        message: "GoodScore API is running",
        status: "success"
    });
});
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🎯 GoodScore API running on http://localhost:${PORT}`));
});
