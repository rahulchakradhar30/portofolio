import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

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
            profileImage: '',
            resumeUrl: '',
            email: 'rahulchakradharperepogu@gmail.com',
            location: 'Bengaluru, Karnataka',
            instagram: 'https://www.instagram.com/rahul_chakradhar_30/?hl=en',
            linkedin: 'https://www.linkedin.com/in/perepogu-rahul-chakradhar-721017379/',
            github: 'https://github.com/rahulchakradhar30',
            aboutStats: [
              { label: 'Major Projects', value: '3+' },
              { label: 'Certifications', value: '5+' },
              { label: 'Websites Published', value: '2+' },
              { label: 'Success Rate', value: '90%' },
            ],
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
    const limit = enforceRateLimit({ request, scope: 'admin-content-update', max: 30, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const {
      heroTitle,
      heroSubtitle,
      heroTagline,
      bannerImage,
      profileImage,
      resumeUrl,
      aboutText,
      email,
      location,
      instagram,
      linkedin,
      github,
      aboutStats,
    } = await request.json();

    const updatedContent = await serverFirebaseHelpers.updatePortfolioContent({
      heroTitle,
      heroSubtitle,
      heroTagline,
      bannerImage,
      profileImage,
      resumeUrl,
      aboutText,
      email,
      location,
      instagram,
      linkedin,
      github,
      aboutStats,
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'content.update',
      details: { heroTitle, email, location },
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
