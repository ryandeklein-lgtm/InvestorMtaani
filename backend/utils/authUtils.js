const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 * @param {Object} user
 * @returns {String}
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Verify JWT Token
 * @param {String} token
 * @returns {Object}
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};