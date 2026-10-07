const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminKycController = require("../controllers/adminKycController");

const {
  getAdminProfile,
  getAdminStats,
  listInvestors,
  listBusinesses,
  listMatches,
  createMatch,
  updateMatch,
} = require("../controllers/adminController");

// Every admin route requires:
// 1. A valid login token
// 2. The user's role must be "admin"
router.use(authMiddleware, adminMiddleware);

// Current first-class admin entity
router.get("/profile", getAdminProfile);

// Sensitive KYC review is restricted to authenticated admins.
router.get("/kyc", adminKycController.listKycSubmissions);
router.get("/kyc/:id", adminKycController.getKycSubmission);
router.get("/kyc/:id/documents/:documentId", adminKycController.downloadKycDocument);
router.patch("/kyc/:id/status", adminKycController.reviewKycSubmission);

// Dashboard statistics
router.get("/stats", getAdminStats);

// Investors
router.get("/investors", listInvestors);

// Businesses
router.get("/businesses", listBusinesses);

// Matchmaking
router.get("/matchmaking", listMatches);

// Create matchmaking match
router.post("/matchmaking", createMatch);

// Update matchmaking status
router.patch("/matchmaking/:id/status", updateMatch);

module.exports = router;
