# ВАЖНО - Конфигурация проекта

## PostgreSQL Connection String:
```
postgresql://postgres.peojtkesvynmmzftljxo:H^Ops#&PNPXnn9i@cQ@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

## Архитектура API:
- `/api/chat.js` - Основной чат API (использует AI SDK v5)
- `/api/press-monitor-langgraph.js` - ЕДИНСТВЕННЫЙ API для анализа прессы (AI SDK v5 + LangGraph)
- Все остальные press-monitor API УДАЛЕНЫ

## Интеграция:
- Frontend: AI SDK v5 streaming
- Backend: LangGraph Python (опционально) 
- Fallback: AI SDK v5 direct generation

ВСЕ РАБОТАЕТ ЧЕРЕЗ СТРИМИНГ!