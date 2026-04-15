#!/bin/bash
# Script to update Resend API key in .env.local
# Usage: ./update-resend-key.sh "re_your_new_key_here"

if [ -z "$1" ]; then
    echo "❌ Error: No API key provided"
    echo "Usage: ./update-resend-key.sh \"re_your_new_key_here\""
    exit 1
fi

NEW_KEY="$1"

# Validate key format
if [[ ! "$NEW_KEY" =~ ^re_ ]]; then
    echo "❌ Error: API key must start with 're_'"
    exit 1
fi

echo "📝 Updating .env.local with new Resend API key..."
echo "New key: ${NEW_KEY:0:10}...${NEW_KEY: -4}"

# Update the key
sed -i "s/^RESEND_API_KEY=.*/RESEND_API_KEY=$NEW_KEY/" .env.local

if [ $? -eq 0 ]; then
    echo "✅ Updated RESEND_API_KEY in .env.local"
    echo "🔄 Restarting dev server in 2 seconds..."
    sleep 2
    
    # Kill existing node processes
    pkill -f "node.*dev" || true
    sleep 1
    
    # Restart dev server
    npm run dev &
    
    echo "✅ Dev server restarting with new API key"
    echo "🎉 Done! OTP emails should now work"
else
    echo "❌ Failed to update .env.local"
    exit 1
fi
