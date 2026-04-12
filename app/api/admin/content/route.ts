import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyJWT } from '@/app/lib/auth';

// Helper to verify admin token
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyJWT(token);
}

// GET - Get portfolio content
export async function GET(request: NextRequest) {
  try {
    const { data: content, error } = await supabase
      .from('portfolio_content')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch portfolio content' },
        { status: 500 }
      );
    }

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
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { heroTitle, heroSubtitle, heroTagline, aboutText, email, location } = await request.json();

    // Get existing content
    const { data: existingContent } = await supabase
      .from('portfolio_content')
      .select('id')
      .limit(1)
      .single();

    let updatedContent;
    let error;

    if (existingContent) {
      // Update existing
      const result = await supabase
        .from('portfolio_content')
        .update({
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_tagline: heroTagline,
          about_text: aboutText,
          email,
          location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingContent.id)
        .select()
        .single();

      updatedContent = result.data;
      error = result.error;
    } else {
      // Create new if doesn't exist
      const result = await supabase
        .from('portfolio_content')
        .insert({
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_tagline: heroTagline,
          about_text: aboutText,
          email,
          location,
        })
        .select()
        .single();

      updatedContent = result.data;
      error = result.error;
    }

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update portfolio content' },
        { status: 500 }
      );
    }

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
