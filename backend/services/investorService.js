const pool = require("../config/db");

// Create investor profile
const createInvestor = async (investor, userId) => {
  const {
    display_name,
    investor_type,
    location,
    thesis,
    min_check_size,
    max_check_size,
    preferred_stage,
    sectors_of_interest,
    geographic_focus,
    investing_status,
    portfolio_highlights,
  } = investor;

  const result = await pool.query(
    `
    INSERT INTO investors
    (
      user_id,
      display_name,
      investor_type,
      location,
      thesis,
      min_check_size,
      max_check_size,
      preferred_stage,
      sectors_of_interest,
      geographic_focus,
      investing_status,
      portfolio_highlights
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      userId,
      display_name,
      investor_type,
      location,
      thesis,
      min_check_size,
      max_check_size,
      preferred_stage,
      sectors_of_interest,
      geographic_focus,
      investing_status,
      portfolio_highlights,
    ]
  );

  return result.rows[0];
};

// Get all investors
const getAllInvestors = async () => {
  const result = await pool.query(
    "SELECT * FROM investors ORDER BY created_at DESC"
  );

  return result.rows;
};

// Get investor by ID without increasing views
const getInvestorById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM investors WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

// Get investor by ID and increase profile views
// Used when a business views an investor's profile
const getInvestorByIdAndIncrementViews = async (id) => {
  const result = await pool.query(
    `
    UPDATE investors
    SET views = COALESCE(views, 0) + 1
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

// Get logged-in user's investor profile
// Does not increase views
const getMyInvestor = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM investors WHERE user_id = $1",
    [userId]
  );

  return result.rows[0];
};

// Update investor profile
const updateInvestor = async (id, investor) => {
  const {
    display_name,
    investor_type,
    location,
    thesis,
    min_check_size,
    max_check_size,
    preferred_stage,
    sectors_of_interest,
    geographic_focus,
    investing_status,
    portfolio_highlights,
  } = investor;

  const result = await pool.query(
    `
    UPDATE investors
    SET
      display_name = COALESCE($1, display_name),
      investor_type = COALESCE($2, investor_type),
      location = COALESCE($3, location),
      thesis = COALESCE($4, thesis),
      min_check_size = COALESCE($5, min_check_size),
      max_check_size = COALESCE($6, max_check_size),
      preferred_stage = COALESCE($7, preferred_stage),
      sectors_of_interest = COALESCE($8, sectors_of_interest),
      geographic_focus = COALESCE($9, geographic_focus),
      investing_status = COALESCE($10, investing_status),
      portfolio_highlights = COALESCE($11, portfolio_highlights),
      updated_at = NOW()
    WHERE id = $12
    RETURNING *
    `,
    [
      display_name,
      investor_type,
      location,
      thesis,
      min_check_size,
      max_check_size,
      preferred_stage,
      sectors_of_interest,
      geographic_focus,
      investing_status,
      portfolio_highlights,
      id,
    ]
  );

  return result.rows[0];
};

// Delete investor profile
const deleteInvestor = async (id) => {
  const result = await pool.query(
    "DELETE FROM investors WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createInvestor,
  getAllInvestors,
  getInvestorById,
  getInvestorByIdAndIncrementViews,
  getMyInvestor,
  updateInvestor,
  deleteInvestor,
};