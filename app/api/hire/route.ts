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
      scope: 'public-hire',
      max: 5,
      windowMs: 60_000,
    });
    if (!limit.ok) return limit.response;

    if (hasLikelyBotUserAgent(request)) {
      return NextResponse.json({ error: 'Automated traffic blocked' }, { status: 403 });
    }

    const data = await request.json();
    const {
      fullName,
      companyName,
      email,
      phone,
      website,
      projectType,
      role,
      budget,
      timeline,
      description,
      preferredContact,
    } = data;

    const honeypotError = verifyFormHoneypot(data, 'companyWebsiteMirror');
    if (honeypotError) return honeypotError;

    if (!fullName || !email || !projectType || !description) {
      return NextResponse.json(
        { error: 'Full name, email, project type, and description are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (
      textTooLong(fullName, 140) ||
      textTooLong(companyName, 240) ||
      textTooLong(email, 240) ||
      textTooLong(phone, 80) ||
      textTooLong(website, 320) ||
      textTooLong(projectType, 120) ||
      textTooLong(role, 120) ||
      textTooLong(budget, 120) ||
      textTooLong(timeline, 120) ||
      textTooLong(description, 6000) ||
      textTooLong(preferredContact, 40)
    ) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    const hireRequest = {
      fullName,
      companyName: companyName || '',
      email,
      phone: phone || '',
      website: website || '',
      projectType,
      role: role || '',
      budget: budget || '',
      timeline: timeline || '',
      description,
      preferredContact: preferredContact || 'email',
    };

    const savedRequest = await serverFirebaseHelpers.createHireRequest(hireRequest);

    return NextResponse.json(
      {
        success: true,
        message: 'Your hiring request has been sent successfully. I will get back to you soon.',
        data: savedRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Hire form error:', error);
    return NextResponse.json(
      { error: 'Failed to process your hiring request. Please try again later.' },
      { status: 500 }
    );
  }
}
