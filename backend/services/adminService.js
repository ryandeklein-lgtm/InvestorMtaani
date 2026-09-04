const pool = require("../config/db");

const getAllInvestorsForAdmin = async () => {
  const result = await pool.query(`
    SELECT i.*, u.name, u.email
    FROM investors i
    JOIN users u ON i.user_id = u.id
    ORDER BY u.name ASC
  `);
  return result.rows;
};

const getAllBusinessesForAdmin = async () => {
  const result = await pool.query(`
    SELECT b.*, u.name AS owner_name, u.email AS owner_email
    FROM businesses b
    JOIN users u ON b.user_id = u.id
    ORDER BY b.business_name ASC
  `);
  return result.rows;
};

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
    JOIN users inv ON mr.investor_id = inv.id
    JOIN businesses b ON mr.business_id = b.id
    ORDER BY mr.created_at DESC
  `);
  return result.rows;
};

// Admin manually decides a match. If a request already exists between
// this investor/business, move it to accepted rather than duplicating.
const createAdminMatch = async (
  investorId,
  businessId,
  { investment_amount = null, investment_type = null, message = null } = {}
) => {
  const existing = await pool.query(
    `SELECT * FROM matchmaking_requests WHERE investor_id = $1 AND business_id = $2`,
    [investorId, businessId]
  );

  if (existing.rows[0]) {
    const updated = await pool.query(
      `UPDATE matchmaking_requests SET status = 'accepted' WHERE id = $1 RETURNING *`,
      [existing.rows[0].id]
    );
    return updated.rows[0];
  }

  const result = await pool.query(
    `
    INSERT INTO matchmaking_requests
    (investor_id, business_id, investment_amount, investment_type, message, status, special_request)
    VALUES ($1, $2, $3, $4, $5, 'accepted', true)
    RETURNING *
    `,
    [investorId, businessId, investment_amount, investment_type, message]
  );

  return result.rows[0];
};

// Unlike the business-owner version, admin can set any status, no ownership check.
const adminUpdateMatchStatus = async (matchId, status) => {
  const result = await pool.query(
    `UPDATE matchmaking_requests SET status = $1 WHERE id = $2 RETURNING *`,
    [status, matchId]
  );
  return result.rows[0];
};

module.exports = {
  getAllInvestorsForAdmin,
  getAllBusinessesForAdmin,
  getAllMatchesForAdmin,
  createAdminMatch,
  adminUpdateMatchStatus,
};