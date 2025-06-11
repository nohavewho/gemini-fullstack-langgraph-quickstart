#!/bin/bash

echo "🚀 Deploying Backend to Railway..."

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "curl -fsSL https://railway.app/install.sh | sh"
    exit 1
fi

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway up

echo "✅ Backend deployment complete!"
echo "Check logs with: railway logs"