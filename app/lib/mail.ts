import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function getMailTransporter() {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('Nodemailer configuration missing EMAIL_USER or EMAIL_PASS in environment.');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
}

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendMail({ to, subject, text, html }: SendMailOptions) {
  const mailTransporter = getMailTransporter();
  if (!mailTransporter) {
    throw new Error('SMTP Mail Transporter is not configured. Define EMAIL_USER and EMAIL_PASS in .env.local.');
  }

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await mailTransporter.sendMail(mailOptions);
  
  // Return messageId without surrounding brackets
  const cleanId = String(info.messageId || '').replace(/[<>]/g, '');
  return { id: cleanId || `msg_${Date.now()}` };
}
