const pool = require("../config/db");

// Create business
const createBusiness = async (business, userId) => {
  const {
    business_name,
    industry,
    location,
    description,
    year_established,
    employees,
    annual_revenue,
    monthly_gross,
    monthly_net,
    amount_seeking,
    funding_reason,
  } = business;

  const result = await pool.query(
    `
    INSERT INTO businesses
    (
      user_id,
      business_name,
      industry,
      location,
      description,
      year_established,
      employees,
      annual_revenue,
      monthly_gross,
      monthly_net,
      amount_seeking,
      funding_reason
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *
    `,
    [
      userId,
      business_name,
      industry,
      location,
      description,
      year_established,
      employees,
      annual_revenue,
      monthly_gross,
      monthly_net,
      amount_seeking,
      funding_reason,
    ]
  );

  return result.rows[0];
};

// Get all businesses
const getAllBusinesses = async () => {
  const result = await pool.query(
    "SELECT * FROM businesses ORDER BY created_at DESC"
  );

  return result.rows;
};

// Get business by ID without increasing views
const getBusinessById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM businesses WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

// Get business by ID and increase profile views
const getBusinessByIdAndIncrementViews = async (id) => {
  const result = await pool.query(
    `
    UPDATE businesses
    SET views = COALESCE(views, 0) + 1
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};

// Get logged-in user's business
// Does not increase views
const getMyBusiness = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM businesses WHERE user_id = $1",
    [userId]
  );

  return result.rows[0];
};

// Update business
const updateBusiness = async (id, business) => {
  const {
    business_name,
    industry,
    location,
    description,
    year_established,
    employees,
    annual_revenue,
    monthly_gross,
    monthly_net,
    amount_seeking,
    funding_reason,
  } = business;

  const result = await pool.query(
    `
    UPDATE businesses
    SET
      business_name = COALESCE($1, business_name),
      industry = COALESCE($2, industry),
      location = COALESCE($3, location),
      description = COALESCE($4, description),
      year_established = COALESCE($5, year_established),
      employees = COALESCE($6, employees),
      annual_revenue = COALESCE($7, annual_revenue),
      monthly_gross = COALESCE($8, monthly_gross),
      monthly_net = COALESCE($9, monthly_net),
      amount_seeking = COALESCE($10, amount_seeking),
      funding_reason = COALESCE($11, funding_reason)
    WHERE id = $12
    RETURNING *
    `,
    [
      business_name,
      industry,
      location,
      description,
      year_established,
      employees,
      annual_revenue,
      monthly_gross,
      monthly_net,
      amount_seeking,
      funding_reason,
      id,
    ]
  );

  return result.rows[0];
};

// Delete business
const deleteBusiness = async (id) => {
  const result = await pool.query(
    "DELETE FROM businesses WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

module.exports = {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
  getBusinessByIdAndIncrementViews,
  getMyBusiness,
  updateBusiness,
  deleteBusiness,
};