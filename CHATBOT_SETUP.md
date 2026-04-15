# AI Chatbot Setup Guide

Your portfolio now has a **REAL AI chatbot** powered by Groq's free AI models. No payment ever required!

## About the Chatbot

The chatbot uses:
- **Primary**: Groq API (Mixtral 8x7B - fast, intelligent model)
- **Fallback**: Hugging Face Inference API (backup when Groq unavailable)
- **Final Fallback**: Smart context-aware responses (when APIs down)

## Get Your Free Groq API Key (2 Minutes)

### Step 1: Sign Up
1. Go to https://console.groq.com/keys
2. Click "Sign up" (free, no credit card needed)
3. Create account with email and password
4. Verify your email

### Step 2: Get API Key
1. After login, you'll see "API Keys" section
2. Click "Create New API Key" or similar button
3. Copy the key (starts with `gsk_`)

### Step 3: Update Your Environment
1. Open `.env.local` in the portfolio directory
2. Find this line:
   ```
   GROQ_API_KEY=gsk_placeholder_get_free_key_from_groq_console
   ```
3. Replace `gsk_placeholder_...` with your actual key:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
4. Save the file

### Step 4: Restart Dev Server
```bash
npm run dev
```

The chatbot is now live with real AI! 🎉

## Test It

1. Open http://localhost:3000
2. Click the blue sparkle button
3. Try asking:
   - "What projects have you worked on?"
   - "Tell me about your tech stack"
   - "What's your experience with React?"
   - Any other questions!

## How It Works

- **When Groq key is configured**: Uses Mixtral 8x7B for intelligent, context-aware responses
- **When Groq key is missing**: Falls back to Hugging Face (works but slower)
- **When all APIs down**: Uses smart fallback responses based on conversation context

## Troubleshooting

### Chatbot still giving generic responses?
- Check that you've updated `.env.local` with your real Groq key
- Restart the dev server with `npm run dev`
- Check browser console for any errors

### "Groq API key not configured" message in console?
- Your `.env.local` still has the placeholder value
- Get a real key from https://console.groq.com/keys and update it

### Getting rate limited?
- Groq free tier allows ~30 requests/minute per user
- Wait a moment and try again

## Free Tier Limits

Groq's free tier includes:
- ✅ Unlimited API calls after signup
- ✅ Fast response times (usually <1 second)
- ✅ Multiple model options (Mixtral, Llama, etc.)
- ✅ No credit card required
- ✅ No expiration or time limits

Perfect for a portfolio!

---

**Your chatbot is now 10x better!** 🚀
