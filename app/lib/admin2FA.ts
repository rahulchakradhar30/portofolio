import crypto from 'crypto';
import { getAdminDb } from './firebaseAdmin';

export type Active2FAMethod = 'EMAIL_OTP' | 'TOTP' | 'PASSKEY';

export interface PasskeyCredential {
  id: string; // Base64URL credential ID
  publicKey: string; // Base64URL public key
  counter: number;
  deviceType?: string;
  backedUp?: boolean;
  transports?: string[];
  name?: string;
  createdAt: number;
  lastUsedAt: number;
}

export interface TotpConfig {
  enabled: boolean;
  encryptedSecret: string;
  verifiedAt?: number;
}

export interface AdminSecurityDoc {
  active2FAMethod: Active2FAMethod;
  totp?: TotpConfig;
  passkeys?: PasskeyCredential[];
  pendingTotpSecret?: string; // Encrypted unverified secret during TOTP setup
  pendingWebAuthnChallenge?: string; // Challenge for active registration/login
  updatedAt?: number;
}

const COLLECTION_NAME = 'admin_security';

/**
 * Derives a 32-byte encryption key for AES-256-GCM from environment variables
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.ADMIN_2FA_SECRET_KEY || process.env.FIREBASE_PRIVATE_KEY || 'default-fallback-admin-secret-key-32bytes';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypts sensitive string (e.g. TOTP secret) at rest using AES-256-GCM
 */
export function encryptSecret(plainText: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string
 */
export function decryptSecret(encryptedPayload: string): string {
  const key = getEncryptionKey();
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Fetches the Admin security configuration from Firestore, falling back to EMAIL_OTP default
 */
export async function getAdminSecurityDoc(uid: string): Promise<AdminSecurityDoc> {
  try {
    const db = getAdminDb();
    const docRef = db.collection(COLLECTION_NAME).doc(uid);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        active2FAMethod: 'EMAIL_OTP',
      };
    }

    const data = snap.data() as AdminSecurityDoc;
    return {
      active2FAMethod: data.active2FAMethod || 'EMAIL_OTP',
      totp: data.totp,
      passkeys: data.passkeys || [],
      pendingTotpSecret: data.pendingTotpSecret,
      pendingWebAuthnChallenge: data.pendingWebAuthnChallenge,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get Admin security doc:', error);
    return { active2FAMethod: 'EMAIL_OTP' };
  }
}

/**
 * Updates or merges the Admin security configuration in Firestore
 */
export async function saveAdminSecurityDoc(uid: string, updates: Partial<AdminSecurityDoc>): Promise<void> {
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION_NAME).doc(uid);
  
  await docRef.set(
    {
      ...updates,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

/**
 * Returns the currently active 2FA method for the given Admin UID
 */
export async function getActive2FAMethod(uid: string): Promise<Active2FAMethod> {
  const doc = await getAdminSecurityDoc(uid);
  return doc.active2FAMethod || 'EMAIL_OTP';
}
