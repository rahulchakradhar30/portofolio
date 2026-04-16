import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

export async function POST(request: NextRequest) {
  try {
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
