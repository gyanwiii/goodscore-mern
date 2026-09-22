const router = require("express").Router();
const {
  listPublished, listMine, listAll, createDraft, setType,
  simulate, publish, discard, uploadProof, setWinnerStatus,
} = require("../controllers/drawController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", listPublished);
router.get("/mine", protect, listMine);
router.get("/all", protect, adminOnly, listAll);
router.post("/", protect, adminOnly, createDraft);
router.put("/:id/type", protect, adminOnly, setType);
router.post("/:id/simulate", protect, adminOnly, simulate);
router.post("/:id/publish", protect, adminOnly, publish);
router.delete("/:id", protect, adminOnly, discard);
router.post("/:id/proof", protect, uploadProof);
router.put("/:id/winners/:winnerId", protect, adminOnly, setWinnerStatus);

module.exports = router;
