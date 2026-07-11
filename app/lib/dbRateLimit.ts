import crypto from 'crypto';
import { getAdminDb } from './firebaseAdmin';

function hashKey(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function getClientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const realIp = req.headers.get('x-real-ip') || '';
  const fromForwarded = forwarded.split(',')[0]?.trim();
  return fromForwarded || realIp || 'unknown';
}

interface EnforceDbRateLimitOptions {
  scope: string;
  subject: string;
  limit: number;
  windowMs: number;
}

export async function enforceDbRateLimit({ scope, subject, limit, windowMs }: EnforceDbRateLimitOptions) {
  const now = Date.now();
  const id = hashKey(`${scope}:${subject}`);

  const db = getAdminDb();
  const ref = db.collection('rate_limits').doc(id);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    if (!snap.exists) {
      tx.set(ref, {
        scope,
        subject,
        count: 1,
        windowStartedAt: now,
        updatedAt: now,
      });
      return { allowed: true, retryAfterMs: 0 };
    }

    const data = snap.data();
    if (!data) {
      return { allowed: true, retryAfterMs: 0 };
    }
    const started = Number(data.windowStartedAt || now);
    const elapsed = now - started;

    if (elapsed >= windowMs) {
      tx.update(ref, {
        count: 1,
        windowStartedAt: now,
        updatedAt: now,
      });
      return { allowed: true, retryAfterMs: 0 };
    }

    const nextCount = Number(data.count || 0) + 1;
    if (nextCount > limit) {
      const retryAfterMs = Math.max(0, windowMs - elapsed);
      return { allowed: false, retryAfterMs };
    }

    tx.update(ref, {
      count: nextCount,
      updatedAt: now,
    });

    return { allowed: true, retryAfterMs: 0 };
  });

  return result;
}
