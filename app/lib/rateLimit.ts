import { type NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from './firebaseAdmin';

type Bucket = {
  count: number;
  resetAt: number;
};

const BUCKETS = new Map<string, Bucket>();

function nowMs() {
  return Date.now();
}

function cleanupExpiredBuckets(currentTime: number) {
  if (BUCKETS.size < 5000) return;
  for (const [key, bucket] of BUCKETS.entries()) {
    if (bucket.resetAt <= currentTime) {
      BUCKETS.delete(key);
    }
  }
}

export function getClientIp(request: NextRequest) {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  return realIp || 'unknown';
}

export function getRateLimitKey(request: NextRequest, scope: string) {
  const ip = getClientIp(request);
  const ua = request.headers.get('user-agent') || 'unknown-ua';
  return `${scope}:${ip}:${ua.slice(0, 80)}`;
}

// Synchronous in-memory rate limit for public routes
export function enforceRateLimit(options: {
  request: NextRequest;
  scope: string;
  max: number;
  windowMs: number;
}) {
  const { request, scope, max, windowMs } = options;
  const currentTime = nowMs();
  cleanupExpiredBuckets(currentTime);

  const key = getRateLimitKey(request, scope);
  const existing = BUCKETS.get(key);

  if (!existing || existing.resetAt <= currentTime) {
    BUCKETS.set(key, { count: 1, resetAt: currentTime + windowMs });
    return { ok: true as const };
  }

  if (existing.count >= max) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - currentTime) / 1000);
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: 'Too many requests. Please slow down and try again.',
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
          },
        }
      ),
    };
  }

  existing.count += 1;
  BUCKETS.set(key, existing);
  return { ok: true as const };
}

// Async Firestore-backed rate limit for cross-instance consistency on sensitive routes
export async function asyncEnforceAdminRateLimit(options: {
  request: NextRequest;
  scope: string;
  max: number;
  windowMs: number;
}) {
  const { request, scope, max, windowMs } = options;
  
  // First, check in-memory (fast fail)
  const memLimit = enforceRateLimit(options);
  if (!memLimit.ok) return memLimit;

  try {
    const db = getAdminDb();
    const key = getRateLimitKey(request, scope);
    // Hash key to ensure it's a valid document ID
    const docId = Buffer.from(key).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    const ref = db.collection('rate_limits').doc(docId);
    
    const now = Date.now();
    
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      
      if (!snap.exists) {
        tx.set(ref, { count: 1, resetAt: now + windowMs });
        return { ok: true };
      }
      
      const data = snap.data();
      if (!data) return { ok: true };
      
      if (data.resetAt <= now) {
        tx.set(ref, { count: 1, resetAt: now + windowMs });
        return { ok: true };
      }
      
      if (data.count >= max) {
        return { ok: false, resetAt: data.resetAt };
      }
      
      tx.update(ref, { count: data.count + 1 });
      return { ok: true };
    });
    
    if (!result.ok) {
      const resetAt = 'resetAt' in result ? (result as { resetAt: number }).resetAt : now;
      const retryAfterSeconds = Math.ceil((resetAt - now) / 1000);
      return {
        ok: false as const,
        response: NextResponse.json(
          {
            error: 'Too many requests. Please slow down and try again.',
            retryAfterSeconds,
          },
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfterSeconds) },
          }
        ),
      };
    }
    
    return { ok: true as const };
  } catch (err) {
    // If Firestore fails (e.g., config error), fallback to just the in-memory limit
    console.error('Firestore rate limit error:', err);
    return { ok: true as const };
  }
}
