const businessService = require("../services/businessService");

// Commercial rule from the brief: businesses with annual turnover of
// KSh 2 million or more can apply. Change this one number if the rule changes.
const MIN_ANNUAL_TURNOVER = 2000000;

// Fields a business must fill in before it can be sent for review
const REQUIRED_FOR_REVIEW = [
  "business_name",
  "industry",
  "location",
  "description",
  "annual_revenue",
  "amount_seeking",
  "funding_reason",
  "investment_structure",
  "use_of_funds",
];

const isAdmin = (req) => req.user?.role === "admin";

const handleError = (res, error) => {
  const status = error.status || 500;

  if (status === 500) console.error(error);

  res.status(status).json({
    success: false,
    message: status === 500 ? "Something went wrong. Please try again." : error.message,
  });
};

const fail = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Load a business and make sure the caller owns it (or is an admin)
const loadOwnedBusiness = async (req) => {
  const business = await businessService.getBusinessById(req.params.id);

  if (!business) throw fail(404, "Business not found");

  if (!isAdmin(req) && String(business.user_id) !== String(req.user.id)) {
    throw fail(403, "You can only manage your own business.");
  }

  return business;
};

// Create business (starts as a draft). One business per user.
const createBusiness = async (req, res) => {
  try {
    const existing = await businessService.getMyBusiness(req.user.id);

    if (existing) {
      throw fail(409, "You already have a business profile. Please edit it instead.");
    }

    const business = await businessService.createBusiness(req.body, req.user.id);

    res.status(201).json({ success: true, data: business });
  } catch (error) {
    handleError(res, error);
  }
};

// PUBLIC list: approved businesses only, turnover band instead of raw figures
const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await businessService.getPublicBusinesses(
      req.query.limit,
      req.query.offset
    );

    res.json({ success: true, data: businesses });
  } catch (error) {
    handleError(res, error);
  }
};

// ADMIN list: every business with every column
const adminGetAllBusinesses = async (req, res) => {
  try {
    if (!isAdmin(req)) throw fail(403, "Admin access required.");

    const businesses = await businessService.getAllBusinesses();

    res.json({ success: true, data: businesses });
  } catch (error) {
    handleError(res, error);
  }
};

// PUBLIC detail: approved only and counts the view. Admins see the full record.
const getBusinessById = async (req, res) => {
  try {
    let business;

    if (isAdmin(req)) {
      business = await businessService.getBusinessById(req.params.id);
    } else {
      business = await businessService.getPublicBusinessById(req.params.id);
    }

    if (!business) throw fail(404, "Business not found");

    res.json({ success: true, data: business });
  } catch (error) {
    handleError(res, error);
  }
};

// Logged-in user's own business (full record, does NOT increase views)
const getMyBusiness = async (req, res) => {
  try {
    const business = await businessService.getMyBusiness(req.user.id);

    if (!business) throw fail(404, "No business profile found");

    res.json({ success: true, data: business });
  } catch (error) {
    handleError(res, error);
  }
};

// Update business: owner or admin only
const updateBusiness = async (req, res) => {
  try {
    const existing = await loadOwnedBusiness(req);

    if (!isAdmin(req) && existing.status === "suspended") {
      throw fail(403, "This business is suspended. Please contact support.");
    }

    const business = await businessService.updateBusiness(
      req.params.id,
      req.body
    );

    res.json({ success: true, data: business });
  } catch (error) {
    handleError(res, error);
  }
};

// Owner sends their profile for review
const submitForReview = async (req, res) => {
  try {
    const mine = await businessService.getMyBusiness(req.user.id);

    if (!mine) throw fail(404, "No business profile found");

    const missing = REQUIRED_FOR_REVIEW.filter(
      (field) =>
        mine[field] === null ||
        mine[field] === undefined ||
        String(mine[field]).trim() === ""
    );

    if (missing.length > 0) {
      throw fail(400, `Please complete these fields first: ${missing.join(", ")}`);
    }

    if (Number(mine.annual_revenue) < MIN_ANNUAL_TURNOVER) {
      throw fail(
        400,
        "Businesses with annual turnover of KSh 2 million or more can apply."
      );
    }

    const submitted = await businessService.submitBusinessForReview(req.user.id);

    if (!submitted) {
      throw fail(
        409,
        "This profile can't be submitted right now. It may already be under review or approved."
      );
    }

    res.json({ success: true, data: submitted });
  } catch (error) {
    handleError(res, error);
  }
};

// ADMIN: approve, reject, request changes, or suspend
const setBusinessStatus = async (req, res) => {
  try {
    if (!isAdmin(req)) throw fail(403, "Admin access required.");

    const { status, review_notes } = req.body;

    if (
      ["needs_changes", "rejected", "suspended"].includes(status) &&
      !String(review_notes || "").trim()
    ) {
      throw fail(400, "Please include a note explaining this decision.");
    }

    const business = await businessService.setBusinessStatus(
      req.params.id,
      status,
      review_notes || null
    );

    if (!business) throw fail(404, "Business not found");

    res.json({ success: true, data: business });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete business: owner or admin only
const deleteBusiness = async (req, res) => {
  try {
    await loadOwnedBusiness(req);

    await businessService.deleteBusiness(req.params.id);

    res.json({ success: true, message: "Business deleted" });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createBusiness,
  getAllBusinesses,
  adminGetAllBusinesses,
  getBusinessById,
  getMyBusiness,
  updateBusiness,
  submitForReview,
  setBusinessStatus,
  deleteBusiness,
};