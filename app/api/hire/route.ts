import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin, verifyFormHoneypot, hasLikelyBotUserAgent } from '@/app/lib/security';
import { validateEmail, validateRequiredString, validateOptionalString } from '@/app/lib/validation';

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

    const honeypotError = verifyFormHoneypot(data, 'companyWebsiteMirror');
    if (honeypotError) return honeypotError;

    const vFullName = validateRequiredString(data.fullName, 'Full Name', 140);
    const vEmail = validateRequiredString(data.email, 'Email', 240);
    const vProjectType = validateRequiredString(data.projectType, 'Project Type', 120);
    const vDescription = validateRequiredString(data.description, 'Description', 6000);

    const vCompanyName = validateOptionalString(data.companyName, 240);
    const vPhone = validateOptionalString(data.phone, 80);
    const vWebsite = validateOptionalString(data.website, 320);
    const vRole = validateOptionalString(data.role, 120);
    const vBudget = validateOptionalString(data.budget, 120);
    const vTimeline = validateOptionalString(data.timeline, 120);
    const vPreferredContact = validateOptionalString(data.preferredContact, 40);

    if (!vFullName.valid) return NextResponse.json({ error: vFullName.error }, { status: 400 });
    if (!vEmail.valid) return NextResponse.json({ error: vEmail.error }, { status: 400 });
    if (!vProjectType.valid) return NextResponse.json({ error: vProjectType.error }, { status: 400 });
    if (!vDescription.valid) return NextResponse.json({ error: vDescription.error }, { status: 400 });

    if (!validateEmail(vEmail.value)) return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });

    if (!vCompanyName.valid) return NextResponse.json({ error: vCompanyName.error }, { status: 400 });
    if (!vPhone.valid) return NextResponse.json({ error: vPhone.error }, { status: 400 });
    if (!vWebsite.valid) return NextResponse.json({ error: vWebsite.error }, { status: 400 });
    if (!vRole.valid) return NextResponse.json({ error: vRole.error }, { status: 400 });
    if (!vBudget.valid) return NextResponse.json({ error: vBudget.error }, { status: 400 });
    if (!vTimeline.valid) return NextResponse.json({ error: vTimeline.error }, { status: 400 });
    if (!vPreferredContact.valid) return NextResponse.json({ error: vPreferredContact.error }, { status: 400 });

    const hireRequest = {
      fullName: vFullName.value,
      companyName: vCompanyName.value || '',
      email: vEmail.value,
      phone: vPhone.value || '',
      website: vWebsite.value || '',
      projectType: vProjectType.value,
      role: vRole.value || '',
      budget: vBudget.value || '',
      timeline: vTimeline.value || '',
      description: vDescription.value,
      preferredContact: vPreferredContact.value || 'email',
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
