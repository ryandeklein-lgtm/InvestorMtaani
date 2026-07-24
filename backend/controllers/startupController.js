const startupService = require("../services/startupService");

/**
 * Create Startup
 */
const createStartup = async (req, res) => {
  try {
    const startup = await startupService.createStartup({
      ...req.body,
      user_id: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Business created successfully",
      data: startup,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Startups
 */
const getAllStartups = async (req, res) => {
  try {
    const startups = await startupService.getAllStartups();

    res.json({
      success: true,
      data: startups,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Startup By ID
 */
const getStartupById = async (req, res) => {
  try {
    const startup = await startupService.getStartupById(req.params.id);

    if (!startup) {
      return res.status(404).json({
        success: false,
        message: "Business not found",
      });
    }

    res.json({
      success: true,
      data: startup,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Startup
 */
const updateStartup = async (req, res) => {
  try {
    const startup = await startupService.updateStartup(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Business updated successfully",
      data: startup,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Startup
 */
const deleteStartup = async (req, res) => {
  try {
    await startupService.deleteStartup(req.params.id);

    res.json({
      success: true,
      message: "Business deleted successfully",
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
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
};