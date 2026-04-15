import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

// GET - Get portfolio content
export async function GET() {
  try {
    const content = await serverFirebaseHelpers.getPortfolioContent();

    // Return default if not found
    if (!content) {
      return NextResponse.json(
        {
          content: {
            heroTitle: 'PEREPOGU RAHUL CHAKRADHAR',
            heroSubtitle: 'AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR | DIRECTOR',
            heroTagline: 'CREATE YOUR OWN',
            aboutText: 'Passionate about AI, technology, and content creation.',
            email: 'rahulchakradharperepogu@gmail.com',
            location: 'Bengaluru, Karnataka',
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error('Fetch content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio content' },
      { status: 500 }
    );
  }
}

// PUT - Update portfolio content
export async function PUT(request: NextRequest) {
  try {
    const { heroTitle, heroSubtitle, heroTagline, bannerImage, aboutText, email, location } = await request.json();

    const updatedContent = await serverFirebaseHelpers.updatePortfolioContent({
      heroTitle,
      heroSubtitle,
      heroTagline,
      bannerImage,
      aboutText,
      email,
      location,
    });

    return NextResponse.json(
      { success: true, content: updatedContent },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio content' },
      { status: 500 }
    );
  }
}
