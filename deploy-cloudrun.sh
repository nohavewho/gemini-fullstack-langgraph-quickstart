#!/bin/bash

# Скрипт для деплоя Azerbaijan Press Monitor в Google Cloud Run

set -e

# Настройки проекта (измените на ваши)
PROJECT_ID="your-project-id"
SERVICE_NAME="azerbaijan-press-monitor"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Деплой Azerbaijan Press Monitor в Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# 1. Сборка Docker образа
echo "📦 Сборка Docker образа..."
docker build -f Dockerfile.cloudrun -t $IMAGE_NAME .

# 2. Пуш образа в Container Registry
echo "⬆️ Загрузка образа в Container Registry..."
docker push $IMAGE_NAME

# 3. Деплой в Cloud Run
echo "🚀 Деплой в Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 900 \
    --concurrency 80 \
    --max-instances 10 \
    --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY

echo "✅ Деплой завершен!"
echo "🌐 URL сервиса:"
gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'