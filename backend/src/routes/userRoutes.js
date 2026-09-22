const router = require("express").Router();
const { updateProfile, upsertScore, deleteScore } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);
router.put("/me", updateProfile);
router.post("/me/scores", upsertScore);
router.delete("/me/scores/:date", deleteScore);

module.exports = router;
