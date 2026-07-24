const fundingService = require("../services/fundingService");
const businessService = require("../services/businessService");

// Create a funding request for the logged-in user's business
const createFundingRequest = async (req, res) => {
  try {
    const userId = req.user.id;

    const business = await businessService.getMyBusiness(userId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Create a business profile before requesting funding",
      });
    }

    const {
      amount_requested,
      funding_type,
      funding_reason,
    } = req.body;

    if (!amount_requested || !funding_type || !funding_reason) {
      return res.status(400).json({
        success: false,
        message:
          "Amount requested, funding type, and funding reason are required",
      });
    }

    const fundingRequest =
      await fundingService.createFundingRequest(
        req.body,
        business.id
      );

    return res.status(201).json({
      success: true,
      message: "Funding request created successfully",
      data: fundingRequest,
    });
  } catch (error) {
    console.error("Create funding request error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not create funding request",
    });
  }
};

// Get logged-in business's funding requests
const getMyFundingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const business = await businessService.getMyBusiness(userId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: "Business profile not found",
      });
    }

    const fundingRequests =
      await fundingService.getFundingByBusinessId(business.id);

    return res.status(200).json({
      success: true,
      data: fundingRequests,
    });
  } catch (error) {
    console.error("Get funding requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not get funding requests",
    });
  }
};

// Get all open funding opportunities
const getAllOpenFundingRequests = async (req, res) => {
  try {
    const fundingRequests =
      await fundingService.getAllOpenFundingRequests();

    return res.status(200).json({
      success: true,
      data: fundingRequests,
    });
  } catch (error) {
    console.error("Get open funding requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not get funding opportunities",
    });
  }
};

// Update a funding request
const updateFundingRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const fundingRequest =
      await fundingService.updateFundingRequest(id, req.body);

    if (!fundingRequest) {
      return res.status(404).json({
        success: false,
        message: "Funding request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Funding request updated successfully",
      data: fundingRequest,
    });
  } catch (error) {
    console.error("Update funding request error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not update funding request",
    });
  }
};

module.exports = {
  createFundingRequest,
  getMyFundingRequests,
  getAllOpenFundingRequests,
  updateFundingRequest,
};