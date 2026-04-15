import { NextRequest, NextResponse } from 'next/server';

// AI-powered content generation using Hugging Face API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Use Hugging Face Inference API (free tier available)
    const huggingFaceToken = process.env.HUGGING_FACE_API_KEY;
    
    if (!huggingFaceToken) {
      // Fallback: Generate simple content based on prompt
      const generatedContent = generateFallbackContent(prompt, type);
      return NextResponse.json(
        { success: true, content: generatedContent },
        { status: 200 }
      );
    }

    // Call Hugging Face API for better generation
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        headers: { Authorization: `Bearer ${huggingFaceToken}` },
        method: 'POST',
        body: JSON.stringify({
          inputs: `${type === 'description' ? 'Write a professional project description: ' : 'Write detailed project details: '}${prompt}`,
          parameters: {
            max_length: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      // Use fallback if API fails
      const generatedContent = generateFallbackContent(prompt, type);
      return NextResponse.json(
        { success: true, content: generatedContent },
        { status: 200 }
      );
    }

    const result = await response.json();
    const generatedText = result[0]?.generated_text || generateFallbackContent(prompt, type);

    return NextResponse.json(
      { success: true, content: generatedText },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] AI generation error:', error);
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
