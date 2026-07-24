const pool = require("../config/db");

// Create a matchmaking request
const createMatchmakingRequest = async (
  investorId,
  businessId,
  requestData = {}
) => {
  const {
    investment_amount = null,
    investment_type = null,
    message = null,
    special_request = false,
  } = requestData;

  const result = await pool.query(
    `
    INSERT INTO matchmaking_requests
    (
      investor_id,
      business_id,
      investment_amount,
      investment_type,
      message,
      status,
      special_request
    )
    VALUES ($1, $2, $3, $4, $5, 'pending', $6)
    RETURNING *
    `,
    [
      investorId,
      businessId,
      investment_amount,
      investment_type,
      message,
      special_request,
    ]
  );

  return result.rows[0];
};

// Check if an investor already requested a match
const getExistingMatch = async (investorId, businessId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM matchmaking_requests
    WHERE investor_id = $1
    AND business_id = $2
    `,
    [investorId, businessId]
  );

  return result.rows[0];
};

// Get matchmaking requests sent by an investor
const getInvestorMatches = async (investorId) => {
  const result = await pool.query(
    `
    SELECT
      mr.*,
      b.business_name,
      b.industry,
      b.location
    FROM matchmaking_requests mr
    JOIN businesses b
      ON mr.business_id = b.id
    WHERE mr.investor_id = $1
    ORDER BY mr.created_at DESC
    `,
    [investorId]
  );

  return result.rows;
};

// Get matchmaking requests received by a business owner
const getBusinessMatches = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      mr.*,
      u.name AS investor_name,
      u.email AS investor_email,
      b.business_name
    FROM matchmaking_requests mr
    JOIN businesses b
      ON mr.business_id = b.id
    JOIN users u
      ON mr.investor_id = u.id
    WHERE b.user_id = $1
    ORDER BY mr.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

// Update matchmaking request status
const updateMatchStatus = async (matchId, status, userId) => {
  const result = await pool.query(
    `
    UPDATE matchmaking_requests mr
    SET status = $1
    FROM businesses b
    WHERE mr.id = $2
      AND mr.business_id = b.id
      AND b.user_id = $3
    RETURNING mr.*
    `,
    [status, matchId, userId]
  );

  return result.rows[0];
};

module.exports = {
  createMatchmakingRequest,
  getExistingMatch,
  getInvestorMatches,
  getBusinessMatches,
  updateMatchStatus,
};