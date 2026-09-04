const matchmakingService = require("../services/matchmakingService");

const ALLOWED_TRANSITIONS = {
  pending: ["accepted", "declined"],
};

// Create a matchmaking request
const createMatchmakingRequest = async (req, res) => {
  try {
    const investorId = req.user.id;
    const { businessId } = req.params;
    const { message, proposedAmount } = req.body;

    if (message && typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message must be text.",
      });
    }

    const existingMatch = await matchmakingService.getExistingMatch(
      investorId,
      businessId
    );

    if (existingMatch) {
      return res.status(409).json({
        success: false,
        message: "You have already sent a matchmaking request to this business.",
      });
    }

    const match = await matchmakingService.createMatchmakingRequest(
      investorId,
      businessId,
      { message, proposedAmount }
    );

    res.status(201).json({
      success: true,
      message: "Matchmaking request sent successfully.",
      data: match,
    });
  } catch (error) {
    console.error("Create matchmaking error:", error);

    // Catch a unique-constraint violation from the DB as a fallback
    // for the race condition the pre-check can't fully prevent.
    if (error.code === "23505" /* Postgres unique_violation */) {
      return res.status(409).json({
        success: false,
        message: "You have already sent a matchmaking request to this business.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong while creating the match.",
    });
  }
};

// Get requests sent by the logged-in investor
const getMyInvestorMatches = async (req, res) => {
  try {
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

// Get requests received by the logged-in business owner
const getMyBusinessMatches = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const matches = await matchmakingService.getBusinessMatches(req.user.id, {
      status,
      page: Number(page),
      limit: Number(limit),
    });

    res.json({ success: true, data: matches });
  } catch (error) {
    console.error("Get business matches error:", error);
    res.status(500).json({ success: false, message: "Could not fetch matches." });
  }
};

// Accept or decline a matchmaking request
const updateMatchStatus = async (req, res) => {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Matchmaking request not found.",
      });
    }

    if (match.businessOwnerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this request.",
      });
    }

    const allowedNext = ALLOWED_TRANSITIONS[match.status] || [];
    if (!allowedNext.includes(status)) {
      return res.status(409).json({
        success: false,
        message: `Cannot change status from "${match.status}" to "${status}".`,
      });
    }

    const updatedMatch = await matchmakingService.updateMatchStatus(id, status);

    res.json({
      success: true,
      message: `Matchmaking request ${status}.`,
      data: updatedMatch,
    });
  } catch (error) {
    console.error("Update matchmaking status error:", error);
    res.status(500).json({ success: false, message: "Could not update match status." });
  }
};

module.exports = {
  createMatchmakingRequest,
  getMyInvestorMatches,
  getMyBusinessMatches,
  updateMatchStatus,
};