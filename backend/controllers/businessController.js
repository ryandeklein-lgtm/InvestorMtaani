const businessService = require("../services/businessService");

// Create business
const createBusiness = async (req, res) => {
  try {
    const business = await businessService.createBusiness(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all businesses
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await businessService.getAllBusinesses();

    res.json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get business by ID and count the profile view
const getBusinessById = async (req, res) => {
  try {
    const business = await businessService.getBusinessByIdAndIncrementViews(
      req.params.id
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get logged-in user's business
// This does NOT increase the view count
const getMyBusiness = async (req, res) => {
  try {
    const business = await businessService.getMyBusiness(req.user.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "No business profile found",
      });
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update business
const updateBusiness = async (req, res) => {
  try {
    const business = await businessService.updateBusiness(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete business
const deleteBusiness = async (req, res) => {
  try {
    await businessService.deleteBusiness(req.params.id);

    res.json({
      success: true,
      message: "Business deleted",
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
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  getMyBusiness,
  updateBusiness,
  deleteBusiness,
};