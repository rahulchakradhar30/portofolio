import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { firstName, lastName, email, subject, message } = data;

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

    // For now, we'll store the message in memory/console
    // TODO: Integrate with Supabase or sendEmail service
    const contactMessage = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    console.log('New contact message:', contactMessage);

    // TODO: Save to database
    // TODO: Send email notification to admin
    // TODO: Send auto-reply to user

    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been sent successfully! I will get back to you soon.',
        data: contactMessage,
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
