const matchmakingService = require("../services/matchmakingService");

// Create a matchmaking request
const createMatchmakingRequest = async (req, res) => {
  try {
    const investorId = req.user.id;
    const { businessId } = req.params;

    const existingMatch =
      await matchmakingService.getExistingMatch(
        investorId,
        businessId
      );

    if (existingMatch) {
      return res.status(400).json({
        success: false,
        message:
          "You have already sent a matchmaking request to this business.",
      });
    }

    const match =
      await matchmakingService.createMatchmakingRequest(
        investorId,
        businessId,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Matchmaking request sent successfully.",
      data: match,
    });
  } catch (error) {
    console.error("Create matchmaking error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get requests sent by the logged-in investor
const getMyInvestorMatches = async (req, res) => {
  try {
    const matches =
      await matchmakingService.getInvestorMatches(req.user.id);

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("Get investor matches error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get requests received by the logged-in business owner
const getMyBusinessMatches = async (req, res) => {
  try {
    const matches =
      await matchmakingService.getBusinessMatches(req.user.id);

    res.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error("Get business matches error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Accept or decline a matchmaking request
const updateMatchStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "accepted",
      "declined",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be pending, accepted, or declined.",
      });
    }

    const updatedMatch =
      await matchmakingService.updateMatchStatus(
        id,
        status,
        req.user.id
      );

    if (!updatedMatch) {
      return res.status(404).json({
        success: false,
        message:
          "Matchmaking request not found or you do not have permission.",
      });
    }

    res.json({
      success: true,
      message: `Matchmaking request ${status}.`,
      data: updatedMatch,
    });
  } catch (error) {
    console.error("Update matchmaking status error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createMatchmakingRequest,
  getMyInvestorMatches,
  getMyBusinessMatches,
  updateMatchStatus,
};