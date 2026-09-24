const router = require("express").Router();
const { createCheckoutSession, confirmCheckout, updateCharity, cancel } = require("../controllers/subscriptionController");
const { protect, optionalAuth } = require("../middleware/auth");

router.post("/checkout", optionalAuth, createCheckoutSession); // works logged-out (signup+pay) or logged-in (change plan)
router.post("/confirm", protect, confirmCheckout);
router.put("/me/charity", protect, updateCharity);
router.delete("/me", protect, cancel);

module.exports = router;
