import { type NextRequest, NextResponse } from 'next/server';

export function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const requestOrigin = request.nextUrl.origin;
  if (origin === requestOrigin) return true;

  const configured = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return configured.includes(origin);
}

export function rejectDisallowedOrigin(request: NextRequest) {
  if (isAllowedOrigin(request)) return null;
  return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
}

export function hasLikelyBotUserAgent(request: NextRequest) {
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  if (!userAgent) return true;

  const suspicious = [
    'python-requests',
    'curl/',
    'wget/',
    'httpclient',
    'scrapy',
    'crawler',
    'spider',
  ];

  return suspicious.some((token) => userAgent.includes(token));
}

export function verifyFormHoneypot(body: Record<string, unknown>, honeypotField: string) {
  const value = body[honeypotField];
  if (typeof value === 'string' && value.trim().length > 0) {
    return NextResponse.json({ error: 'Bot submission blocked' }, { status: 400 });
  }
  return null;
}

export function textTooLong(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return false;
  return value.length > maxLength;
}
