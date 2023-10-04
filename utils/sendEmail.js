const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: "adejumot77@gmail.com", //process.env.FROM_EMAIL,
    pass: "smzwzyoucedpxgcb", // process.env.SMTP_PASS,
  },
});

const sendEmail = async (options, senderName, senderEmail) => {
  const message = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`, // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  });

  console.log("Message sent: %s", message.messageId);
};

module.exports = sendEmail;
