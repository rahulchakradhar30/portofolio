import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: string = 'Email Verification'
): Promise<boolean> {
  try {
    const subjectMap: { [key: string]: string } = {
      'Email Verification': 'Portfolio Admin - Email Verification OTP',
      'Password Reset': 'Portfolio Admin - Password Reset OTP',
    };

    const titleMap: { [key: string]: string } = {
      'Email Verification': 'Email Verification',
      'Password Reset': 'Password Reset',
    };

    const descriptionMap: { [key: string]: string } = {
      'Email Verification':
        'Use the code below to verify your email address for the Portfolio Admin Dashboard:',
      'Password Reset':
        'Use the code below to reset your portfolio admin password. This code expires in 10 minutes.',
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?email=${encodeURIComponent(email)}`;

    let emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${titleMap[type] || titleMap['Email Verification']}</h2>
          <p style="color: #666; font-size: 16px;">
            ${descriptionMap[type] || descriptionMap['Email Verification']}
          </p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 36px; font-weight: bold; color: #7c3aed; letter-spacing: 5px; margin: 0;">
              ${otp}
            </p>
          </div>`;

    if (type === 'Password Reset') {
      emailHtml += `
          <p style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </p>`;
    }

    emailHtml += `
          <p style="color: #999; font-size: 14px;">
            This code expires in 10 minutes. If you didn't request this, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2024 Portfolio Admin. All rights reserved.
          </p>
        </div>
      `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: subjectMap[type] || subjectMap['Email Verification'],
      html: emailHtml,
    });
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Welcome to Portfolio Admin Dashboard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome, ${name}!</h2>
          <p style="color: #666; font-size: 16px;">
            Your admin account has been successfully created. You can now manage your portfolio.
          </p>
          <p style="color: #666; font-size: 16px;">
            Here are the things you can do:
          </p>
          <ul style="color: #666; font-size: 16px;">
            <li>Manage your portfolio content</li>
            <li>Add/edit/delete projects</li>
            <li>Update your skills</li>
            <li>View contact messages</li>
            <li>Upload project images</li>
            <li>Enable advanced security with 2FA</li>
          </ul>
          <p style="color: #666; font-size: 16px; margin-top: 20px;">
            <a href="https://yourportfolio.com/admin/dashboard" style="color: #7c3aed; text-decoration: none;">
              Go to Admin Dashboard →
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2024 Portfolio Admin. All rights reserved.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

export async function send2FASetupEmail(email: string, backupCodes: string[]): Promise<boolean> {
  try {
    await resend.emails.send({
      from: 'noreply@yourdomain.com',
      to: email,
      subject: 'Two-Factor Authentication Enabled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Two-Factor Authentication Enabled ✓</h2>
          <p style="color: #666; font-size: 16px;">
            Your account is now protected with Google Authenticator (2FA).
          </p>
          <p style="color: #666; font-size: 16px; margin-top: 20px;">
            <strong>Keep these backup codes in a safe place:</strong>
          </p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="font-family: monospace; font-size: 14px; margin: 5px 0;">
              ${backupCodes.join('<br />')}
            </p>
          </div>
          <p style="color: #999; font-size: 12px;">
            Use these codes if you lose access to your authenticator.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            © 2024 Portfolio Admin. All rights reserved.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send 2FA email:', error);
    return false;
  }
}
