const express = require("express");
const router = express.Router();

const {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  getMyBusiness,
  updateBusiness,
  deleteBusiness,
} = require("../controllers/businessController");

const authMiddleware = require("../middleware/authMiddleware");


// Create business
router.post("/", authMiddleware, createBusiness);


// Get logged-in user's business
// IMPORTANT: Keep this BEFORE /:id
router.get("/me", authMiddleware, getMyBusiness);


// Get all businesses
router.get("/", getAllBusinesses);


// Get one business
router.get("/:id", getBusinessById);


// Update business
router.put("/:id", updateBusiness);


// Delete business
router.delete("/:id", deleteBusiness);


module.exports = router;