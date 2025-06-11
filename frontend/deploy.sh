#!/bin/bash

echo "🚀 Deploying Frontend to Vercel..."

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod --confirm

echo "✅ Frontend deployment complete!"
echo "Visit: https://airesearchprojects.com"