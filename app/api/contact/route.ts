import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin, verifyFormHoneypot, hasLikelyBotUserAgent } from '@/app/lib/security';
import { validateEmail, validateRequiredString } from '@/app/lib/validation';

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

    const honeypotError = verifyFormHoneypot(data, 'websiteUrl');
    if (honeypotError) return honeypotError;

    const vFirstName = validateRequiredString(data.firstName, 'First Name', 120);
    const vLastName = validateRequiredString(data.lastName, 'Last Name', 120);
    const vEmail = validateRequiredString(data.email, 'Email', 240);
    const vSubject = validateRequiredString(data.subject, 'Subject', 240);
    const vMessage = validateRequiredString(data.message, 'Message', 4000);

    if (!vFirstName.valid) return NextResponse.json({ error: vFirstName.error }, { status: 400 });
    if (!vLastName.valid) return NextResponse.json({ error: vLastName.error }, { status: 400 });
    if (!vEmail.valid) return NextResponse.json({ error: vEmail.error }, { status: 400 });
    if (!validateEmail(vEmail.value)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    if (!vSubject.valid) return NextResponse.json({ error: vSubject.error }, { status: 400 });
    if (!vMessage.valid) return NextResponse.json({ error: vMessage.error }, { status: 400 });

    const contactMessage = {
      firstName: vFirstName.value,
      lastName: vLastName.value,
      email: vEmail.value,
      subject: vSubject.value,
      message: vMessage.value,
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

