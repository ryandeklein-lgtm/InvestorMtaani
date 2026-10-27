const matchmakingService = require("../services/matchmakingService");
const businessService = require("../services/businessService");
const investorService = require("../services/investorService");
const notificationService = require("../services/notificationService");

const hasRole = (req, role) => req.user?.role === role;
const isKycApproved = (investor) =>
  ["approved", "verified"].includes(
    String(investor?.verification_status || investor?.kyc_status || "").toLowerCase()
  );

const asTerms = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  } catch {
    // Profiles may store a comma-separated preference list.
  }
  return value.split(/[,;|]/).map((item) => item.trim().toLowerCase()).filter(Boolean);
};

const scoreOpportunity = (investor, business) => {
  const checks = [];
  const reasons = [];
  const sectors = asTerms(investor.sectors_of_interest);
  const industry = String(business.industry || "").trim().toLowerCase();
  if (sectors.length) {
    checks.push(sectors.some((sector) => industry && (sector.includes(industry) || industry.includes(sector))));
    if (checks.at(-1)) reasons.push("Sector preference");
  }

  const preferredStages = asTerms(investor.preferred_stage);
  const businessStage = String(business.business_stage || "").trim().toLowerCase();
  if (preferredStages.length) {
    checks.push(preferredStages.some((preferredStage) =>
      businessStage && (preferredStage.includes(businessStage) || businessStage.includes(preferredStage))
    ));
    if (checks.at(-1)) reasons.push("Business stage preference");
  }

  const geography = asTerms(investor.geographic_focus || investor.location);
  const location = String(business.location || "").trim().toLowerCase();
  if (geography.length) {
    checks.push(geography.some((area) => location && (area.includes(location) || location.includes(area))));
    if (checks.at(-1)) reasons.push("Location preference");
  }

  const preferredStructures = asTerms(investor.preferred_structure);
  if (preferredStructures.length) {
    const structure = String(business.investment_structure || "").trim().toLowerCase();
    const acceptsBoth = preferredStructures.includes("both");
    const matchesStructure = acceptsBoth || preferredStructures.some((item) =>
      structure && (structure.includes(item) || item.includes(structure))
    );
    checks.push(matchesStructure);
    if (matchesStructure) reasons.push("Investment structure preference");
  }

  const min = Number(investor.min_check_size) || 0;
  const max = Number(investor.max_check_size) || 0;
  const ask = Number(business.amount_seeking) || 0;
  if ((min > 0 || max > 0) && ask > 0) {
    checks.push((min === 0 || ask >= min) && (max === 0 || ask <= max));
    if (checks.at(-1)) reasons.push("Funding ask within stated range");
  }

  return {
    ...business,
    match_score: checks.length ? Math.round((checks.filter(Boolean).length / checks.length) * 100) : null,
    match_reasons: reasons,
  };
};

const getInvestorSuggestions = async (req, res) => {
  try {
    if (!hasRole(req, "investor")) {
      return res.status(403).json({ success: false, message: "Investor access required." });
    }
    const investor = await investorService.getMyInvestor(req.user.id);
    if (!investor) {
      return res.status(404).json({ success: false, message: "Create an investor profile to get opportunity suggestions." });
    }
    if (!isKycApproved(investor)) {
      return res.status(403).json({
        success: false,
        message: "Investor verification approval is required before personalized suggestions are available. Submit your verification from your account and wait for review.",
      });
    }
    const businesses = await businessService.getPublicBusinesses(50, 0);
    const suggestions = businesses
      .map((business) => scoreOpportunity(investor, business))
      .sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1));
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error("Get investor suggestions error:", error);
    res.status(500).json({ success: false, message: "Could not load opportunity suggestions." });
  }
};

// An investor can request an introduction only for a published opportunity
// after an approved investor profile and KYC review. Requests stay pending for the business.
const createMatchmakingRequest = async (req, res) => {
  try {
    if (!hasRole(req, "investor")) {
      return res.status(403).json({
        success: false,
        message: "Only investor accounts can request an introduction.",
      });
    }

    const { businessId } = req.params;
    const { proposedAmount } = req.body;
    const business = await businessService.getPublicBusinessById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "This approved opportunity is not available.",
      });
    }

    const investorProfile = await investorService.getMyInvestor(req.user.id);
    if (!investorProfile) {
      return res.status(403).json({
        success: false,
        message: "Complete your investor profile before requesting an introduction.",
      });
    }

    if (!isKycApproved(investorProfile)) {
      return res.status(403).json({
        success: false,
        message: "Investor verification approval is required before requesting an introduction. Submit your verification from your account and wait for review.",
      });
    }

    const investmentAmount = proposedAmount == null || proposedAmount === ""
      ? null
      : Number(proposedAmount);
    if (investmentAmount !== null &&
        (!Number.isFinite(investmentAmount) || investmentAmount <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Proposed investment must be a positive amount.",
      });
    }

    const existingMatch = await matchmakingService.getExistingMatch(
      req.user.id,
      businessId
    );

    if (existingMatch) {
      return res.status(409).json({
        success: false,
        message: "You have already sent an introduction request to this business.",
      });
    }

    const match = await matchmakingService.createMatchmakingRequest(
      req.user.id,
      businessId,
      {
        investment_amount: investmentAmount,
        investment_type: business.investment_structure || null,
        message: null,
      }
    );

    try {
      await notificationService.notifyBusinessOwner(businessId, {
        type: "match_request",
        message: `An investor requested an introduction to ${business.business_name}.`,
        actionUrl: "/business-matches",
        actorId: req.user.id,
      });
    } catch (notificationError) {
      console.error("Could not create introduction notification:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: "Your introduction request has been sent for the business to review.",
      data: match,
    });
  } catch (error) {
    console.error("Create matchmaking error:", error);
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "You have already sent an introduction request to this business.",
      });
    }
    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the introduction request.",
    });
  }
};

const getMyInvestorMatches = async (req, res) => {
  try {
    if (!hasRole(req, "investor")) {
      return res.status(403).json({ success: false, message: "Investor access required." });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const matches = await matchmakingService.getInvestorMatches(req.user.id, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("Get investor matches error:", error);
    res.status(500).json({ success: false, message: "Could not fetch matches." });
  }
};

const getMyBusinessMatches = async (req, res) => {
  try {
    if (!hasRole(req, "business")) {
      return res.status(403).json({ success: false, message: "Business access required." });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const matches = await matchmakingService.getBusinessMatches(req.user.id, {
      status,
      page: Number(page),
      limit: Number(limit),
    });
    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("Get business matches error:", error);
    res.status(500).json({ success: false, message: "Could not fetch matchmaking requests." });
  }
};

const updateMatchStatus = async (req, res) => {
  try {
    if (!hasRole(req, "business")) {
      return res.status(403).json({ success: false, message: "Business access required." });
    }
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be accepted or declined.",
      });
    }

    const match = await matchmakingService.getMatchById(id);
    if (!match) {
      return res.status(404).json({ success: false, message: "Introduction request not found." });
    }
    if (String(match.businessOwnerId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this request.",
      });
    }
    if (match.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `This request is already ${match.status}.`,
      });
    }

    const updatedMatch = await matchmakingService.updateMatchStatus(
      id,
      status,
      req.user.id
    );
    if (!updatedMatch) {
      return res.status(404).json({
        success: false,
        message: "Introduction request not found for your business.",
      });
    }

    try {
      await notificationService.createForUser(updatedMatch.investor_id, {
        type: status === "accepted" ? "match_accepted" : "match_declined",
        message: status === "accepted"
          ? "Your introduction request was accepted. Investor Mtaani will coordinate the next step."
          : "Your introduction request was declined.",
        actionUrl: "/matchmaking",
        actorId: req.user.id,
      });
    } catch (notificationError) {
      console.error("Could not create introduction status notification:", notificationError);
    }

    const { investor_id: _investorId, message: _legacyMessage, ...safeMatch } = updatedMatch;
    res.json({
      success: true,
      message: status === "accepted"
        ? "Introduction accepted. Investor Mtaani will coordinate the next step."
        : "Introduction request declined.",
      data: safeMatch,
    });
  } catch (error) {
    console.error("Update matchmaking status error:", error);
    res.status(500).json({ success: false, message: "Could not update the introduction request." });
  }
};

module.exports = {
  createMatchmakingRequest,
  getInvestorSuggestions,
  getMyInvestorMatches,
  getMyBusinessMatches,
  updateMatchStatus,
};
