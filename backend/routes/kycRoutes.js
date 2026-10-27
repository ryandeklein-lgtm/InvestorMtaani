const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { uploadKycDocuments } = require("../middleware/kycUpload");
const { uploadLimit, getMySubmissions, submitKyc } = require("../controllers/kycController");
const { getKycDraft, saveKycDraft, deleteKycDraft } = require("../controllers/draftController");

router.use(authMiddleware);
router.get("/me", getMySubmissions);
router.get("/draft", getKycDraft);
router.put("/draft", saveKycDraft);
router.delete("/draft", deleteKycDraft);
router.post("/submissions", uploadLimit, uploadKycDocuments, submitKyc);

module.exports = router;
