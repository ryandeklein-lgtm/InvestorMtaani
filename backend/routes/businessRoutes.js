const express = require("express");
const router = express.Router();

const {
  createBusiness,
  getAllBusinesses,
  adminGetAllBusinesses,
  getBusinessById,
  getMyBusiness,
  updateBusiness,
  submitForReview,
  setBusinessStatus,
  deleteBusiness,
} = require("../controllers/businessController");

const authMiddleware = require("../middleware/authMiddleware");

// IMPORTANT: fixed paths (/me, /admin/all) must come BEFORE /:id,
// otherwise Express treats "me" and "admin" as an id.

// Create business (draft)
router.post("/", authMiddleware, createBusiness);

// Logged-in user's own business (full record)
router.get("/me", authMiddleware, getMyBusiness);

// Owner sends their profile for review
router.post("/me/submit", authMiddleware, submitForReview);

// ADMIN: every business with every column (controller checks the admin role)
router.get("/admin/all", authMiddleware, adminGetAllBusinesses);

// PUBLIC: approved businesses only
router.get("/", getAllBusinesses);

// PUBLIC: one approved business
router.get("/:id", getBusinessById);

// ADMIN: approve / reject / needs_changes / suspend
router.patch("/:id/status", authMiddleware, setBusinessStatus);

// Update business (owner or admin)
router.put("/:id", authMiddleware, updateBusiness);

// Delete business (owner or admin)
router.delete("/:id", authMiddleware, deleteBusiness);

module.exports = router;