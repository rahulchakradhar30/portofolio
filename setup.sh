#!/bin/bash

# Firebase Automated Setup Script
# Run: ./setup.sh or bash setup.sh

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  🔥 Firebase Automatic Setup             ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if firebase-credentials.json exists
if [ ! -f "firebase-credentials.json" ]; then
    echo "❌ Error: firebase-credentials.json not found"
    echo ""
    echo "📋 Please download it:"
    echo "   1. Go to: https://console.firebase.google.com"
    echo "   2. Select project: rahul-portofolio"
    echo "   3. ⚙️ Project Settings → Service Accounts"
    echo "   4. Generate New Private Key"
    echo "   5. Save as: firebase-credentials.json (in this folder)"
    echo ""
    exit 1
fi

# Check if ts-node is available
if ! command -v ts-node &> /dev/null; then
    echo "📦 Installing ts-node..."
    npm install --save-dev ts-node @types/node
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Run setup script
echo "🚀 Creating Firestore collections..."
npx ts-node scripts/setup-firebase.ts

# Check if rules file was created
if [ -f "firestore.rules" ]; then
    echo ""
    echo "📋 Would you like to deploy security rules now? (y/n)"
    read -r response
    
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        echo "🔐 Deploying security rules..."
        firebase login
        firebase deploy --only firestore:rules
        echo "✅ Rules deployed!"
    else
        echo "⏭️  Skipped. You can deploy later with:"
        echo "   firebase deploy --only firestore:rules"
    fi
fi

echo ""
echo "✅ Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Go to: http://localhost:3000/admin/login"
echo "3. Create test account"
echo "4. Enable 2FA"
echo ""
