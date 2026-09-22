const router = require("express").Router();
const { list, getOne, create, update, remove } = require("../controllers/charityController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", list);
router.get("/:id", getOne);
router.post("/", protect, adminOnly, create);
router.put("/:id", protect, adminOnly, update);
router.delete("/:id", protect, adminOnly, remove);

module.exports = router;
