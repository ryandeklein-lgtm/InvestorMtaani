const pool = require("../config/db");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const genericContact = /(?:[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|https?:\/\/|www\.|@[A-Za-z0-9_.]{3,}|(?:\+|00)\d{1,3}[\s().-]?(?:\d[\s().-]?){7,13}|(?<!\d)0\d{2,3}[\s().-]?\d{3}[\s().-]?\d{3,4}(?!\d)|(?<!\d)7\d{8}(?!\d)|(?<![\d,])\d{7,8}(?![\d,])|\b(?:0?[1-9]|[12]\d|3[01])[./-](?:0?[1-9]|1[0-2])[./-](?:19|20)\d{2}\b|\b(?:reach\s+me|contact\s+me|my\s+(?:name|number|email|address)\s+is|i\s+live\s+at)\b\s*[:#-]?\s*[^,;\n]{3,}|\b(?:bank\s+account|account(?:\s*(?:number|no\.?))?|iban|swift|paybill|till|m-?pesa)\b\s*[:#-]?\s*[A-Z0-9][A-Z0-9 -]{5,}|\b(?:national\s*(?:id|identity)(?:\s*(?:number|no\.?))?|id\s*(?:number|no\.?)|passport(?:\s*(?:number|no\.?))?|kra\s*pin|tax\s*pin)\b\s*[:#-]?\s*[A-Z0-9][A-Z0-9/-]{4,}|\b(?:date\s+of\s+birth|dob|home\s+address|residential\s+address|postal\s+address)\b\s*[:#-]?\s*[^,;\n]{4,})/i;

const getDirectIdentityTerms = async (userIds) => {
  const normalizedIds = [...new Set((Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean).map(String))];
  if (!normalizedIds.length) return [];
  const result = await pool.query(
    `SELECT u.name, u.email, u.phone, b.business_name, i.display_name
       FROM users u
       LEFT JOIN businesses b ON b.user_id = u.id
       LEFT JOIN investors i ON i.user_id = u.id
      WHERE u.id = ANY($1::bigint[])`,
    [normalizedIds]
  );
  return result.rows.flatMap((identity) => [identity.name, identity.email, identity.phone, identity.business_name, identity.display_name])
    .filter((term) => typeof term === "string" && term.trim().length >= 4)
    .map((term) => term.trim());
};

const isDirectIdentitySafe = (value, terms = []) => {
  const text = String(value || "");
  if (genericContact.test(text)) return false;
  return !terms.some((term) => {
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}($|[^\\p{L}\\p{N}])`, "iu");
    return pattern.test(text);
  });
};

const assertNoDirectIdentity = async (userIds, value) =>
  isDirectIdentitySafe(value, await getDirectIdentityTerms(userIds));

module.exports = { assertNoDirectIdentity, getDirectIdentityTerms, isDirectIdentitySafe };
