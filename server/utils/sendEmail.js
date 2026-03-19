const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Cấu hình transporter (Sử dụng Gmail)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Email của bạn (VD: petcare.shop@gmail.com)
      pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password) của Gmail
    },
  });

  // 2. Nội dung email
  const mailOptions = {
    from: '"PetCare E-commerce" <noreply@petcare.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Gửi email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;