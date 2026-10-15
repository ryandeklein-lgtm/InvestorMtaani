const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadKycDocuments } = require("../middleware/kycUpload");
const { uploadLimit, getMySubmissions, submitKyc } = require("../controllers/kycController");

router.use(authMiddleware);
router.get("/me", getMySubmissions);
router.post("/submissions", uploadLimit, uploadKycDocuments, submitKyc);

module.exports = router;
