import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create a readable stream for streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
          });

          for await (const chunk of response) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }

          controller.close();
        } catch (error: any) {
          // Handle specific OpenAI errors
          let errorMessage = error.message || 'Unknown error occurred';
          
          if (error.status === 429) {
            errorMessage = 'API quota exceeded. Please check your OpenAI account billing at https://platform.openai.com/account/billing/overview';
          } else if (error.status === 401) {
            errorMessage = 'Invalid or expired OpenAI API key. Please check your configuration.';
          } else if (error.status === 503) {
            errorMessage = 'OpenAI service is temporarily unavailable. Please try again in a moment.';
          }

          // Send error message through stream
          controller.enqueue(
            encoder.encode(`[ERROR] ${errorMessage}`)
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
