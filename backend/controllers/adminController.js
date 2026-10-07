const adminService = require("../services/adminService");

const getAdminProfile = async (req, res) => {
  res.json({
    success: true,
    data: req.admin,
  });
};

// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================
const getAdminStats = async (req, res) => {
  try {
    const data = await adminService.getAdminStats();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch admin statistics.",
    });
  }
};

// ==========================================
// LIST INVESTORS
// ==========================================
const listInvestors = async (req, res) => {
  try {
    const data = await adminService.getAllInvestorsForAdmin();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin list investors error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch investors.",
    });
  }
};

// ==========================================
// LIST BUSINESSES
// ==========================================
const listBusinesses = async (req, res) => {
  try {
    const data = await adminService.getAllBusinessesForAdmin();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin list businesses error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch businesses.",
    });
  }
};

// ==========================================
// LIST MATCHMAKING REQUESTS
// ==========================================
const listMatches = async (req, res) => {
  try {
    const data = await adminService.getAllMatchesForAdmin();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin list matches error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch matches.",
    });
  }
};

// ==========================================
// CREATE MATCH
// ==========================================
const createMatch = async (req, res) => {
  try {
    const {
      investorId,
      businessId,
      investment_amount,
      investment_type,
      message,
    } = req.body;

    if (!investorId || !businessId) {
      return res.status(400).json({
        success: false,
        message: "investorId and businessId are required.",
      });
    }

    const match = await adminService.createAdminMatch(
      investorId,
      businessId,
      {
        investment_amount,
        investment_type,
        message,
      }
    );

    res.status(201).json({
      success: true,
      message: "Match created successfully.",
      data: match,
    });
  } catch (error) {
    console.error("Admin create match error:", error);

    res.status(500).json({
      success: false,
      message: "Could not create match.",
    });
  }
};

// ==========================================
// UPDATE MATCH STATUS
// ==========================================
const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Only the business participant can accept an introduction request.
    const allowedStatuses = ["pending", "declined"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    const match = await adminService.adminUpdateMatchStatus(
      id,
      status
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found.",
      });
    }

    res.json({
      success: true,
      message: "Match status updated successfully.",
      data: match,
    });
  } catch (error) {
    console.error("Admin update match error:", error);

    res.status(500).json({
      success: false,
      message: "Could not update match status.",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  getAdminProfile,
  getAdminStats,
  listInvestors,
  listBusinesses,
  listMatches,
  createMatch,
  updateMatch,
};
