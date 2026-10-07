const kycService = require("../services/kycService");

const listKycSubmissions = async (req, res) => {
  const { status } = req.query;
  if (status && !["pending", "approved", "needs_changes", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid KYC status filter." });
  }
  try {
    res.json({ success: true, data: await kycService.listSubmissionsForAdmin(status) });
  } catch (error) {
    console.error("Admin KYC list failed:", error.message);
    res.status(500).json({ success: false, message: "Could not load KYC submissions." });
  }
};

const getKycSubmission = async (req, res) => {
  try {
    const data = await kycService.getSubmissionForAdmin(req.params.id, req.user.id);
    if (!data) return res.status(404).json({ success: false, message: "KYC submission not found." });
    res.set("Cache-Control", "no-store");
    res.json({ success: true, data });
  } catch (error) {
    console.error("Admin KYC review load failed:", error.message);
    res.status(500).json({ success: false, message: "Could not load this KYC submission." });
  }
};

const downloadKycDocument = async (req, res) => {
  try {
    const document = await kycService.getDocumentForAdmin(req.params.id, req.params.documentId, req.user.id);
    if (!document) return res.status(404).json({ success: false, message: "KYC document not found." });
    const filename = encodeURIComponent(document.name);
    res.set({
      "Cache-Control": "no-store, private",
      "Content-Type": document.contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "X-Content-Type-Options": "nosniff",
    });
    res.send(document.content);
  } catch (error) {
    console.error("Admin KYC document download failed:", error.message);
    res.status(500).json({ success: false, message: "Could not download this document." });
  }
};

const reviewKycSubmission = async (req, res) => {
  const { status, reviewNotes } = req.body || {};
  if (typeof reviewNotes === "string" && reviewNotes.length > 2000) {
    return res.status(400).json({ success: false, message: "Review notes must be 2,000 characters or fewer." });
  }
  try {
    const updated = await kycService.reviewSubmission(req.params.id, req.user.id, status, reviewNotes);
    if (!updated) return res.status(409).json({ success: false, message: "This submission is no longer pending review." });
    res.json({ success: true, message: "KYC review decision recorded." });
  } catch (error) {
    const statusCode = error.status || 500;
    if (statusCode === 500) console.error("Admin KYC review decision failed:", error.message);
    res.status(statusCode).json({ success: false, message: statusCode === 400 ? error.message : "Could not record the KYC decision." });
  }
};

module.exports = { listKycSubmissions, getKycSubmission, downloadKycDocument, reviewKycSubmission };
