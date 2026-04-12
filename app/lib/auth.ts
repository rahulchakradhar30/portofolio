import crypto from 'crypto';
import * as speakeasy from 'speakeasy';

// Generate secure random string
export function generateSecureString(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash password using SHA-256
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate OTP (6 digits)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calculate OTP expiration (10 minutes from now)
export function getOTPExpiration(): Date {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
}

// Setup Google Authenticator
export interface TwoFASetup {
  secret: string;
  qrCode: string;
}

export function setupGoogleAuthenticator(email: string): TwoFASetup {
  const secret = speakeasy.generateSecret({
    name: `Portfolio Admin (${email})`,
    issuer: 'Portfolio Admin',
    length: 32,
  });

  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url || '',
  };
}

// Verify Google Authenticator code
export function verifyTOTPCode(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time windows for clock skew
  });
}

// Generate JWT token
export function generateJWT(adminId: string, email: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    adminId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  const secret = process.env.ADMIN_JWT_SECRET || 'default-secret-change-me';

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify JWT token
export interface JWTPayload {
  adminId: string;
  email: string;
  iat: number;
  exp: number;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const secret = process.env.ADMIN_JWT_SECRET || 'default-secret-change-me';
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());

    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Rate limiting helper
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore[identifier];

  if (!record || now > record.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitRemaining(identifier: string, maxAttempts: number = 5): number {
  const record = rateLimitStore[identifier];
  if (!record) return maxAttempts;
  return Math.max(0, maxAttempts - record.count);
}
