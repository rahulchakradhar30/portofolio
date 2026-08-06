import { type NextRequest } from 'next/server';
import { getClientIp, asyncEnforceAdminRateLimit } from './rateLimit';

export { getClientIp };

export async function enforceDbRateLimit(options: {
  scope: string;
  subject: string;
  limit: number;
  windowMs: number;
}) {
  const dummyHeaders = new Headers();
  dummyHeaders.set('x-forwarded-for', options.subject);
  
  const dummyRequest = {
    headers: dummyHeaders,
    nextUrl: { origin: 'http://localhost' },
  } as unknown as NextRequest;

  const result = await asyncEnforceAdminRateLimit({
    request: dummyRequest,
    scope: options.scope,
    max: options.limit,
    windowMs: options.windowMs,
  });

  return { allowed: result.ok };
}
