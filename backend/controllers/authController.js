const { registerUser, loginUser } = require("../services/authService");

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    const user = await registerUser({ name, email, password, role });

    res.status(201).json({
      message: "User registered successfully.",
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Registration failed.",
    });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({
      message: error.message || "Login failed.",
    });
  }
};

module.exports = {
  register,
  login,
};