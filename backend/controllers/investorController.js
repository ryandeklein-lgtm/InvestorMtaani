const investorService = require("../services/investorService");

// Create investor profile
const createInvestor = async (req, res) => {
  try {
    const investor = await investorService.createInvestor(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all investors
const getAllInvestors = async (req, res) => {
  try {
    const investors = await investorService.getAllInvestors();

    res.json({
      success: true,
      data: investors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get investor by ID and count the profile view
const getInvestorById = async (req, res) => {
  try {
    const investor =
      await investorService.getInvestorByIdAndIncrementViews(
        req.params.id
      );

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "Investor not found",
      });
    }

    res.json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in user's investor profile
// This does NOT increase the view count
const getMyInvestor = async (req, res) => {
  try {
    const investor = await investorService.getMyInvestor(req.user.id);

    if (!investor) {
      return res.status(404).json({
        success: false,
        message: "No investor profile found",
      });
    }

    res.json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update investor profile
const updateInvestor = async (req, res) => {
  try {
    const investor = await investorService.updateInvestor(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: investor,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete investor profile
const deleteInvestor = async (req, res) => {
  try {
    await investorService.deleteInvestor(req.params.id);

    res.json({
      success: true,
      message: "Investor profile deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createInvestor,
  getAllInvestors,
  getInvestorById,
  getMyInvestor,
  updateInvestor,
  deleteInvestor,
};