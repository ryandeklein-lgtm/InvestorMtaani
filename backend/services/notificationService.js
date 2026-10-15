const pool = require("../config/db");

const listForUser = async (userId) => {
  const result = await pool.query(
    `SELECT id, type, message, action_url,
            (read_at IS NOT NULL) AS read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows;
};

const markRead = async (notificationId, userId) => {
  const result = await pool.query(
    `UPDATE notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notificationId, userId]
  );
  return result.rowCount > 0;
};

const markAllRead = async (userId) => {
  const result = await pool.query(
    `UPDATE notifications SET read_at = NOW()
     WHERE user_id = $1 AND read_at IS NULL`,
    [userId]
  );
  return result.rowCount;
};

const createForUser = async (userId, { type = "system", message, actionUrl = null }) => {
  if (!userId || !message) return;
  await pool.query(
    `INSERT INTO notifications (user_id, type, message, action_url)
     VALUES ($1, $2, $3, $4)`,
    [userId, type, message, actionUrl]
  );
};

const notifyBusinessOwner = async (businessId, notification) => {
  const result = await pool.query(
    "SELECT user_id FROM businesses WHERE id = $1",
    [businessId]
  );
  if (result.rows[0]) {
    await createForUser(result.rows[0].user_id, notification);
  }
};

module.exports = { listForUser, markRead, markAllRead, createForUser, notifyBusinessOwner };
