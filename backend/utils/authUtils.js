const jwt = require("jsonwebtoken");

const TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "1d";

/**
 * Generate JWT Token
 * @param {Object} user - must have id, email and role
 * @returns {String}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: TOKEN_EXPIRY,
    }
  );
};

/**
 * Verify JWT Token
 * @param {String} token
 * @returns {Object}
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ["HS256"],
  });
};

module.exports = {
  generateToken,
  verifyToken,
};