const router = require("express").Router();
const { listUsers, setUserStatus, upsertUserScore, deleteUserScore, reports } = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);
router.get("/users", listUsers);
router.put("/users/:id/status", setUserStatus);
router.put("/users/:id/scores", upsertUserScore);
router.delete("/users/:id/scores/:date", deleteUserScore);
router.get("/reports", reports);

module.exports = router;
