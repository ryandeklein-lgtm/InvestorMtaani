const pool = require("../config/db");

const BUSINESS_STATUSES = [
  "draft",
  "submitted",
  "needs_changes",
  "approved",
  "rejected",
  "suspended",
];

// Columns safe to show publicly. Raw revenue/profit figures are NOT included;
// a turnover band is shown instead.
const PUBLIC_COLUMNS = `
  id, ('Opportunity #' || id::text) AS business_name,
  industry, 'Kenya'::text AS location,
  ('An approved business in ' || COALESCE(NULLIF(industry, ''), 'a growing sector') || ' is seeking capital to grow.') AS description,
  amount_seeking, investment_structure, business_stage,
  verified_at, views, created_at,
  CASE
    WHEN annual_revenue < 2000000  THEN 'Below KSh 2M'
    WHEN annual_revenue < 5000000  THEN 'KSh 2M - 5M'
    WHEN annual_revenue < 10000000 THEN 'KSh 5M - 10M'
    WHEN annual_revenue < 50000000 THEN 'KSh 10M - 50M'
    ELSE 'Above KSh 50M'
  END AS turnover_band
`;

/**
 * Create business (starts as a draft)
 */
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
    investment_structure,
    use_of_funds,
    business_stage,
    registration_number,
    kra_pin,
    risk_disclosure,
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
      funding_reason,
      investment_structure,
      use_of_funds,
      business_stage,
      registration_number,
      kra_pin,
      risk_disclosure
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
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
      investment_structure,
      use_of_funds,
      business_stage,
      registration_number,
      kra_pin,
      risk_disclosure,
    ]
  );

  return result.rows[0];
};

/**
 * PUBLIC: approved businesses only, no sensitive financials
 */
const getPublicBusinesses = async (limit = 20, offset = 0) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const result = await pool.query(
    `SELECT ${PUBLIC_COLUMNS}
     FROM businesses
     WHERE status = 'approved'
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [safeLimit, safeOffset]
  );

  return result.rows;
};

/**
 * PUBLIC: one approved business, increments profile views
 */
const getPublicBusinessById = async (id) => {
  const result = await pool.query(
    `UPDATE businesses
     SET views = COALESCE(views, 0) + 1
     WHERE id = $1 AND status = 'approved'
     RETURNING ${PUBLIC_COLUMNS}`,
    [id]
  );

  return result.rows[0];
};

/**
 * ADMIN / INTERNAL: all businesses with every column.
 * Do not expose this on a public route.
 */
const getAllBusinesses = async () => {
  const result = await pool.query(
    "SELECT * FROM businesses ORDER BY created_at DESC"
  );

  return result.rows;
};

/**
 * ADMIN / INTERNAL: one business with every column, no view increment
 */
const getBusinessById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM businesses WHERE id = $1",
    [id]
  );

  return result.rows[0];
};

/**
 * Kept for compatibility. Prefer getPublicBusinessById for public pages.
 */
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

/**
 * Logged-in user's own business (no view increment)
 */
const getMyBusiness = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM businesses WHERE user_id = $1",
    [userId]
  );

  return result.rows[0];
};

// Shared update query. The WHERE clause is added by the callers below.
const UPDATE_SET_CLAUSE = `
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
    funding_reason = COALESCE($11, funding_reason),
    investment_structure = COALESCE($12, investment_structure),
    use_of_funds = COALESCE($13, use_of_funds),
    business_stage = COALESCE($14, business_stage),
    registration_number = COALESCE($15, registration_number),
    kra_pin = COALESCE($16, kra_pin),
    risk_disclosure = COALESCE($17, risk_disclosure)
`;

const updateValues = (business) => [
  business.business_name,
  business.industry,
  business.location,
  business.description,
  business.year_established,
  business.employees,
  business.annual_revenue,
  business.monthly_gross,
  business.monthly_net,
  business.amount_seeking,
  business.funding_reason,
  business.investment_structure,
  business.use_of_funds,
  business.business_stage,
  business.registration_number,
  business.kra_pin,
  business.risk_disclosure,
];

/**
 * Update a business by id (no ownership check).
 * Use for admin only. Owners should use updateMyBusiness.
 */
const updateBusiness = async (id, business) => {
  const result = await pool.query(
    `UPDATE businesses ${UPDATE_SET_CLAUSE} WHERE id = $18 RETURNING *`,
    [...updateValues(business), id]
  );

  return result.rows[0];
};

/**
 * Update the logged-in user's own business. Returns undefined if the
 * user has no business, so they can never edit someone else's.
 */
const updateMyBusiness = async (userId, business) => {
  const result = await pool.query(
    `UPDATE businesses ${UPDATE_SET_CLAUSE} WHERE user_id = $18 RETURNING *`,
    [...updateValues(business), userId]
  );

  return result.rows[0];
};

/**
 * Owner submits their profile for review
 */
const submitBusinessForReview = async (userId) => {
  const result = await pool.query(
    `UPDATE businesses
     SET status = 'submitted'
     WHERE user_id = $1 AND status IN ('draft', 'needs_changes')
     RETURNING *`,
    [userId]
  );

  return result.rows[0];
};

/**
 * ADMIN: approve, reject, request changes, or suspend a business
 */
const setBusinessStatus = async (id, status, reviewNotes = null) => {
  if (!BUSINESS_STATUSES.includes(status)) {
    const err = new Error("Invalid business status.");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE businesses
     SET status = $1::varchar,
         review_notes = $2,
         verified_at = CASE
           WHEN $1::varchar = 'approved' THEN NOW()
           ELSE verified_at
         END
     WHERE id = $3
     RETURNING *`,
    [status, reviewNotes, id]
  );

  return result.rows[0];
};

/**
 * Delete a business by id (no ownership check). Admin only.
 */
const deleteBusiness = async (id) => {
  const result = await pool.query(
    "DELETE FROM businesses WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};

/**
 * Delete the logged-in user's own business
 */
const deleteMyBusiness = async (userId) => {
  const result = await pool.query(
    "DELETE FROM businesses WHERE user_id = $1 RETURNING *",
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  BUSINESS_STATUSES,
  createBusiness,
  getPublicBusinesses,
  getPublicBusinessById,
  getAllBusinesses,
  getBusinessById,
  getBusinessByIdAndIncrementViews,
  getMyBusiness,
  updateBusiness,
  updateMyBusiness,
  submitBusinessForReview,
  setBusinessStatus,
  deleteBusiness,
  deleteMyBusiness,
};
