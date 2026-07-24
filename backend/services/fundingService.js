const pool = require("../config/db");

// Create funding request
const createFundingRequest = async (fundingData, businessId) => {
  const {
    amount_requested,
    funding_type,
    funding_reason,
    expected_impact,
    funding_timeline,
  } = fundingData;

  const result = await pool.query(
    `
    INSERT INTO funding_requests (
      business_id,
      amount_requested,
      funding_type,
      funding_reason,
      expected_impact,
      funding_timeline
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      businessId,
      amount_requested,
      funding_type,
      funding_reason,
      expected_impact,
      funding_timeline,
    ]
  );

  return result.rows[0];
};

// Get funding request by business ID
const getFundingByBusinessId = async (businessId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM funding_requests
    WHERE business_id = $1
    ORDER BY created_at DESC
    `,
    [businessId]
  );

  return result.rows;
};

// Get all open funding requests
const getAllOpenFundingRequests = async () => {
  const result = await pool.query(
    `
    SELECT
      funding_requests.*,
      businesses.business_name,
      businesses.industry,
      businesses.location
    FROM funding_requests
    JOIN businesses
      ON funding_requests.business_id = businesses.id
    WHERE funding_requests.status = 'open'
    ORDER BY funding_requests.created_at DESC
    `
  );

  return result.rows;
};

// Update funding request
const updateFundingRequest = async (id, fundingData) => {
  const {
    amount_requested,
    funding_type,
    funding_reason,
    expected_impact,
    funding_timeline,
    status,
    amount_raised,
  } = fundingData;

  const result = await pool.query(
    `
    UPDATE funding_requests
    SET
      amount_requested = COALESCE($1, amount_requested),
      funding_type = COALESCE($2, funding_type),
      funding_reason = COALESCE($3, funding_reason),
      expected_impact = COALESCE($4, expected_impact),
      funding_timeline = COALESCE($5, funding_timeline),
      status = COALESCE($6, status),
      amount_raised = COALESCE($7, amount_raised),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *
    `,
    [
      amount_requested,
      funding_type,
      funding_reason,
      expected_impact,
      funding_timeline,
      status,
      amount_raised,
      id,
    ]
  );

  return result.rows[0];
};

module.exports = {
  createFundingRequest,
  getFundingByBusinessId,
  getAllOpenFundingRequests,
  updateFundingRequest,
};