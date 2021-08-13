const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_GMAIL,
    pass: process.env.GMAIL_PASSWORD
  }
});

const sendChangePasswordEmail = (email, token) => {
  const mailOptions = {
    from: process.env.SENDER_GMAIL,
    to: email,
    subject: "Reset your password",
    text: "Plaintext version of the message",
    html: `<p>HTML version of the message please open this url ${process.env.BASE_URL}reset_password/${token}</p>`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = {
  sendChangePasswordEmail
};
