import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { assertAdminSession } from '@/app/lib/adminAuth';

// AI-powered content generation using OpenAI API
export async function POST(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: Generate simple content based on prompt
      const generatedContent = generateFallbackContent(prompt, type);
      return NextResponse.json(
        { success: true, content: generatedContent },
        { status: 200 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create appropriate prompt based on type
    const systemPrompt = type === 'description' 
      ? 'You are an expert technical writer who creates concise, professional project descriptions. Keep responses between 100-200 words and include the most important features and benefits.'
      : 'You are an expert technical writer who creates detailed project documentation. Provide comprehensive details including overview, features, technical stack, and results. Keep responses between 300-500 words.';

    const userPrompt = type === 'description'
      ? `Write a professional project description for: ${prompt}`
      : `Write detailed project information for: ${prompt}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: type === 'description' ? 300 : 800,
    });

    const generatedText = response.choices[0]?.message?.content || generateFallbackContent(prompt, type);

    return NextResponse.json(
      { success: true, content: generatedText },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API] AI generation error:', error);
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? (error as { status?: number }).status
      : undefined;
    
    // Check if it's an API key issue
    if (status === 401) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key is invalid. Please check your configuration.' },
        { status: 401 }
      );
    }

    // Return fallback on any error
    const fallbackContent = generateFallbackContent('project', 'description');
    return NextResponse.json(
      { success: true, content: fallbackContent },
      { status: 200 }
    );
  }
}

// Fallback content generator
function generateFallbackContent(prompt: string, type: string): string {
  const templates: Record<string, string> = {
    description: `Project: ${prompt}
    
This is a well-executed project that demonstrates technical expertise and practical problem-solving. 
Key features include:
• Clean, maintainable code architecture
• Responsive and user-friendly interface
• Robust backend implementation
• Comprehensive testing and documentation

The project successfully combines modern technologies to deliver a seamless user experience.`,
    
    details: `## Project Overview: ${prompt}

This comprehensive project showcases advanced development practices and innovative solutions.

### Key Features:
• Full-stack implementation with modern framework
• Database optimization and efficient data flow
• Real-time updates and responsiveness
• Scalable architecture for future growth

### Technical Stack:
• Frontend: React/Next.js with Tailwind CSS
• Backend: Node.js with Express/Firebase
• Database: Firestore/SQL with proper indexing
• Deployment: Vercel/Cloud platforms

### Development Process:
The project was developed using agile methodology with continuous integration and deployment.
Emphasis was placed on code quality, performance optimization, and user experience.

### Results:
Successfully deployed to production with excellent performance metrics and user satisfaction.`,
  };

  return templates[type] || templates['description'];
}
