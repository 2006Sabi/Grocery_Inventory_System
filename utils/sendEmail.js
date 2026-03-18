const nodemailer = require('nodemailer');

/**
 * sendEmail - Utility to send emails using Gmail NodeMailer
 * @param {Object} options - { email, subject, message }
 */
const sendEmail = async (options) => {
  try {
    console.log("Sending email to:", options.email);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use Gmail App Password
      },
    });

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Grocery Inventory'}" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    // Return null instead of throwing to prevent application crash
    return null;
  }
};

module.exports = sendEmail;
