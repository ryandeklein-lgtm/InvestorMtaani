const pool = require("../config/db");

/**
 * Create Startup
 */
const createStartup = async (startupData) => {
  const {
    user_id,
    startup_name,
    industry,
    location,
    description,
    year_established,
    employees,
    annual_revenue,
    monthly_gross,
    monthly_net,
    website_visitors,
    investment_readiness_score,
  } = startupData;

  const result = await pool.query(
    `INSERT INTO startups (
      user_id,
      startup_name,
      industry,
      location,
      description,
      year_established,
      employees,
      annual_revenue,
      monthly_gross,
      monthly_net,
      website_visitors,
      investment_readiness_score
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )
    RETURNING *`,
    [
      user_id,
      startup_name,
      industry,
      location,
      description,
      year_established,
      employees,
      annual_revenue,
      monthly_gross,
      monthly_net,
      website_visitors,
      investment_readiness_score,
    ]
  );

  return result.rows[0];
};

/**
 * Get All Startups
 */
const getAllStartups = async () => {
  const result = await pool.query(
    "SELECT * FROM startups ORDER BY created_at DESC"
  );

  return result.rows;
};

/**
 * Get Startup By ID
 */
const getStartupById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM startups WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

/**
 * Update Startup
 */
const updateStartup = async (id, startupData) => {
  const {
    startup_name,
    industry,
    location,
    description,
    year_established,
    employees,
    annual_revenue,
    monthly_gross,
    monthly_net,
    website_visitors,
    investment_readiness_score,
  } = startupData;

  const result = await pool.query(
    `UPDATE startups
     SET
      startup_name=$1,
      industry=$2,
      location=$3,
      description=$4,
      year_established=$5,
      employees=$6,
      annual_revenue=$7,
      monthly_gross=$8,
      monthly_net=$9,
      website_visitors=$10,
      investment_readiness_score=$11
     WHERE id=$12
     RETURNING *`,
    [
      startup_name,
      industry,
      location,
      description,
      year_established,
      employees,
      annual_revenue,
      monthly_gross,
      monthly_net,
      website_visitors,
      investment_readiness_score,
      id,
    ]
  );

  return result.rows[0];
};

/**
 * Delete Startup
 */
const deleteStartup = async (id) => {
  await pool.query(
    "DELETE FROM startups WHERE id = $1",
    [id]
  );
};

module.exports = {
  createStartup,
  getAllStartups,
  getStartupById,
  updateStartup,
  deleteStartup,
};