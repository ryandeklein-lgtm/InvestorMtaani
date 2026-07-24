const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { generateToken } = require("../utils/authUtils");

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, role }) => {
  try {
    // Check if email already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [
        name,
        email,
        hashedPassword,
        role || "user",
      ]
    );

    const user = result.rows[0];

    return {
      ...user,
      token: generateToken(user),
    };

  } catch (error) {
    throw error;
  }
};


/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  try {
    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or password.");
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    // Debug information
    console.log("LOGIN EMAIL:", email);
    console.log("PASSWORD MATCH:", passwordMatch);

    if (!passwordMatch) {
      throw new Error("Invalid email or password.");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

  } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    throw error;
  }
};


module.exports = {
  registerUser,
  loginUser,
};