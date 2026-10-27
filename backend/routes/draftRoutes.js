const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfileDraft,
  saveProfileDraft,
  deleteProfileDraft,
} = require("../controllers/draftController");

router.use(authMiddleware);
router.get("/:type", getProfileDraft);
router.put("/:type", saveProfileDraft);
router.delete("/:type", deleteProfileDraft);

module.exports = router;
