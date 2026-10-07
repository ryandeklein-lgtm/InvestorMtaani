const pool = require("../config/db");

// Get all investors
const getAllInvestorsForAdmin = async () => {
  const result = await pool.query(`
    SELECT i.*, u.name, u.email
    FROM investors i
    JOIN users u ON i.user_id = u.id
    ORDER BY u.name ASC
  `);

  return result.rows;
};

// Get all businesses
const getAllBusinessesForAdmin = async () => {
  const result = await pool.query(`
    SELECT b.*, u.name AS owner_name, u.email AS owner_email
    FROM businesses b
    JOIN users u ON b.user_id = u.id
    ORDER BY b.business_name ASC
  `);

  return result.rows;
};

// Get all matchmaking requests
const getAllMatchesForAdmin = async () => {
  const result = await pool.query(`
    SELECT
      mr.*,
      inv.name AS investor_name,
      inv.email AS investor_email,
      b.business_name,
      b.industry,
      b.location
    FROM matchmaking_requests mr
    JOIN users inv
      ON mr.investor_id = inv.id
    JOIN businesses b
      ON mr.business_id = b.id
    ORDER BY mr.created_at DESC
  `);

  return result.rows;
};

// Get platform-wide financial and activity statistics
const getAdminStats = async () => {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS total_users,

      (SELECT COUNT(*) FROM businesses) AS total_businesses,

      (SELECT COUNT(*) FROM investors) AS total_investors,

      (SELECT COUNT(*) FROM matchmaking_requests) AS total_matches,

      (
        SELECT COUNT(*)
        FROM matchmaking_requests
        WHERE status = 'accepted'
      ) AS accepted_matches,

      (
        SELECT COUNT(*)
        FROM matchmaking_requests
        WHERE status = 'pending'
      ) AS pending_matches,

      (
        SELECT COUNT(*)
        FROM matchmaking_requests
        WHERE status = 'declined'
      ) AS declined_matches,

      (
        SELECT COALESCE(SUM(amount_requested), 0)
        FROM funding_requests
      ) AS total_funding_requested,

      (
        SELECT COALESCE(SUM(amount_raised), 0)
        FROM funding_requests
      ) AS total_amount_raised,

      (
        SELECT COUNT(*)
        FROM funding_requests
        WHERE status = 'open'
      ) AS open_funding_requests
  `);

  return result.rows[0];
};

// Admin manually creates a matchmaking request
const createAdminMatch = async (
  investorId,
  businessId,
  {
    investment_amount = null,
    investment_type = null,
    message = null,
  } = {}
) => {
  const existing = await pool.query(
    `
    SELECT *
    FROM matchmaking_requests
    WHERE investor_id = $1
      AND business_id = $2
    `,
    [investorId, businessId]
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

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
    VALUES ($1, $2, $3, $4, $5, 'pending', true)
    RETURNING *
    `,
    [
      investorId,
      businessId,
      investment_amount,
      investment_type,
      message,
    ]
  );

  return result.rows[0];
};

// Admin can update matchmaking status
const adminUpdateMatchStatus = async (matchId, status) => {
  const result = await pool.query(
    `
    UPDATE matchmaking_requests
    SET status = $1
    WHERE id = $2
    RETURNING *
    `,
    [status, matchId]
  );

  return result.rows[0];
};

module.exports = {
  getAllInvestorsForAdmin,
  getAllBusinessesForAdmin,
  getAllMatchesForAdmin,
  getAdminStats,
  createAdminMatch,
  adminUpdateMatchStatus,
};