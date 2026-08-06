import crypto from 'crypto';

export function hashOtp(email: string, otp: string): string {
  const secret = process.env.OTP_SECRET || process.env.ADMIN_SESSION_SECRET || 'fallback-otp-secret';
  return crypto.createHmac('sha256', secret).update(`${email.toLowerCase().trim()}:${otp.trim()}`).digest('hex');
}

export function signAdminSession(email: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-session-secret';
  const payload = `${email.toLowerCase().trim()}:${Date.now()}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifyAdminSession(token?: string): string | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return null;
    const [email, timestamp, signature] = parts;
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-session-secret';
    const expected = crypto.createHmac('sha256', secret).update(`${email}:${timestamp}`).digest('hex');
    if (signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return email;
    }
  } catch {
    return null;
  }
  return null;
}
