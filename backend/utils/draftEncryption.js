const crypto = require("crypto");

const getKey = (purpose) => {
  const value = process.env.KYC_ENCRYPTION_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    const error = new Error("Secure draft storage is not configured.");
    error.status = 503;
    throw error;
  }

  return Buffer.from(crypto.hkdfSync(
    "sha256",
    Buffer.from(value, "hex"),
    Buffer.from("investor-mtaani-user-drafts-v1"),
    Buffer.from(purpose),
    32
  ));
};

const encrypt = (input, purpose) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(purpose), iv);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(input), "utf8")),
    cipher.final(),
  ]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
};

const decrypt = ({ ciphertext, iv, authTag }, purpose) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(purpose), iv);
  decipher.setAuthTag(authTag);
  return JSON.parse(Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8"));
};

module.exports = { encrypt, decrypt };
