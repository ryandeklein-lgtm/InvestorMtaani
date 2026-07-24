const express = require("express");
const router = express.Router();

const {
  createFundingRequest,
  getMyFundingRequests,
  getAllOpenFundingRequests,
  updateFundingRequest,
} = require("../controllers/fundingController");

const authMiddleware = require("../middleware/authMiddleware");

// Public route
// Investors can view open funding opportunities
router.get("/", getAllOpenFundingRequests);

// Protected routes
router.post("/", authMiddleware, createFundingRequest);
router.get("/me", authMiddleware, getMyFundingRequests);
router.put("/:id", authMiddleware, updateFundingRequest);

module.exports = router;