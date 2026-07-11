import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { verifyAdminSession } from '@/app/lib/adminAuthHmac';
import { sendMail } from '@/app/lib/mail';
import { getClientIp, enforceDbRateLimit } from '@/app/lib/dbRateLimit';
import * as admin from 'firebase-admin';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // 1. Session Authorization
    const sessionToken = request.cookies.get('admin-session')?.value;
    const adminEmail = verifyAdminSession(sessionToken);
    if (!adminEmail) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    // Rate limiting for reply sending
    const clientIp = getClientIp(request);
    const replyLimit = await enforceDbRateLimit({
      scope: 'admin-send-reply',
      subject: adminEmail,
      limit: 10,
      windowMs: 60 * 1000,
    });
    if (!replyLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait a minute.' }, { status: 429 });
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { ticketId, replyContent, attachments } = payload;
    if (!ticketId || !replyContent) {
      return NextResponse.json({ error: 'ticketId and replyContent are required' }, { status: 400 });
    }

    // 2. Retrieve Ticket Context
    const db = getAdminDb();
    
    // Check both collections 'contact_messages' and 'contacts' for maximum compatibility
    let ticketRef = db.collection('contact_messages').doc(ticketId);
    let ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      ticketRef = db.collection('contacts').doc(ticketId);
      ticketSnap = await ticketRef.get();
      if (!ticketSnap.exists) {
        return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 });
      }
    }

    const ticketData = ticketSnap.data();
    if (!ticketData) {
      return NextResponse.json({ error: 'Failed to read ticket data' }, { status: 400 });
    }

    const userEmail = ticketData.email;
    const name = ticketData.name || `${ticketData.firstName || ''} ${ticketData.lastName || ''}`.trim() || 'Valued User';
    const originalMessage = ticketData.message || '';
    const userId = ticketData.userId || null;

    let emailStatus = 'success';
    let emailId = `msg_${Date.now()}`;

    // 3. Mailing
    try {
      const emailRes = await sendMail({
        to: userEmail,
        subject: `Re: ${ticketData.subject || 'Support Ticket Inquiry'}`,
        text: `${replyContent}\n\n---\nOriginal Message from ${name}:\n${originalMessage}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto;">
            <p>Hello ${name},</p>
            <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #8d6b4e; background: #fafafa;">
              ${replyContent.replace(/\n/g, '<br/>')}
            </div>
            ${attachments && attachments.length > 0 ? `
              <p><strong>Attachments:</strong></p>
              <ul>
                ${attachments.map((file: any) => `<li><a href="${file.url}">${file.name}</a></li>`).join('')}
              </ul>
            ` : ''}
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666;">
              <strong>Original Message:</strong><br/>
              ${originalMessage.replace(/\n/g, '<br/>')}
            </p>
          </div>
        `,
      });
      emailId = emailRes.id;
    } catch (mailError) {
      console.error('SMTP mail sending failed, logging as failed in db:', mailError);
      emailStatus = 'failed';
    }

    // 4. Database Logging
    const replySnapshot = {
      id: crypto.randomUUID ? crypto.randomUUID() : `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emailId,
      content: replyContent,
      repliedBy: adminEmail,
      repliedAt: new Date().toISOString(),
      emailStatus,
      attachments: attachments || [],
    };

    // Update fields and push to replies array
    const adminDocUpdates: any = {
      replied: true,
      messageStatus: 'Replied',
      read: true,
      replies: admin.firestore.FieldValue.arrayUnion(replySnapshot)
    };

    await ticketRef.update(adminDocUpdates);

    // 5. In-App Alerts (Write notification if userId exists)
    if (userId) {
      const notificationRef = db.collection('users').doc(userId).collection('notifications').doc();
      await notificationRef.set({
        type: 'support_reply',
        title: 'Reply to your support inquiry',
        message: replyContent.length > 100 ? `${replyContent.slice(0, 100)}...` : replyContent,
        ticketId,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: emailStatus === 'success' ? 'Reply sent and logged successfully' : 'Reply logged in database, but email dispatch failed.',
      reply: replySnapshot
    });
  } catch (error: any) {
    console.error('Error processing reply:', error);
    return NextResponse.json({ error: error.message || 'Failed to process reply' }, { status: 500 });
  }
}
