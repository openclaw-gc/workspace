const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sendEmail() {
  // Load credentials
  const envPath = '/data/.openclaw/workspace/.env.gale';
  const envContent = fs.readFileSync(envPath, 'utf8');
  const appPassword = envContent.match(/GMAIL_APP_PASSWORD=(.+)/)[1].trim();
  
  // Read email body
  const draftPath = '/data/.openclaw/workspace/drafts/nadia-suv-analysis-draft.md';
  let emailBody = fs.readFileSync(draftPath, 'utf8');
  
  // Remove the header section (everything before first "---")
  const sections = emailBody.split('---');
  emailBody = sections.slice(2).join('---').trim();
  
  // Convert markdown to plain text (basic conversion)
  emailBody = emailBody
    .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1'); // Remove code ticks
  
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'gale.boetticher.ai@gmail.com',
      pass: appPassword
    }
  });
  
  const mailOptions = {
    from: '"Gale (for GC)" <gale.boetticher.ai@gmail.com>',
    to: 'n.randello@easygo.io, nadia.randello@gmail.com',
    subject: 'Family SUV Deep Dive: Tesla vs Luxury Rivals (+ Novated Lease Game-Changer)',
    text: emailBody
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('To:', mailOptions.to);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
}

sendEmail();
