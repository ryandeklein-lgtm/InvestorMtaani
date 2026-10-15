const { registerUser, loginUser } = require("../services/authService");

// Send the right status code without leaking internal error details
const sendError = (res, error, fallbackMessage) => {
  const status = error.status || 500;

  if (status === 500) {
    console.error("Auth error:", error);
  }

  res.status(status).json({
    message: status === 500 ? fallbackMessage : error.message,
  });
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Accept a few common names for the terms checkbox value
    const acceptedTerms =
      req.body.acceptedTerms === true ||
      req.body.termsAccepted === true ||
      req.body.terms === true;

    const user = await registerUser({
      name,
      email,
      password,
      role,
      phone,
      acceptedTerms,
    });

    res.status(201).json({
      message: "User registered successfully.",
      user,
    });
  } catch (error) {
    sendError(res, error, "Registration failed. Please try again.");
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    sendError(res, error, "Login failed. Please try again.");
  }
};

module.exports = {
  register,
  login,
};
