const express = require("express");
const router = express.Router();

const startupController = require("../controllers/startupController");
const authMiddleware = require("../middleware/authMiddleware");

// Public Routes
router.get("/", startupController.getAllStartups);
router.get("/:id", startupController.getStartupById);

// Protected Routes
router.post("/", authMiddleware, startupController.createStartup);
router.put("/:id", authMiddleware, startupController.updateStartup);
router.delete("/:id", authMiddleware, startupController.deleteStartup);

module.exports = router;