const Admin = require("../models/Admin");

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  Admin.findByUserId(req.user.id)
    .then((admin) => {
      if (!admin || admin.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "An active administrator account is required.",
        });
      }

      req.admin = admin;
      next();
    })
    .catch((error) => {
      console.error("Admin identity lookup error:", error);
      res.status(500).json({
        success: false,
        message: "Could not verify administrator access.",
      });
    });
};

module.exports = adminMiddleware;
