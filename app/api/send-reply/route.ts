import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { verifyAdminSession } from '@/app/lib/adminAuthHmac';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { sendMail } from '@/app/lib/mail';
import { getClientIp, enforceDbRateLimit } from '@/app/lib/dbRateLimit';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

// Helper to escape HTML characters for safe email template injection
function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: NextRequest) {
  try {
    // 1. Dual-Layer Admin Session Authorization
    let adminEmail: string | null = null;

    const authResult = await assertAdminSession(request);
    if (authResult.ok && authResult.decoded.email) {
      adminEmail = authResult.decoded.email;
    } else {
      const hmacToken = request.cookies.get('admin-session')?.value || request.cookies.get('adminSession')?.value;
      const hmacEmail = verifyAdminSession(hmacToken);
      if (hmacEmail) {
        adminEmail = hmacEmail;
      }
    }

    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized access. Please log in as admin.' }, { status: 401 });
    }

    // 2. Rate limiting for reply sending
    const replyLimit = await enforceDbRateLimit({
      scope: 'admin-send-reply',
      subject: adminEmail,
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!replyLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute before sending another reply.' }, { status: 429 });
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { ticketId, requestId, requestType, replyContent, attachments } = payload;
    const targetId = ticketId || requestId;

    if (!targetId || !replyContent || typeof replyContent !== 'string' || !replyContent.trim()) {
      return NextResponse.json({ error: 'Target request ID and non-empty replyContent are required' }, { status: 400 });
    }

    const trimmedContent = replyContent.trim();
    const db = getAdminDb();

    // 3. Document Lookup Strategy
    let ticketRef: admin.firestore.DocumentReference | null = null;
    let ticketSnap: admin.firestore.DocumentSnapshot | null = null;
    let resolvedType: 'contact' | 'hire' = requestType === 'hire' ? 'hire' : 'contact';

    if (requestType === 'hire') {
      ticketRef = db.collection('hire_requests').doc(targetId);
      ticketSnap = await ticketRef.get();
    } else if (requestType === 'contact') {
      ticketRef = db.collection('contact_messages').doc(targetId);
      ticketSnap = await ticketRef.get();
      if (!ticketSnap.exists) {
        ticketRef = db.collection('contacts').doc(targetId);
        ticketSnap = await ticketRef.get();
      }
    } else {
      // Auto-detect if requestType not explicitly sent
      ticketRef = db.collection('contact_messages').doc(targetId);
      ticketSnap = await ticketRef.get();
      if (ticketSnap.exists) {
        resolvedType = 'contact';
      } else {
        ticketRef = db.collection('hire_requests').doc(targetId);
        ticketSnap = await ticketRef.get();
        if (ticketSnap.exists) {
          resolvedType = 'hire';
        } else {
          ticketRef = db.collection('contacts').doc(targetId);
          ticketSnap = await ticketRef.get();
          if (ticketSnap.exists) {
            resolvedType = 'contact';
          }
        }
      }
    }

    if (!ticketSnap || !ticketSnap.exists || !ticketRef) {
      return NextResponse.json({ error: 'Target request not found in database' }, { status: 404 });
    }

    const ticketData = ticketSnap.data();
    if (!ticketData || !ticketData.email) {
      return NextResponse.json({ error: 'Target request missing customer email' }, { status: 400 });
    }

    const userEmail = ticketData.email;
    let recipientName = 'Valued Customer';
    let emailSubject = 'Re: Response from Portfolio';
    let originalContextText = '';
    let originalContextHtml = '';

    if (resolvedType === 'hire') {
      recipientName = ticketData.fullName || 'Valued Applicant';
      emailSubject = `Re: Hiring Request — ${ticketData.projectType || 'Project Inquiry'}`;
      const origDesc = ticketData.description || '';
      originalContextText = [
        `Original Hiring Inquiry:`,
        `Company: ${ticketData.companyName || 'N/A'}`,
        `Project Type: ${ticketData.projectType || 'N/A'}`,
        `Role: ${ticketData.role || 'N/A'}`,
        `Budget: ${ticketData.budget || 'N/A'}`,
        `Timeline: ${ticketData.timeline || 'N/A'}`,
        `Description: ${origDesc}`
      ].join('\n');

      originalContextHtml = `
        <div style="font-size: 13px; color: #555; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 6px 0; font-weight: 600;">Original Hiring Inquiry:</p>
          <p style="margin: 2px 0;"><strong>Company:</strong> ${escapeHtml(ticketData.companyName || 'N/A')}</p>
          <p style="margin: 2px 0;"><strong>Project Type:</strong> ${escapeHtml(ticketData.projectType || 'N/A')}</p>
          <p style="margin: 2px 0;"><strong>Budget:</strong> ${escapeHtml(ticketData.budget || 'N/A')} | <strong>Timeline:</strong> ${escapeHtml(ticketData.timeline || 'N/A')}</p>
          <p style="margin: 6px 0 0 0; white-space: pre-wrap;">${escapeHtml(origDesc)}</p>
        </div>
      `;
    } else {
      recipientName = ticketData.name || `${ticketData.firstName || ''} ${ticketData.lastName || ''}`.trim() || 'Valued User';
      emailSubject = `Re: ${ticketData.subject || 'Contact Request Inquiry'}`;
      const origMsg = ticketData.message || '';
      originalContextText = `Original Message:\n${origMsg}`;
      originalContextHtml = `
        <div style="font-size: 13px; color: #555; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 6px 0; font-weight: 600;">Original Message:</p>
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(origMsg)}</p>
        </div>
      `;
    }

    const safeReplyHtml = escapeHtml(trimmedContent).replace(/\n/g, '<br/>');
    let emailStatus: 'success' | 'failed' = 'success';
    let emailId = `msg_${Date.now()}`;

    // 4. Nodemailer Dispatch
    try {
      const emailRes = await sendMail({
        to: userEmail,
        subject: emailSubject,
        text: `${trimmedContent}\n\n---\n${originalContextText}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 620px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 0;">Hello ${escapeHtml(recipientName)},</p>
            <div style="margin: 18px 0; padding: 16px; border-left: 4px solid #3b82f6; background: #f1f5f9; border-radius: 4px; font-size: 15px;">
              ${safeReplyHtml}
            </div>
            ${attachments && Array.isArray(attachments) && attachments.length > 0 ? `
              <div style="margin: 16px 0;">
                <p style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">Attachments:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
                  ${attachments.map((file: any) => `<li><a href="${escapeHtml(file.url)}" target="_blank" style="color: #2563eb;">${escapeHtml(file.name)}</a></li>`).join('')}
                </ul>
              </div>
            ` : ''}
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            ${originalContextHtml}
            <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; text-align: center;">
              Sent securely via Admin Communication Hub — Portfolio System
            </p>
          </div>
        `,
      });
      emailId = emailRes.id;
    } catch (mailError) {
      console.error('SMTP email dispatch failed:', mailError);
      emailStatus = 'failed';
    }

    // 5. Database Logging & Reply Snapshot
    const replySnapshot = {
      id: crypto.randomUUID ? crypto.randomUUID() : `reply_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      emailId,
      content: trimmedContent,
      repliedBy: adminEmail,
      repliedAt: new Date().toISOString(),
      emailStatus,
      attachments: attachments || [],
    };

    const nowIso = new Date().toISOString();
    const docUpdates: Record<string, any> = {
      replied: true,
      messageStatus: emailStatus === 'success' ? 'Replied' : 'Reply Failed',
      read: true,
      updated_at: nowIso,
      updatedAt: nowIso,
      replies: admin.firestore.FieldValue.arrayUnion(replySnapshot),
    };

    if (resolvedType === 'hire' && (!ticketData.status || ticketData.status === 'new')) {
      docUpdates.status = 'contacted';
    }

    await ticketRef.update(docUpdates);

    // 6. Audit Logging
    await logAdminAudit({
      request,
      email: adminEmail,
      action: `${resolvedType}.reply_sent`,
      status: emailStatus === 'success' ? 'success' : 'failed',
      details: {
        requestId: targetId,
        requestType: resolvedType,
        recipient: userEmail,
        emailStatus,
      },
    });

    return NextResponse.json({
      success: true,
      emailStatus,
      message: emailStatus === 'success' ? 'Reply sent and logged successfully.' : 'Reply saved to database, but SMTP email dispatch failed.',
      reply: replySnapshot,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in send-reply route:', error);
    return NextResponse.json({ error: error.message || 'Internal server error processing reply' }, { status: 500 });
  }
}
