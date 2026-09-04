const adminService = require("../services/adminService");

const listInvestors = async (req, res) => {
  try {
    const data = await adminService.getAllInvestorsForAdmin();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Admin list investors error:", error);
    res.status(500).json({ success: false, message: "Could not fetch investors." });
  }
};

const listBusinesses = async (req, res) => {
  try {
    const data = await adminService.getAllBusinessesForAdmin();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Admin list businesses error:", error);
    res.status(500).json({ success: false, message: "Could not fetch businesses." });
  }
};

const listMatches = async (req, res) => {
  try {
    const data = await adminService.getAllMatchesForAdmin();
    res.json({ success: true, data });
  } catch (error) {
    console.error("Admin list matches error:", error);
    res.status(500).json({ success: false, message: "Could not fetch matches." });
  }
};

const createMatch = async (req, res) => {
  try {
    const { investorId, businessId, investment_amount, investment_type, message } = req.body;

    if (!investorId || !businessId) {
      return res.status(400).json({
        success: false,
        message: "investorId and businessId are required.",
      });
    }

    const match = await adminService.createAdminMatch(investorId, businessId, {
      investment_amount,
      investment_type,
      message,
    });

    res.status(201).json({ success: true, message: "Match created.", data: match });
  } catch (error) {
    console.error("Admin create match error:", error);
    res.status(500).json({ success: false, message: "Could not create match." });
  }
};

const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, accepted, or declined.",
      });
    }

    const match = await adminService.adminUpdateMatchStatus(id, status);

    if (!match) {
      return res.status(404).json({ success: false, message: "Match not found." });
    }

    res.json({ success: true, message: `Match set to ${status}.`, data: match });
  } catch (error) {
    console.error("Admin update match error:", error);
    res.status(500).json({ success: false, message: "Could not update match." });
  }
};

module.exports = {
  listInvestors,
  listBusinesses,
  listMatches,
  createMatch,
  updateMatch,
};