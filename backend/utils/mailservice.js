const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env

// Set up a Nodemailer transporter with Gmail SMTP service credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Use Gmail SMTP host from env
  port: process.env.SMTP_PORT || 587, // Use SMTP port from env (587 is typically for STARTTLS)
  secure: false, // Use STARTTLS, not SSL (so set secure to false)
  auth: {
    user: process.env.EMAIL_USER, // Gmail email from env variable
    pass: process.env.EMAIL_PASS,  // Gmail app password from env variable
  },
});

async function sendOTPEmail(email, otp, subject = 'Your OTP Code') {

    console.log(email,otp);
  const mailOptions = {
    from: process.env.EMAIL_USER, // Use the email from env variable
    to: email,
    subject: subject,
    html: typeof otp === 'string' && otp.includes('<') ? otp : `<p>Your OTP code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };
