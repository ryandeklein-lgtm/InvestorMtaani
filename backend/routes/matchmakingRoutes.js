const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createMatchmakingRequest,
  getMyInvestorMatches,
  getMyBusinessMatches,
  updateMatchStatus,
} = require("../controllers/matchmakingController");

// Send a matchmaking request
router.post(
  "/business/:businessId",
  authMiddleware,
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