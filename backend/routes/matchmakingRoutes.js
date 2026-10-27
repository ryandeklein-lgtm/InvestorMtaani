const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createMatchmakingRequest,
  getInvestorSuggestions,
  getMyInvestorMatches,
  getMyBusinessMatches,
  updateMatchStatus,
} = require("../controllers/matchmakingController");

const introductionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You’ve sent several introduction requests. Please try again later." },
});

// Rule-based opportunity suggestions from a saved investor profile.
router.get("/suggestions", authMiddleware, getInvestorSuggestions);

// Send a matchmaking request
router.post(
  "/business/:businessId",
  authMiddleware,
  introductionLimiter,
  createMatchmakingRequest
);

// Get matchmaking requests sent by logged-in investor
router.get(
  "/investor",
  authMiddleware,
  getMyInvestorMatches
);

// Get matchmaking requests received by logged-in business owner
router.get(
  "/business",
  authMiddleware,
  getMyBusinessMatches
);

// Accept or decline a matchmaking request
router.patch(
  "/:id/status",
  authMiddleware,
  updateMatchStatus
);

module.exports = router;
