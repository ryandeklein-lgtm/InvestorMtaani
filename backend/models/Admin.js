const pool = require("../config/db");

/** Persisted platform-administrator identity, linked to shared login credentials. */
class Admin {
  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT a.id, a.user_id, a.display_name, a.status,
              a.created_at, a.updated_at, u.name, u.email
       FROM admins a
       JOIN users u ON u.id = a.user_id
       WHERE a.user_id = $1`,
      [userId]
    );

    return result.rows[0] || null;
  }
}

module.exports = Admin;
