#!/bin/bash

# Прямой деплой в Cloud Run с помощью gcloud

set -e

# Настройки
PROJECT_ID="video-451320"
SERVICE_NAME="azerbaijan-press-monitor"
REGION="us-central1"

echo "🚀 Прямой деплой Azerbaijan Press Monitor в Cloud Run"
echo "📌 Project: $PROJECT_ID"

# Проверка GEMINI_API_KEY
if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ ERROR: GEMINI_API_KEY не установлен!"
    echo "Установите: export GEMINI_API_KEY=your-api-key"
    exit 1
fi

# Деплой напрямую из исходников без Docker
gcloud run deploy $SERVICE_NAME \
    --source . \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 900 \
    --concurrency 80 \
    --max-instances 10 \
    --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY \
    --project $PROJECT_ID

echo "✅ Деплой завершен!"