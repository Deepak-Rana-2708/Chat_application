const smtpEmails = require("../Controller/EmailController");
const { encryptData } = require("../EncryptDcrypt/encryptdecrypt");
const dotenv = require("dotenv");
dotenv.config();
const EmailVerification = async (options) => {
  const encryptedDataObj = encryptData({
    id: options.id,
    email: options.email,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });
  const queryParam = encodeURIComponent(JSON.stringify(encryptedDataObj));
  let message = `
  <div style="background:#f4f6fb;padding:40px 0;font-family:Arial,sans-serif">

    <div style="max-width:600px;margin:auto;background:#ffffff;padding:40px;border-radius:8px;text-align:center">

      <h2 style="color:#333;margin-bottom:10px">Verify Your Email</h2>

      <p style="color:#555;font-size:16px">
        Thank you for signing up. Please verify your email address by clicking the button below.
      </p>

      <a href="${process.env.Backend_URI}/api/v1/user/verify-email?data=${queryParam}"
      style="display:inline-block;margin-top:25px;padding:12px 30px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px">

      Verify Email

      </a>

      <p style="margin-top:30px;font-size:14px;color:#777">
        This verification link will expire in 24 hours.
      </p>
      <p style="color:#888;font-size:12px;margin-top:30px;text-align:center">
        © 2026 Micro Tech. This email and its contents are intended only for the recipient. 
        If you received this email by mistake, please ignore it. All rights reserved.
      </p>
    </div>

  </div>
  `;

  await smtpEmails(options.email, "Email Verification", message);
};

const InviteEmail = async (options) => {
  const encryptedIdObj = encryptData({ id: options.id });

  const queryParam = encodeURIComponent(JSON.stringify(encryptedIdObj));

  let message = `
  <div style="background:#f4f6fb;padding:40px 0;font-family:Arial,sans-serif">

    <div style="max-width:600px;margin:auto;background:#ffffff;padding:40px;border-radius:8px;text-align:center">

      <h2 style="color:#333;margin-bottom:10px">You're Invited 🎉</h2>

      <p style="color:#555;font-size:16px">
        You have been invited to join our platform.
        Click the button below to create your account and get started.
      </p>

      <a href="${process.env.Frontend_URI}/signup?id=${queryParam}"
      style="display:inline-block;margin-top:25px;padding:12px 30px;background:#10b981;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px">

      Accept Invitation

      </a>
        <p style="color:#888;font-size:12px;margin-top:30px;text-align:center">
            © 2026 Micro Tech. This email and its contents are intended only for the recipient. 
            If you received this email by mistake, please ignore it. All rights reserved.
        </p>
    </div>

  </div>
  `;

  await smtpEmails(options.email, "Invitation to Join", message);
};

const OTPEmail = async (options) => {
  let message = `
  <div style="background:#f4f6fb;padding:40px 0;font-family:Arial,sans-serif">

    <div style="max-width:600px;margin:auto;background:#ffffff;padding:40px;border-radius:8px;text-align:center">

      <h2 style="color:#333;margin-bottom:10px">Reset Your Password 🔒</h2>

      <p style="color:#555;font-size:16px">
        We received a request to reset your password.
        Use the OTP below to verify your identity and proceed.
      </p>

      <div style="display:inline-block;margin-top:25px;padding:15px 25px;background:#6366f1;color:#ffffff;font-size:20px;font-weight:bold;border-radius:6px;letter-spacing:3px">
        ${options.otp}
      </div>

      <p style="color:#888;font-size:14px;margin-top:20px">
        This OTP will expire in <strong>5 minutes</strong>.
      </p>

      <p style="color:#888;font-size:12px;margin-top:30px;text-align:center">
  © 2026 Micro Tech. This email and its contents are intended only for the recipient. 
  If you received this email by mistake, please ignore it. All rights reserved.
</p>

    </div>

  </div>
  `;

  await smtpEmails(options.email, "Password Reset OTP", message);
};
module.exports = { EmailVerification, InviteEmail, OTPEmail };
