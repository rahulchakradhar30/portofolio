import { type NextRequest, NextResponse } from 'next/server';

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
