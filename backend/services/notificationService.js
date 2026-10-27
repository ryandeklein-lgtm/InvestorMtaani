const pool = require("../config/db");

const listForUser = async (userId) => {
  const result = await pool.query(
    `SELECT n.id, n.type, n.message, n.action_url,
            (n.read_at IS NOT NULL) AS read, n.created_at
     FROM notifications n
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return result.rows;
};

const unreadCountForUser = async (userId) => {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL",
    [userId]
  );
  return result.rows[0]?.count || 0;
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

const createForUser = async (userId, { type = "system", message, actionUrl = null, actorId = null }) => {
  if (!userId || !message) return;
  await pool.query(
    `INSERT INTO notifications (user_id, type, message, action_url, sender_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, type, message, actionUrl, actorId]
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

module.exports = { listForUser, unreadCountForUser, markRead, markAllRead, createForUser, notifyBusinessOwner };
