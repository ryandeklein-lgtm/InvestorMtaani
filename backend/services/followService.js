const pool = require("../config/db");
const notificationService = require("./notificationService");

const listForUser = async (userId) => {
  const result = await pool.query(
    "SELECT business_id FROM business_follows WHERE follower_user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows.map((row) => String(row.business_id));
};

const followBusiness = async (userId, businessId) => {
  const businessResult = await pool.query(
    "SELECT id, user_id, business_name FROM businesses WHERE id = $1 AND status = 'approved'",
    [businessId]
  );
  const business = businessResult.rows[0];
  if (!business) return { found: false, followed: false };
  if (String(business.user_id) === String(userId)) {
    return { found: true, followed: false, selfFollow: true };
  }

  const result = await pool.query(
    `INSERT INTO business_follows (follower_user_id, business_id)
     VALUES ($1, $2)
     ON CONFLICT (follower_user_id, business_id) DO NOTHING
     RETURNING business_id`,
    [userId, businessId]
  );
  const created = result.rowCount > 0;

  if (created) {
    try {
      await notificationService.createForUser(business.user_id, {
        type: "business_follow",
        message: `Someone started following ${business.business_name}.`,
        actionUrl: "/business-profile",
        actorId: userId,
      });
    } catch (error) {
      // The follow is durable even if notification delivery has a transient failure.
      console.error("Could not create business follow notification:", error);
    }
  }

  return { found: true, followed: true, created };
};

const unfollowBusiness = async (userId, businessId) => {
  const result = await pool.query(
    "DELETE FROM business_follows WHERE follower_user_id = $1 AND business_id = $2",
    [userId, businessId]
  );
  return result.rowCount > 0;
};

module.exports = { listForUser, followBusiness, unfollowBusiness };
