const pool = require("../config/db");
const draftService = require("../services/draftService");

const PROFILE_FIELDS = {
  business: [
    "business_name", "industry", "location", "description", "year_established",
    "employees", "annual_revenue", "monthly_gross", "monthly_net",
    "amount_seeking", "funding_reason", "investment_structure", "use_of_funds",
    "business_stage", "registration_number", "kra_pin", "risk_disclosure",
  ],
  investor: [
    "display_name", "investor_type", "location", "thesis", "min_check_size",
    "max_check_size", "preferred_stage", "sectors_of_interest", "geographic_focus",
    "preferred_structure", "investing_status", "portfolio_highlights",
  ],
};

const KYC_FIELDS = {
  business: [
    "businessName", "registrationNumber", "businessType", "kraPin", "businessAddress",
    "operatingAddress", "county", "directors", "beneficialOwners", "shareholding",
    "useOfFunds", "existingLoans", "existingInvestors", "litigation", "insolvency",
  ],
  investor: ["fullName", "investorType", "country", "address", "occupation", "sourceOfFunds"],
};

const pickFields = (input, fields) => Object.fromEntries(
  fields.filter((key) => Object.hasOwn(input, key)).map((key) => [key, input[key]])
);

const replyWithError = (res, error, fallback) => {
  const status = error.status || 500;
  if (status === 500) console.error(fallback, error);
  return res.status(status).json({
    success: false,
    message: status === 500 ? "Could not save your draft. Please try again." : error.message,
  });
};

const profileType = (req, res) => {
  const type = req.params.type;
  if (!PROFILE_FIELDS[type] || req.user.role !== type) {
    res.status(403).json({ success: false, message: "You cannot access this profile draft." });
    return null;
  }
  return `${type}_profile`;
};

const getProfileDraft = async (req, res) => {
  const draftType = profileType(req, res);
  if (!draftType) return;
  try {
    const draft = await draftService.getDraft(req.user.id, draftType);
    res.json({ success: true, data: draft });
  } catch (error) {
    replyWithError(res, error, "Profile draft lookup failed:");
  }
};

const saveProfileDraft = async (req, res) => {
  const draftType = profileType(req, res);
  if (!draftType) return;
  if (!req.body?.data || typeof req.body.data !== "object" || Array.isArray(req.body.data)) {
    return res.status(400).json({ success: false, message: "Draft details are invalid." });
  }
  try {
    const data = pickFields(req.body.data, PROFILE_FIELDS[req.params.type]);
    const saved = await draftService.saveDraft(req.user.id, draftType, data);
    res.json({ success: true, data: { updated_at: saved.updated_at } });
  } catch (error) {
    replyWithError(res, error, "Profile draft save failed:");
  }
};

const deleteProfileDraft = async (req, res) => {
  const draftType = profileType(req, res);
  if (!draftType) return;
  try {
    await draftService.deleteDraft(req.user.id, draftType);
    res.json({ success: true });
  } catch (error) {
    replyWithError(res, error, "Profile draft cleanup failed:");
  }
};

const getKycDraft = async (req, res) => {
  const role = req.user.role;
  if (!KYC_FIELDS[role]) {
    return res.status(403).json({ success: false, message: "Business or investor access is required." });
  }
  try {
    const draft = await draftService.getDraft(req.user.id, `${role}_kyc`);
    res.json({ success: true, data: draft });
  } catch (error) {
    replyWithError(res, error, "KYC draft lookup failed:");
  }
};

const saveKycDraft = async (req, res) => {
  const role = req.user.role;
  if (!KYC_FIELDS[role]) {
    return res.status(403).json({ success: false, message: "Business or investor access is required." });
  }
  if (!req.body?.data || typeof req.body.data !== "object" || Array.isArray(req.body.data)) {
    return res.status(400).json({ success: false, message: "KYC draft details are invalid." });
  }
  try {
    const current = await pool.query(
      `SELECT status FROM kyc_submissions
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (["pending", "approved"].includes(current.rows[0]?.status)) {
      return res.status(409).json({ success: false, message: "A pending or approved verification cannot be changed." });
    }

    const data = pickFields(req.body.data, KYC_FIELDS[role]);
    const saved = await draftService.saveDraft(req.user.id, `${role}_kyc`, data);
    res.json({ success: true, data: { updated_at: saved.updated_at } });
  } catch (error) {
    replyWithError(res, error, "KYC draft save failed:");
  }
};

const deleteKycDraft = async (req, res) => {
  const role = req.user.role;
  if (!KYC_FIELDS[role]) {
    return res.status(403).json({ success: false, message: "Business or investor access is required." });
  }
  try {
    await draftService.deleteDraft(req.user.id, `${role}_kyc`);
    res.json({ success: true });
  } catch (error) {
    replyWithError(res, error, "KYC draft cleanup failed:");
  }
};

module.exports = {
  getProfileDraft,
  saveProfileDraft,
  deleteProfileDraft,
  getKycDraft,
  saveKycDraft,
  deleteKycDraft,
};
