const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.SECRET_KEY;
const algorithm = process.env.Algorithm;

// Encrypt function
const encryptData = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    data: encrypted,
  };
};

// Decrypt function
const decryptData = ({ iv, data }) => {
  const ivBuffer = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), ivBuffer);
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return JSON.parse(decrypted);
};

module.exports = { encryptData, decryptData };