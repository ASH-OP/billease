// utils/emailUtils.js
const nodemailer = require('nodemailer');

// Create reusable transporter using Gmail app password from .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a branded OTP email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp     - Plain-text 6-digit OTP
 * @param {string} name    - User's name for personalisation
 */
const sendOtpEmail = async (toEmail, otp, name = 'there') => {
    const mailOptions = {
        from: `"BillEase" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: '🔐 Your BillEase Verification Code',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BillEase OTP</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e1206 0%,#7c3106 50%,#ea580c 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                Bill<span style="color:#fb923c;">Ease</span>
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Smart Bill Management</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;color:#374151;font-size:15px;">Hey <strong>${name}</strong>,</p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                Use the verification code below to complete your BillEase account registration.
                This code is valid for <strong>5 minutes</strong>.
              </p>

              <!-- OTP BOX -->
              <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid #fed7aa;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#9a3412;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">Your Verification Code</p>
                <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:10px;color:#ea580c;font-family:'Courier New',monospace;">${otp}</p>
              </div>

              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;text-align:center;">
                Do not share this code with anyone.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                © ${new Date().getFullYear()} BillEase · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
