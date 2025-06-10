#!/bin/bash

echo "🚂 Railway Deployment Monitor"
echo "=============================="

while true; do
    echo ""
    echo "⏰ $(date)"
    echo "📊 Railway Status:"
    railway status
    
    echo ""
    echo "🔍 Trying to get logs..."
    railway logs 2>/dev/null || echo "❌ No logs available yet"
    
    echo ""
    echo "🌐 Testing backend URL..."
    curl -s https://press-monitor-backend-production.up.railway.app/health || echo "❌ Backend not responding"
    
    echo ""
    echo "⏳ Waiting 30 seconds..."
    sleep 30
done