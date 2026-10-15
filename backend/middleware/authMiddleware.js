const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const unauthorized = (res, message = "Unauthorized") =>
  res.status(401).json({ success: false, message });

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (!token || scheme.toLowerCase() !== "bearer") {
      return unauthorized(res, "Please log in to continue.");
    }

    // Verify signature and expiry (only HS256 accepted)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // Re-check the user so suspensions and role changes apply immediately
    const result = await pool.query(
      "SELECT id, email, role, status FROM users WHERE id = $1",
      [decoded.id]
    );

    const user = result.rows[0];

    if (!user) {
      return unauthorized(res, "Account not found. Please log in again.");
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active. Please contact support.",
      });
    }

    req.user = { id: user.id, email: user.email, role: user.role };

    next();
  } catch (error) {
    // Expired, malformed or tampered token. Don't reveal which.
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return unauthorized(res, "Your session has expired. Please log in again.");
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// Use after authMiddleware: router.get("/x", authMiddleware, requireRole("admin"), handler)
authMiddleware.requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to do that.",
      });
    }
    next();
  };

module.exports = authMiddleware;