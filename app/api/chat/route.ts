import { NextRequest, NextResponse } from 'next/server';

// Free AI Chat - Multiple fallback options available
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Try Hugging Face API first (free, no key needed)
    try {
      const hfResponse = await tryHuggingFaceAPI(messages);
      if (hfResponse) {
        return NextResponse.json({ content: hfResponse });
      }
    } catch (e) {
      console.error('Hugging Face API error:', e);
    }

    // Fallback: Generate smart response
    const fallbackMessage = generateSmartResponse(messages);
    return NextResponse.json({ content: fallbackMessage });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      content: 'I\'m here to help! Feel free to ask me anything about your portfolio, projects, web development, or any topic you\'d like to know about.',
    });
  }
}

// Hugging Face free API
async function tryHuggingFaceAPI(messages: any[]): Promise<string | null> {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const recentMessages = messages.slice(-5); // Use last 5 messages for context
  
  const conversationContext = recentMessages
    .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Using free public access (rate limited but works)
        },
        body: JSON.stringify({
          inputs: `${conversationContext}\nAssistant:`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            do_sample: true,
          },
        }),
      }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    if (Array.isArray(result) && result.length > 0 && result[0]?.generated_text) {
      let text = result[0].generated_text;
      // Extract only the AI response (after the last "Assistant:")
      const lines = text.split('Assistant:');
      return lines[lines.length - 1]?.trim() || null;
    }
    
    return null;
  } catch (error) {
    console.error('HF API error:', error);
    return null;
  }
}

// Smart fallback responses based on keywords
function generateSmartResponse(messages: any[]): string {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

  // Check for portfolio/project questions
  if (lastMessage.includes('portfolio') || lastMessage.includes('project')) {
    return 'This portfolio showcases my expertise in web development, AI, and technology. I work with modern frameworks like React, Next.js, and Node.js to create amazing digital experiences. Feel free to ask about any specific project!';
  }

  // Check for technology questions
  if (lastMessage.includes('react') || lastMessage.includes('javascript') || lastMessage.includes('technology') || lastMessage.includes('tech')) {
    return 'I\'m passionate about modern web development! I work with React, Next.js, TypeScript, and various other cutting-edge technologies. Is there anything specific you\'d like to know about?';
  }

  // Check for help/assistance
  if (lastMessage.includes('help') || lastMessage.includes('can you') || lastMessage.includes('how')) {
    return 'Absolutely! I\'m here to help. I can answer questions about web development, AI, technology, this portfolio, projects, and much more. What would you like to know?';
  }

  // Check for greeting
  if (lastMessage.includes('hi') || lastMessage.includes('hello') || lastMessage.includes('hey')) {
    return 'Hello! 👋 Welcome! I\'m an AI assistant here to help you explore this portfolio and answer any questions you might have. What can I help you with today?';
  }

  // Check for job/career questions
  if (lastMessage.includes('hire') || lastMessage.includes('job') || lastMessage.includes('career') || lastMessage.includes('work')) {
    return 'I\'m always open to interesting opportunities! My strengths lie in full-stack web development, AI integration, and creating innovative solutions. If you have an opportunity, I\'d love to hear about it!';
  }

  // Default smart responses
  const responses = [
    'That\'s a great question! I\'d be happy to discuss that with you.',
    'Interesting! Here\'s what I think about that... Have you considered the various perspectives on this?',
    'That\'s something I\'m knowledgeable about! The key aspects are innovation, quality, and user experience.',
    'Great topic! In my experience, the best approach combines creativity with technical expertise.',
    'I appreciate your curiosity! This is an area where I can definitely provide some valuable insights.',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
