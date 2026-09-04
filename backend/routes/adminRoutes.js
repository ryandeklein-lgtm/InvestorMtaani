const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
  listInvestors,
  listBusinesses,
  listMatches,
  createMatch,
  updateMatch,
} = require("../controllers/adminController");

// Every route below requires a valid token AND role === 'admin'
router.use(authMiddleware, adminMiddleware);

router.get("/investors", listInvestors);
router.get("/businesses", listBusinesses);
router.get("/matchmaking", listMatches);
router.post("/matchmaking", createMatch);
router.patch("/matchmaking/:id/status", updateMatch);

module.exports = router;