const express = require("express");
const router = express.Router();

const {
  createInvestor,
  getAllInvestors,
  getInvestorById,
  getMyInvestor,
  updateInvestor,
  deleteInvestor,
} = require("../controllers/investorController");

const authMiddleware = require("../middleware/authMiddleware");

// Create investor profile
router.post("/", authMiddleware, createInvestor);

// Get logged-in user's investor profile
// IMPORTANT: Keep this BEFORE /:id
router.get("/me", authMiddleware, getMyInvestor);

// Get all investors
router.get("/", getAllInvestors);

// Get one investor by ID
router.get("/:id", getInvestorById);

// Update investor profile
router.put("/:id", authMiddleware, updateInvestor);

// Delete investor profile
router.delete("/:id", authMiddleware, deleteInvestor);

module.exports = router;