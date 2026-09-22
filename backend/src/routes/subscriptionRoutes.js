const router = require("express").Router();
const { subscribe, updateCharity, cancel } = require("../controllers/subscriptionController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/", optionalAuth, subscribe);           // works logged-out (signup+subscribe) or logged-in (change plan)
router.put("/me/charity", protect, updateCharity);
router.delete("/me", protect, cancel);

module.exports = router;
