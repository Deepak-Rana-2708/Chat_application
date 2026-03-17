import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
const ALGORITHM = import.meta.env.VITE_Algorithm;

export const encryptData = (data) => {

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Utf8.parse(SECRET_KEY),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    data: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
  };
};

export const decryptData = (encrypted) => {

  const iv = CryptoJS.enc.Hex.parse(encrypted.iv);

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Hex.parse(encrypted.data) },
    CryptoJS.enc.Utf8.parse(SECRET_KEY),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
};