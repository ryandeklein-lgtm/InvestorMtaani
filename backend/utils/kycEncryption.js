const crypto = require("crypto");

const getKey = () => {
  const value = process.env.KYC_ENCRYPTION_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(value)) {
    const error = new Error("Secure KYC storage is not configured.");
    error.status = 503;
    throw error;
  }
  return Buffer.from(value, "hex");
};

const encrypt = (input) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(Buffer.isBuffer(input) ? input : Buffer.from(String(input), "utf8")),
    cipher.final(),
  ]);
  return { ciphertext, iv, authTag: cipher.getAuthTag() };
};

const decrypt = ({ ciphertext, iv, authTag }) => {
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
};

module.exports = { encrypt, decrypt };
