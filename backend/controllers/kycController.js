const rateLimit = require("express-rate-limit");
const kycService = require("../services/kycService");

const uploadLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 4,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many KYC submissions. Try again later." },
});

const getMySubmissions = async (req, res) => {
  try {
    const data = await kycService.getMySubmissions(req.user.id);
    res.json({ success: true, data });
  } catch (error) {
    console.error("KYC status lookup failed:", error.message);
    res.status(500).json({ success: false, message: "Could not load KYC status." });
  }
};

const submitKyc = async (req, res) => {
  try {
    if (!["business", "investor"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Business or investor access is required." });
    }
    let answers;
    let documentTypes;
    try {
      answers = JSON.parse(req.body.answers || "null");
      documentTypes = JSON.parse(req.body.documentTypes || "null");
    } catch {
      return res.status(400).json({ success: false, message: "KYC details or document labels are invalid." });
    }
    const submission = await kycService.createSubmission(
      req.user.id,
      req.user.role,
      answers,
      req.files || [],
      documentTypes
    );
    res.status(201).json({
      success: true,
      message: "Your encrypted KYC submission is awaiting review.",
      data: submission,
    });
  } catch (error) {
    const status = error.status || 500;
    if (status === 500) console.error("KYC submission failed:", error.message);
    res.status(status).json({
      success: false,
      message: status === 503 ? error.message : status === 400 ? error.message : "Could not submit KYC. Please try again.",
    });
  }
};

module.exports = { uploadLimit, getMySubmissions, submitKyc };
