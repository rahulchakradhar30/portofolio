import { type NextRequest } from 'next/server';
import { getAdminDb } from './firebaseAdmin';
import { getClientIp } from './rateLimit';

export async function logAdminAudit(options: {
  request: NextRequest;
  email: string;
  action: string;
  status?: 'success' | 'failed';
  details?: Record<string, unknown>;
}) {
  const { request, email, action, status = 'success', details = {} } = options;

  try {
    const db = getAdminDb();
    const now = new Date().toISOString();
    const path = request.nextUrl.pathname;

    await db.collection('admin_activity_logs').add({
      email,
      action,
      status,
      path,
      method: request.method,
      ip: getClientIp(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      details,
      timestamp: now,
      created_at: now,
      updated_at: now,
    });
  } catch (error) {
    console.error('Failed to write admin audit log:', error);
  }
}
