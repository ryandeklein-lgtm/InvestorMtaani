const pool = require("../config/db");
const { encrypt, decrypt } = require("../utils/draftEncryption");

const saveDraft = async (userId, draftType, payload) => {
  const encoded = JSON.stringify(payload);
  if (Buffer.byteLength(encoded, "utf8") > 64 * 1024) {
    throw Object.assign(new Error("Draft is too large to save."), { status: 413 });
  }

  const encrypted = encrypt(payload, draftType);
  const result = await pool.query(
    `INSERT INTO user_drafts
       (user_id, draft_type, payload_ciphertext, payload_iv, payload_auth_tag, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id, draft_type) DO UPDATE SET
       payload_ciphertext = EXCLUDED.payload_ciphertext,
       payload_iv = EXCLUDED.payload_iv,
       payload_auth_tag = EXCLUDED.payload_auth_tag,
       updated_at = NOW()
     RETURNING updated_at`,
    [userId, draftType, encrypted.ciphertext, encrypted.iv, encrypted.authTag]
  );

  return result.rows[0];
};

const getDraft = async (userId, draftType) => {
  const result = await pool.query(
    `SELECT payload_ciphertext, payload_iv, payload_auth_tag, updated_at
     FROM user_drafts WHERE user_id = $1 AND draft_type = $2`,
    [userId, draftType]
  );
  const row = result.rows[0];
  if (!row) return null;

  return {
    payload: decrypt({
      ciphertext: row.payload_ciphertext,
      iv: row.payload_iv,
      authTag: row.payload_auth_tag,
    }, draftType),
    updated_at: row.updated_at,
  };
};

const deleteDraft = async (userId, draftType) => {
  await pool.query(
    "DELETE FROM user_drafts WHERE user_id = $1 AND draft_type = $2",
    [userId, draftType]
  );
};

module.exports = { saveDraft, getDraft, deleteDraft };
