#!/usr/bin/env node
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gale.boetticher.ai@gmail.com',
    pass: 'vmzzfacfdozzmsbl'
  }
});

const mailOptions = {
  from: '"Gale" <gale.boetticher.ai@gmail.com>',
  to: 'nadia.randello@gmail.com',
  subject: 'Re: Quality Control Survey',
  text: 'Audit findings: dinner met specifications, ambiance requires further investigation.\n\nFiled under "complex variables beyond culinary scope."\n\n— Gale',
  inReplyTo: '<CAFsSh6ZhmuV94=LUu7s1eUObCGuy=-Aw=S3uZyaCe_Xw5T4F9A@mail.gmail.com>',
  references: '<CAFsSh6ZhmuV94=LUu7s1eUObCGuy=-Aw=S3uZyaCe_Xw5T4F9A@mail.gmail.com>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
    process.exit(1);
  }
  console.log('✅ Email sent:', info.messageId);
});
