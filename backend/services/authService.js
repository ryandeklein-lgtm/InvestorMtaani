const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { generateToken } = require("../utils/authUtils");

// Only these roles can be chosen at sign-up. Admins are created manually.
const ALLOWED_SIGNUP_ROLES = ["business", "investor"];
const MIN_PASSWORD_LENGTH = 8;

// Used so login takes the same time whether or not the email exists
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Register a new user
 */
const registerUser = async ({
  name,
  email,
  password,
  role,
  phone,
  acceptedTerms,
}) => {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    throw httpError(400, "Name, email and password are required.");
  }

  if (String(password).length < MIN_PASSWORD_LENGTH) {
    throw httpError(
      400,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    );
  }

  if (!ALLOWED_SIGNUP_ROLES.includes(role)) {
    throw httpError(400, "Please choose a valid account type.");
  }

  if (acceptedTerms !== true) {
    throw httpError(400, "Please accept the Terms & Conditions and Privacy Policy.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, terms_accepted_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, role`,
      [
        cleanName,
        cleanEmail,
        hashedPassword,
        role,
        phone || null,
        new Date(),
      ]
    );

    const user = result.rows[0];

    return {
      ...user,
      token: generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
    };
  } catch (error) {
    // 23505 = unique violation (email already exists)
    if (error.code === "23505") {
      throw httpError(409, "Email already registered.");
    }
    throw error;
  }
};

/**
 * Login user
 */
const loginUser = async ({ email, password }) => {
  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail || !password) {
    throw httpError(400, "Email and password are required.");
  }

  const result = await pool.query(
    `SELECT id, name, email, password, role, status
     FROM users
     WHERE LOWER(email) = $1`,
    [cleanEmail]
  );

  const user = result.rows[0];

  const passwordMatch = await bcrypt.compare(
    password,
    user ? user.password : DUMMY_HASH
  );

  if (!user || !passwordMatch) {
    throw httpError(401, "Invalid email or password.");
  }

  if (user.status !== "active") {
    throw httpError(403, "This account is not active. Please contact support.");
  }

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
};

module.exports = {
  registerUser,
  loginUser,
};
