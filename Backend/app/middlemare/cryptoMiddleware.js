const { decryptData, encryptData } = require("../EncryptDcrypt/encryptdecrypt");

const cryptoMiddleware = (req, res, next) => {
  try {
    const userAgent = req.headers["user-agent"]?.toLowerCase() || "";
    const isApiClient =
      userAgent.includes("postman") || userAgent.includes("curl");

    if (req.body && req.body.data && req.body.iv) {
      req.body = decryptData(req.body);
    }

    if (req.query && req.query.id) {
      const decoded = decodeURIComponent(req.query.id);

      const parsed = JSON.parse(decoded);

      const decrypted = decryptData(parsed);

      req.decryptedQuery = {};
      req.decryptedQuery = decrypted;

      console.log("Decrypted ID:", req.decryptedQuery.id);
    }
    if (req.query && req.query.data) {
      const decoded = decodeURIComponent(req.query.data);

      const parsed = JSON.parse(decoded);

      const decrypted = decryptData(parsed);

      req.decryptedQuery = req.decryptedQuery || {};

      req.decryptedQuery.data = decrypted;

      console.log("Decrypted DATA:", req.decryptedQuery.data);
    }

    const originalJson = res.json;

    res.json = function (body) {
      if (isApiClient) {
        return originalJson.call(this, body);
      }

      const encrypted = encryptData(body);
      return originalJson.call(this, encrypted);
    };

    next();
  } catch (err) {
    console.error("Crypto Middleware Error:", err);
    res.status(500).json({ message: "Encryption/Decryption Error" });
  }
};

module.exports = cryptoMiddleware;
