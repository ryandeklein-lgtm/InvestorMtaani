const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadCommunityMedia } = require("../middleware/communityUpload");
const communityController = require("../controllers/communityController");

const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You’ve shared several updates. Please try again later." },
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Please slow down and try again shortly." },
});

const validatePostId = (req, res, next) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid post id." });
  }
  next();
};

router.get("/posts", authMiddleware, communityController.getPosts);
router.post(
  "/posts",
  authMiddleware,
  authMiddleware.requireRole("business"),
  postLimiter,
  uploadCommunityMedia,
  communityController.createPost
);
router.get("/posts/:id/media", validatePostId, communityController.getMedia);
router.post("/posts/:id/likes", authMiddleware, likeLimiter, validatePostId, communityController.likePost);
router.delete("/posts/:id/likes", authMiddleware, likeLimiter, validatePostId, communityController.unlikePost);

module.exports = router;
