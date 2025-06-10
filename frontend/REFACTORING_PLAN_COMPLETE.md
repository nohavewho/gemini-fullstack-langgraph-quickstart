# Полный план рефакторинга API и интеграции фронтенда

## 🔴 Главные проблемы

### 1. Хаос с версиями и подходами
- Смешение AI SDK v5 и старых SDK (Google Generative AI)
- Несогласованность между Edge Runtime и Node.js Runtime
- Дублирование кода в /api/research/ и основных endpoints

### 2. Проблемы с таймаутами
- Edge Runtime лимит 25 секунд
- Нет правильной реализации streaming для длительных операций
- Попытки обойти через press-monitor-langgraph-edge.js неэффективны

### 3. Отсутствие централизованной конфигурации
- API ключи захардкожены в разных файлах
- Разные модели Gemini используются хаотично
- Дублирование mapping стран в каждом файле

### 4. Неясная архитектура
- Непонятно где должна быть логика - в Python backend или JS/TS
- chat.js просто проксирует на press-monitor-langgraph.js
- Нет четкого разделения ответственности

## 📋 План исправления

### Фаза 1: Централизация конфигурации

#### 1.1 Создать единый конфиг файл
```typescript
// frontend/src/lib/config/api.config.ts
export const API_CONFIG = {
  models: {
    default: 'gemini-2.0-flash-exp',
    reasoning: 'gemini-2.0-flash-thinking-exp',
    pro: 'gemini-1.5-pro-latest'
  },
  providers: {
    google: {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
    }
  },
  runtime: {
    edge: {
      maxDuration: 25,
      streamingEnabled: true
    }
  }
};
```

#### 1.2 Унифицировать mapping стран
```typescript
// frontend/src/lib/config/countries.config.ts
export const COUNTRIES_CONFIG = {
  // Единый источник правды для всех стран
};
```

### Фаза 2: Миграция на AI SDK v5

#### 2.1 Обновить основной press-monitor endpoint
```typescript
// frontend/api/press-monitor.ts
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const runtime = 'edge';
export const maxDuration = 25;

export async function POST(request: Request) {
  const { messages, country, mode } = await request.json();

  const result = streamText({
    model: google('gemini-2.0-flash-exp'),
    messages,
    system: getSystemPrompt(country, mode),
    onFinish: async ({ text, usage }) => {
      // Логирование и аналитика
    }
  });

  return result.toDataStreamResponse();
}
```

#### 2.2 Реализовать правильный streaming для Edge Runtime
```typescript
// Использовать встроенный streaming AI SDK
// Не изобретать велосипед с custom реализациями
```

### Фаза 3: Интеграция с Python Backend

#### 3.1 Создать gateway для LangGraph
```typescript
// frontend/api/langgraph-gateway.ts
export async function callLangGraphBackend(params: any) {
  try {
    const response = await fetch(process.env.LANGGRAPH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) throw new Error('Backend unavailable');
    
    return response;
  } catch (error) {
    // Fallback на AI SDK если backend недоступен
    return fallbackToAISDK(params);
  }
}
```

### Фаза 4: Рефакторинг фронтенда

#### 4.1 Использовать правильные хуки AI SDK
```typescript
// frontend/src/hooks/usePressMonitor.ts
import { useChat } from '@ai-sdk/react';

export function usePressMonitor() {
  const { messages, append, isLoading } = useChat({
    api: '/api/press-monitor',
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });
  
  return { messages, sendMessage: append, isLoading };
}
```

### Фаза 5: Оптимизация для Vercel

#### 5.1 Настроить vercel.json правильно
```json
{
  "functions": {
    "api/press-monitor.ts": {
      "runtime": "edge",
      "maxDuration": 25
    },
    "api/langgraph-gateway.ts": {
      "runtime": "nodejs22.x",
      "maxDuration": 60
    }
  }
}
```

#### 5.2 Использовать Fluid Compute для длительных операций
```typescript
// Для операций требующих больше 25 секунд
export const config = {
  runtime: 'nodejs',
  maxDuration: 300 // До 5 минут на Pro плане
};
```

### Фаза 6: Cleanup

#### 6.1 Удалить дублирующиеся файлы
- `/api/research/*` - устаревшие версии
- `/api/test-*` - тестовые endpoints
- Оставить только production-ready код

#### 6.2 Добавить мониторинг и логирование
```typescript
// Интеграция с Vercel Analytics
// Structured logging для отладки
// Error tracking
```

## 🚀 Порядок выполнения

1. **Сначала**: Создать централизованную конфигурацию
2. **Затем**: Мигрировать основной endpoint на AI SDK v5
3. **После**: Настроить правильную интеграцию с backend
4. **Далее**: Исправить фронтенд хуки
5. **В конце**: Cleanup и оптимизация

## ⚡ Quick Wins

1. Сразу исправить `chat.js` чтобы использовал AI SDK правильно
2. Удалить все hardcoded API ключи
3. Унифицировать использование моделей Gemini
4. Добавить proper error handling везде

## 🎯 Конечная цель

- Единая, понятная архитектура
- Работающий streaming без таймаутов
- Правильная интеграция AI SDK v5 + LangGraph
- Чистый, поддерживаемый код
- Масштабируемое решение для multi-country поддержки