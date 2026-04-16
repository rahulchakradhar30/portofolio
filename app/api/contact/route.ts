import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin, verifyFormHoneypot, hasLikelyBotUserAgent, textTooLong } from '@/app/lib/security';

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const limit = enforceRateLimit({
      request,
      scope: 'public-contact',
      max: 6,
      windowMs: 60_000,
    });
    if (!limit.ok) return limit.response;

    if (hasLikelyBotUserAgent(request)) {
      return NextResponse.json({ error: 'Automated traffic blocked' }, { status: 403 });
    }

    const data = await request.json();
    const { firstName, lastName, email, subject, message } = data;

    const honeypotError = verifyFormHoneypot(data, 'websiteUrl');
    if (honeypotError) return honeypotError;

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (
      textTooLong(firstName, 120) ||
      textTooLong(lastName, 120) ||
      textTooLong(email, 240) ||
      textTooLong(subject, 240) ||
      textTooLong(message, 4000)
    ) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    const contactMessage = {
      firstName,
      lastName,
      email,
      subject,
      message,
      read: false,
    };

    const savedMessage = await serverFirebaseHelpers.createContactMessage(contactMessage);

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully! I will get back to you soon.',
        data: savedMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
