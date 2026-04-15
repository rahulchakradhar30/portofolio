import { NextRequest, NextResponse } from 'next/server';

// Real AI Chat using Groq (Multiple model fallbacks for stability)
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

    // Try Groq API first (tries multiple models for reliability)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'gsk_placeholder_get_free_key_from_groq_console') {
      try {
        console.log('[Chat] Attempting Groq API with multiple models...');
        const groqResponse = await tryGroqAPI(messages);
        if (groqResponse) {
          console.log('[Chat] Groq API Success');
          return NextResponse.json({ content: groqResponse });
        }
      } catch (e) {
        console.error('[Chat] Groq API error:', e);
      }
    } else {
      console.log('[Chat] Groq API key not configured. Visit: https://console.groq.com/keys to get a free key');
    }

    // Fallback: Use Hugging Face with better prompting
    try {
      console.log('[Chat] Attempting Hugging Face API...');
      const hfResponse = await tryHuggingFaceAPI(messages);
      if (hfResponse) {
        console.log('[Chat] Hugging Face API Success');
        return NextResponse.json({ content: hfResponse });
      }
    } catch (e) {
      console.error('[Chat] Hugging Face API error:', e);
    }

    // Final fallback: Context-aware response
    console.log('[Chat] Using fallback response system');
    const fallbackMessage = generateSmartResponse(messages);
    return NextResponse.json({ content: fallbackMessage });
  } catch (error: any) {
    console.error('[Chat] API Error:', error);
    return NextResponse.json({
      content: 'I am an AI assistant integrated into this portfolio. Please try your question again!',
    });
  }
}

// Groq API with available models (Llama 2, Gemma 2, or latest available)
async function tryGroqAPI(messages: any[]): Promise<string | null> {
  try {
    // Format messages for Groq
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Try multiple models in order of preference (in case one is decommissioned)
    const models = [
      'llama-3.2-90b-vision-preview', // Latest/most capable
      'llama-3.1-8b-instant',         // Fast fallback
      'mixtral-8x7b-32768',           // Another option
      'llama-2-70b-chat',             // Stable option
    ];

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            messages: formattedMessages,
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.choices && result.choices[0]?.message?.content) {
            console.log(`[Groq] Success with model: ${model}`);
            return result.choices[0].message.content.trim();
          }
        } else {
          const error = await response.json();
          console.log(`[Groq] Model ${model} failed: ${error.error?.message || 'Unknown error'}`);
        }
      } catch (e) {
        console.log(`[Groq] Model ${model} exception: ${String(e).substring(0, 100)}`);
      }
    }

    console.log('[Groq] All models failed, falling back to HF');
    return null;
  } catch (error) {
    console.error('[Groq] Exception:', error);
    return null;
  }
}

// Hugging Face free API - Improved
async function tryHuggingFaceAPI(messages: any[]): Promise<string | null> {
  try {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    // Build better context from conversation history
    const recentMessages = messages.slice(-6).map((msg: any) => 
      `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are a helpful, friendly AI assistant chatting on someone's portfolio website. 
Be conversational, relevant, and provide useful information based on what the user asks.
Keep responses concise (1-3 sentences usually).
If asked about the portfolio owner, you can discuss web development, AI, technology, and projects.
Always be respectful and helpful.`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\n${recentMessages}\nAssistant:`,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.8,
            top_p: 0.95,
            do_sample: true,
            repetition_penalty: 1.1,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[HF] Response not ok:', response.status);
      return null;
    }

    const result = await response.json();
    
    if (Array.isArray(result) && result.length > 0 && result[0]?.generated_text) {
      let text = result[0].generated_text;
      // Extract only the new AI response (after the last "Assistant:")
      const lines = text.split('Assistant:');
      const response = lines[lines.length - 1]?.trim();
      
      // Clean up any odd formatting
      if (response && response.length > 10) {
        return response.substring(0, 1000); // Cap at 1000 chars
      }
    }
    
    return null;
  } catch (error) {
    console.error('[HF] Exception:', error);
    return null;
  }
}

// Smart fallback responses based on context analysis
// Used when real AI APIs are unavailable
function generateSmartResponse(messages: any[]): string {
  const lastMessage = messages[messages.length - 1]?.content || '';
  const conversationLength = messages.length;
  
  // Analyze the user's intent from their message
  const lowerMessage = lastMessage.toLowerCase();
  
  // Extract key topics from conversation history for context
  const recentContext = messages.slice(-3)
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Intent-based responses with more variety
  
  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/)) {
    const greetings = [
      "Hello! I'm an AI assistant here to help you explore this portfolio. What interests you most?",
      "Hi there! 👋 Feel free to ask me anything about web development, AI, projects, or this portfolio.",
      "Hey! Welcome. I'm happy to answer any questions you have. What would you like to know?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Portfolio and projects
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('project') || lowerMessage.includes('work')) {
    const projectResponses = [
      "This portfolio showcases expertise in web development, AI, and modern technologies. Featured projects include AI integration, full-stack applications, and innovative digital solutions. Would you like to hear about a specific project?",
      "I work on various types of projects - from web applications to AI implementations. My focus is on creating solutions that are both functionally excellent and visually stunning. Any particular type of project interest you?",
      "The projects here demonstrate skills in React, Next.js, Node.js, and AI integration. Each one was crafted with attention to detail and user experience. What kind of work would you like to know more about?",
    ];
    return projectResponses[Math.floor(Math.random() * projectResponses.length)];
  }

  // Technology and skills
  if (lowerMessage.match(/(react|next\.?js|node\.?js|javascript|typescript|ai|machine learning|web development|technology|framework|language)/i)) {
    const techResponses = [
      "I'm experienced with modern web technologies like React, Next.js, TypeScript, and Node.js. I also work with AI technologies and databases. What specific technology interests you?",
      "My tech stack includes JavaScript/TypeScript, React, Next.js for frontend; Node.js for backend; and various AI/ML tools. I love working with cutting-edge technologies. Anything specific you'd like to discuss?",
      "I'm well-versed in full-stack development with modern frameworks. I particularly enjoy working with React, Next.js, and exploring AI integration. Any tech topics you're curious about?",
    ];
    return techResponses[Math.floor(Math.random() * techResponses.length)];
  }

  // How/What questions
  if (lowerMessage.match(/^(how|what|why|can you|tell me|explain|describe)/i)) {
    const questionResponses = [
      "That's an excellent question! Let me break that down for you based on my expertise and experience.",
      "Great question! There are several aspects to consider here, and I'd be happy to elaborate.",
      "I can definitely help clarify that. Let me share what I know about this topic.",
    ];
    return questionResponses[Math.floor(Math.random() * questionResponses.length)];
  }

  // Hiring, opportunities, collaboration
  if (lowerMessage.match(/(hire|job|position|opportunity|freelance|collaborate|contract|employment|work with|need a)/i)) {
    return "I'm always interested in discussing opportunities! My strengths include full-stack development, AI integration, and building innovative solutions. What kind of project or role did you have in mind?";
  }

  // Help requests
  if (lowerMessage.match(/(help|assist|support|guide|show me|teach|learn)/i)) {
    const helpResponses = [
      "Absolutely! I'm here to help. Could you provide a bit more detail about what you'd like assistance with?",
      "Of course! I'd be happy to help. What specific area would you like to explore?",
      "I'm ready to assist! Tell me more about what you're looking for.",
    ];
    return helpResponses[Math.floor(Math.random() * helpResponses.length)];
  }

  // Feedback and compliments
  if (lowerMessage.match(/(great|awesome|nice|love|amazing|impressed|beautiful|cool)/i)) {
    return "Thank you! I appreciate the positive feedback. I'm continuously working to improve and create better experiences. Is there anything specific you'd like to know more about?";
  }

  // Generic thoughtful response when no specific topic matched
  const genericResponses = [
    "That's an interesting point. I appreciate the question - it shows you're thinking deeply about this.",
    "I see what you're asking. In my perspective, this involves several important considerations.",
    "That's something I've thought about quite a bit. Here's my take on it...",
    "Good observation! This relates to some core principles I believe strongly in.",
    "I'm glad you brought that up. It's an area where I can provide some valuable insights.",
  ];
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)];
}
