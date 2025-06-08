# 📋 ДЕТАЛЬНЕЙШИЙ ПЛАН РЕФАКТОРИНГА: Azerbaijan Press Monitor Multi-Agent System

## 🎯 ЦЕЛЬ ТРАНСФОРМАЦИИ
Превратить существующий research agent в специализированную мультиагентную систему мониторинга мировой прессы об Азербайджане с автоматической классификацией тональности и генерацией дайджестов.

## 🌍 ГЛОБАЛЬНЫЙ ОХВАТ С ПРИОРИТЕТОМ НА АЗИЮ И СОСЕДЕЙ

### 🎯 ПРИОРИТЕТНЫЕ РЕГИОНЫ:
1. **СОСЕДИ АЗЕРБАЙДЖАНА** (КРИТИЧЕСКИ ВАЖНО):
   - 🇹🇷 Турция (турецкий) - ключевой партнер
   - 🇷🇺 Россия (русский) - важнейший сосед
   - 🇮🇷 Иран (персидский/фарси) - южный сосед
   - 🇬🇪 Грузия (грузинский) - северный сосед
   - 🇦🇲 Армения (армянский) - западный сосед

2. **СРЕДНЯЯ АЗИЯ** (ВЫСОКИЙ ПРИОРИТЕТ):
   - 🇰🇿 Казахстан (казахский, русский)
   - 🇺🇿 Узбекистан (узбекский, русский)
   - 🇹🇲 Туркменистан (туркменский)
   - 🇰🇬 Кыргызстан (кыргызский, русский)
   - 🇹🇯 Таджикистан (таджикский, русский)

3. **ЮГО-ВОСТОЧНАЯ АЗИЯ**:
   - 🇹🇭 Таиланд (тайский)
   - 🇮🇩 Индонезия (индонезийский)
   - 🇲🇾 Малайзия (малайский)
   - 🇵🇭 Филиппины (тагалог, английский)
   - 🇻🇳 Вьетнам (вьетнамский)
   - 🇸🇬 Сингапур (английский, китайский, малайский)

4. **ВОСТОЧНАЯ АЗИЯ**:
   - 🇨🇳 Китай (китайский мандарин)
   - 🇯🇵 Япония (японский)
   - 🇰🇷 Южная Корея (корейский)
   - 🇲🇳 Монголия (монгольский)

5. **ЮЖНАЯ АЗИЯ**:
   - 🇮🇳 Индия (хинди, английский, региональные языки)
   - 🇵🇰 Пакистан (урду, английский)
   - 🇧🇩 Бангладеш (бенгальский)
   - 🇱🇰 Шри-Ланка (сингальский, тамильский)

6. **ЕВРОПА** (ВАЖНО ДЛЯ ПОЛНОЙ КАРТИНЫ):
   - 🇬🇧 Великобритания (английский)
   - 🇩🇪 Германия (немецкий)
   - 🇫🇷 Франция (французский)
   - 🇮🇹 Италия (итальянский)
   - 🇪🇸 Испания (испанский)
   - 🇵🇹 Португалия (португальский)
   - 🇵🇱 Польша (польский)
   - 🇺🇦 Украина (украинский)
   - 🇸🇪 Швеция (шведский)
   - 🇳🇴 Норвегия (норвежский)
   - 🇫🇮 Финляндия (финский)
   - 🇮🇸 Исландия (исландский)
   - 🇬🇷 Греция (греческий)
   - ВСЕ остальные европейские страны

7. **АФРИКА** (ВАЖНО ДЛЯ ПОЛНОЙ КАРТИНЫ):
   - 🇪🇬 Египет (арабский)
   - 🇿🇦 ЮАР (английский, африкаанс, зулу)
   - 🇳🇬 Нигерия (английский, йоруба)
   - 🇰🇪 Кения (английский, суахили)
   - 🇪🇹 Эфиопия (амхарский)
   - 🇲🇦 Марокко (арабский, французский)
   - 🇩🇿 Алжир (арабский, французский)
   - ВСЕ африканские страны

8. **АМЕРИКА** (ВАЖНО ДЛЯ ПОЛНОЙ КАРТИНЫ):
   - 🇺🇸 США (английский)
   - 🇨🇦 Канада (английский, французский)
   - 🇲🇽 Мексика (испанский)
   - 🇧🇷 Бразилия (португальский)
   - 🇦🇷 Аргентина (испанский)
   - 🇨🇴 Колумбия (испанский)
   - 🇵🇪 Перу (испанский, кечуа)
   - 🇨🇱 Чили (испанский)
   - ВСЕ страны Латинской Америки

9. **ОКЕАНИЯ** (ВАЖНО ДЛЯ ПОЛНОЙ КАРТИНЫ):
   - 🇦🇺 Австралия (английский)
   - 🇳🇿 Новая Зеландия (английский, маори)
   - 🇵🇬 Папуа-Новая Гвинея
   - 🇫🇯 Фиджи
   - ВСЕ островные государства

10. **БЛИЖНИЙ ВОСТОК** (КРИТИЧЕСКИ ВАЖНО):
    - 🇸🇦 Саудовская Аравия (арабский)
    - 🇦🇪 ОАЭ (арабский)
    - 🇮🇱 Израиль (иврит, арабский)
    - 🇶🇦 Катар (арабский)
    - 🇰🇼 Кувейт (арабский)
    - 🇯🇴 Иордания (арабский)
    - 🇱🇧 Ливан (арабский)
    - 🇸🇾 Сирия (арабский)
    - 🇮🇶 Ирак (арабский, курдский)

**ВАЖНО**: КАЖДАЯ СТРАНА И КАЖДЫЙ ЯЗЫК ВАЖНЫ ДЛЯ ПОЛНОГО ИССЛЕДОВАНИЯ!

## 🏗️ АРХИТЕКТУРНЫЙ ПОДХОД

### Принципы рефакторинга:
1. **Сохранение работающего кода** - все изменения инкрементальные
2. **Использование существующей инфраструктуры** - LangGraph, Redis, PostgreSQL
3. **Расширение, а не замена** - добавляем новые узлы к существующему графу
4. **Обратная совместимость** - старый research flow остается доступным

## 📊 ФАЗА 1: РАСШИРЕНИЕ МОДЕЛИ ДАННЫХ (День 1-2)

### 1.1 Обновление схемы PostgreSQL

```sql
-- Новые таблицы для хранения истории
CREATE TABLE IF NOT EXISTS press_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_country TEXT,
    source_language VARCHAR(10) NOT NULL,
    language_name TEXT NOT NULL, -- полное название языка
    region TEXT, -- континент/регион
    published_date TIMESTAMP WITH TIME ZONE,
    fetched_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    original_content TEXT, -- оригинальный текст
    translated_content TEXT, -- переведенный на английский
    summary TEXT,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    sentiment_score FLOAT,
    sentiment_explanation TEXT, -- почему такая оценка
    key_phrases JSONB,
    mentions_context JSONB, -- контекст упоминаний Азербайджана
    thread_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS press_digests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    digest_type VARCHAR(20) CHECK (digest_type IN ('positive', 'negative', 'daily', 'weekly')),
    content TEXT NOT NULL,
    articles_count INTEGER,
    languages_covered JSONB, -- {"en": 5, "ru": 3, "tr": 2, ...}
    countries_covered JSONB,
    regions_breakdown JSONB, -- {"Europe": 10, "Asia": 15, ...}
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_email BOOLEAN DEFAULT FALSE,
    sent_telegram BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS language_coverage (
    language_code VARCHAR(10) PRIMARY KEY,
    language_name TEXT NOT NULL,
    native_name TEXT,
    region TEXT,
    countries TEXT[],
    last_checked TIMESTAMP WITH TIME ZONE,
    articles_found INTEGER DEFAULT 0
);

-- Предзаполнение языков мира
INSERT INTO language_coverage (language_code, language_name, native_name, region, countries) VALUES
('en', 'English', 'English', 'Global', ARRAY['US', 'UK', 'AU', 'CA']),
('es', 'Spanish', 'Español', 'Global', ARRAY['ES', 'MX', 'AR', 'CO']),
('zh', 'Chinese', '中文', 'Asia', ARRAY['CN', 'TW', 'SG']),
('ar', 'Arabic', 'العربية', 'Middle East', ARRAY['SA', 'EG', 'AE']),
('hi', 'Hindi', 'हिन्दी', 'Asia', ARRAY['IN']),
('bn', 'Bengali', 'বাংলা', 'Asia', ARRAY['BD', 'IN']),
('pt', 'Portuguese', 'Português', 'Global', ARRAY['BR', 'PT', 'AO']),
('ru', 'Russian', 'Русский', 'Europe/Asia', ARRAY['RU', 'BY', 'KZ']),
('ja', 'Japanese', '日本語', 'Asia', ARRAY['JP']),
('de', 'German', 'Deutsch', 'Europe', ARRAY['DE', 'AT', 'CH']),
('fr', 'French', 'Français', 'Global', ARRAY['FR', 'CA', 'BE']),
('tr', 'Turkish', 'Türkçe', 'Asia/Europe', ARRAY['TR']),
('ko', 'Korean', '한국어', 'Asia', ARRAY['KR', 'KP']),
('it', 'Italian', 'Italiano', 'Europe', ARRAY['IT']),
('pl', 'Polish', 'Polski', 'Europe', ARRAY['PL']),
('uk', 'Ukrainian', 'Українська', 'Europe', ARRAY['UA']),
('nl', 'Dutch', 'Nederlands', 'Europe', ARRAY['NL', 'BE']),
('sv', 'Swedish', 'Svenska', 'Europe', ARRAY['SE']),
('no', 'Norwegian', 'Norsk', 'Europe', ARRAY['NO']),
('da', 'Danish', 'Dansk', 'Europe', ARRAY['DK']),
('fi', 'Finnish', 'Suomi', 'Europe', ARRAY['FI']),
('is', 'Icelandic', 'Íslenska', 'Europe', ARRAY['IS']),
('et', 'Estonian', 'Eesti', 'Europe', ARRAY['EE']),
('lv', 'Latvian', 'Latviešu', 'Europe', ARRAY['LV']),
('lt', 'Lithuanian', 'Lietuvių', 'Europe', ARRAY['LT']),
('ro', 'Romanian', 'Română', 'Europe', ARRAY['RO']),
('bg', 'Bulgarian', 'Български', 'Europe', ARRAY['BG']),
('hr', 'Croatian', 'Hrvatski', 'Europe', ARRAY['HR']),
('sr', 'Serbian', 'Српски', 'Europe', ARRAY['RS']),
('sk', 'Slovak', 'Slovenčina', 'Europe', ARRAY['SK']),
('sl', 'Slovenian', 'Slovenščina', 'Europe', ARRAY['SI']),
('cs', 'Czech', 'Čeština', 'Europe', ARRAY['CZ']),
('hu', 'Hungarian', 'Magyar', 'Europe', ARRAY['HU']),
('el', 'Greek', 'Ελληνικά', 'Europe', ARRAY['GR']),
('he', 'Hebrew', 'עברית', 'Middle East', ARRAY['IL']),
('fa', 'Persian', 'فارسی', 'Middle East', ARRAY['IR', 'AF']),
('ur', 'Urdu', 'اردو', 'Asia', ARRAY['PK', 'IN']),
('th', 'Thai', 'ไทย', 'Asia', ARRAY['TH']),
('vi', 'Vietnamese', 'Tiếng Việt', 'Asia', ARRAY['VN']),
('id', 'Indonesian', 'Bahasa Indonesia', 'Asia', ARRAY['ID']),
('ms', 'Malay', 'Bahasa Melayu', 'Asia', ARRAY['MY', 'SG']),
('tl', 'Filipino', 'Tagalog', 'Asia', ARRAY['PH']),
('sw', 'Swahili', 'Kiswahili', 'Africa', ARRAY['KE', 'TZ', 'UG']),
('am', 'Amharic', 'አማርኛ', 'Africa', ARRAY['ET']),
('yo', 'Yoruba', 'Yorùbá', 'Africa', ARRAY['NG']),
('zu', 'Zulu', 'isiZulu', 'Africa', ARRAY['ZA']),
('xh', 'Xhosa', 'isiXhosa', 'Africa', ARRAY['ZA']),
('af', 'Afrikaans', 'Afrikaans', 'Africa', ARRAY['ZA']),
('ka', 'Georgian', 'ქართული', 'Asia', ARRAY['GE']),
('hy', 'Armenian', 'Հայերեն', 'Asia', ARRAY['AM']),
('az', 'Azerbaijani', 'Azərbaycan', 'Asia', ARRAY['AZ']),
('kk', 'Kazakh', 'Қазақ', 'Asia', ARRAY['KZ']),
('ky', 'Kyrgyz', 'Кыргызча', 'Asia', ARRAY['KG']),
('uz', 'Uzbek', 'Oʻzbek', 'Asia', ARRAY['UZ']),
('tg', 'Tajik', 'Тоҷикӣ', 'Asia', ARRAY['TJ']),
('mn', 'Mongolian', 'Монгол', 'Asia', ARRAY['MN']),
('ne', 'Nepali', 'नेपाली', 'Asia', ARRAY['NP']),
('si', 'Sinhala', 'සිංහල', 'Asia', ARRAY['LK']),
('my', 'Burmese', 'မြန်မာ', 'Asia', ARRAY['MM']),
('km', 'Khmer', 'ខ្មែរ', 'Asia', ARRAY['KH']),
('lo', 'Lao', 'ລາວ', 'Asia', ARRAY['LA']),
('qu', 'Quechua', 'Runa Simi', 'South America', ARRAY['PE', 'BO', 'EC']),
('gn', 'Guarani', 'Avañeẽ', 'South America', ARRAY['PY']),
('ay', 'Aymara', 'Aymar aru', 'South America', ARRAY['BO', 'PE']),
('ht', 'Haitian Creole', 'Kreyòl ayisyen', 'Caribbean', ARRAY['HT']);

-- Индексы для быстрого поиска
CREATE INDEX idx_articles_sentiment ON press_articles(sentiment);
CREATE INDEX idx_articles_published ON press_articles(published_date DESC);
CREATE INDEX idx_articles_language ON press_articles(source_language);
CREATE INDEX idx_articles_country ON press_articles(source_country);
CREATE INDEX idx_articles_url ON press_articles(url);
CREATE INDEX idx_language_coverage_checked ON language_coverage(last_checked);
```

## 📦 ФАЗА 2: РАСШИРЕНИЕ STATE И SCHEMAS (День 3-4)

### 2.1 Новые состояния в `state.py`

```python
from typing import TypedDict, List, Dict, Optional, Literal
from datetime import datetime
from langchain_core.messages import AnyMessage

class ArticleInfo(TypedDict):
    """Информация о статье"""
    url: str
    title: str
    source_name: str
    source_country: str
    source_language: str
    language_name: str
    published_date: Optional[datetime]
    original_content: str
    translated_content: Optional[str]
    summary: str
    sentiment: Literal["positive", "negative", "neutral"]
    sentiment_score: float
    sentiment_explanation: str
    key_phrases: List[str]
    mentions_context: List[Dict[str, str]]  # {"text": "...", "context": "economic/political/cultural"}

class LanguageSearchState(TypedDict):
    """Состояние для поиска на конкретном языке"""
    language_code: str
    language_name: str
    search_queries: List[str]
    articles_found: List[ArticleInfo]
    search_completed: bool

class OrchestratorState(TypedDict):
    """Главное состояние оркестратора"""
    messages: List[AnyMessage]
    search_mode: Literal["all_languages", "specific_languages", "regions"]
    target_languages: Optional[List[str]]  # если specific_languages
    target_regions: Optional[List[str]]    # если regions
    active_searches: Dict[str, LanguageSearchState]  # language_code -> state
    all_articles: List[ArticleInfo]
    positive_articles: List[ArticleInfo]
    negative_articles: List[ArticleInfo]
    neutral_articles: List[ArticleInfo]
    digest_generated: bool
    positive_digest: Optional[str]
    negative_digest: Optional[str]
    notification_sent: bool

class PressMonitorOverallState(TypedDict):
    """Расширенное состояние всей системы"""
    # Существующие поля
    messages: List[AnyMessage]
    
    # Новые поля для мониторинга прессы
    monitor_mode: bool  # режим мониторинга vs обычный research
    orchestrator_state: Optional[OrchestratorState]
    
    # Конфигурация
    languages_to_monitor: List[str]  # какие языки отслеживать
    sentiment_threshold: float  # порог для определения позитив/негатив
    max_articles_per_language: int
    translation_enabled: bool
```

### 2.2 Новые Pydantic схемы в `tools_and_schemas.py`

```python
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
from datetime import datetime

class LanguageSearchQuery(BaseModel):
    """Поисковый запрос для конкретного языка"""
    language_code: str = Field(description="ISO код языка")
    language_name: str = Field(description="Полное название языка")
    queries: List[str] = Field(
        description="Список поисковых запросов на данном языке",
        min_items=1,
        max_items=5
    )

class MultiLanguageSearchPlan(BaseModel):
    """План поиска по множеству языков"""
    search_queries_by_language: List[LanguageSearchQuery] = Field(
        description="Поисковые запросы для каждого языка"
    )
    
class SentimentAnalysis(BaseModel):
    """Результат анализа тональности"""
    sentiment: Literal["positive", "negative", "neutral"] = Field(
        description="Общая тональность статьи"
    )
    score: float = Field(
        description="Оценка уверенности от -1 (негатив) до 1 (позитив)",
        ge=-1.0,
        le=1.0
    )
    explanation: str = Field(
        description="Объяснение почему такая оценка"
    )
    key_phrases: List[str] = Field(
        description="Ключевые фразы, определившие тональность"
    )

class ArticleAnalysis(BaseModel):
    """Полный анализ статьи"""
    title: str
    summary: str = Field(description="Краткое содержание статьи")
    sentiment_analysis: SentimentAnalysis
    azerbaijan_mentions: List[Dict[str, str]] = Field(
        description="Все упоминания Азербайджана с контекстом"
    )
    topics: List[str] = Field(
        description="Основные темы статьи"
    )
    
class PressDigest(BaseModel):
    """Структура дайджеста"""
    digest_type: Literal["positive", "negative"]
    title: str
    summary: str = Field(description="Общее резюме")
    articles_by_region: Dict[str, List[Dict[str, str]]] = Field(
        description="Статьи сгруппированные по регионам"
    )
    key_themes: List[str] = Field(description="Ключевые темы")
    statistics: Dict[str, int] = Field(
        description="Статистика: кол-во статей, языков, стран"
    )
```

## 🤖 ФАЗА 3: СОЗДАНИЕ НОВЫХ АГЕНТОВ (День 5-7)

### 3.1 Новая структура файлов
```
backend/src/agent/
├── __init__.py
├── app.py (обновленный)
├── configuration.py (расширенный)
├── graph.py (сохраняем старый)
├── press_monitor_graph.py (НОВЫЙ - граф мониторинга прессы)
├── orchestrator.py (НОВЫЙ - оркестратор)
├── language_agents.py (НОВЫЙ - языковые агенты)  
├── sentiment_analyzer.py (НОВЫЙ - анализ тональности)
├── digest_generator.py (НОВЫЙ - генератор дайджестов)
├── temporal_analytics.py (НОВЫЙ - временной анализ трендов)
├── prompts.py (обновленный)
├── press_prompts.py (НОВЫЙ - промпты для прессы)
├── state.py (расширенный)
├── tools_and_schemas.py (расширенный)
├── utils.py (обновленный)
└── database.py (НОВЫЙ - работа с БД)
```

### 3.2 Оркестратор (`orchestrator.py`)

```python
from typing import List, Dict, Any
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import Send

from .state import OrchestratorState, LanguageSearchState
from .language_agents import create_language_search_queries, search_news_in_language
from .sentiment_analyzer import analyze_articles_sentiment
from .digest_generator import generate_digest
from .database import save_articles_to_db, get_uncovered_languages

def orchestrator_node(state: OrchestratorState) -> Dict[str, Any]:
    """Главный оркестратор - управляет всем процессом"""
    
    # Определяем какие языки нужно проверить
    if state["search_mode"] == "all_languages":
        # Получаем все языки из БД, которые давно не проверялись
        languages_to_check = get_uncovered_languages(hours_threshold=24)
    elif state["search_mode"] == "specific_languages":
        languages_to_check = state["target_languages"]
    else:  # regions
        languages_to_check = get_languages_by_regions(state["target_regions"])
    
    # Создаем задачи для параллельного поиска
    search_tasks = []
    for lang_code in languages_to_check:
        search_tasks.append(
            Send(
                "language_search",
                {
                    "language_code": lang_code,
                    "language_name": LANGUAGE_NAMES[lang_code],
                    "search_queries": [],  # будут созданы в language_search
                    "articles_found": [],
                    "search_completed": False
                }
            )
        )
    
    return {
        "active_searches": {lang: {} for lang in languages_to_check},
        "messages": [HumanMessage(content=f"Запускаю поиск по {len(languages_to_check)} языкам...")]
    }

def should_generate_digest(state: OrchestratorState) -> bool:
    """Проверяем, все ли поиски завершены"""
    return all(
        search.get("search_completed", False) 
        for search in state["active_searches"].values()
    )

def aggregate_results(state: OrchestratorState) -> Dict[str, Any]:
    """Собираем все результаты поиска"""
    all_articles = []
    
    for lang_code, search_state in state["active_searches"].items():
        all_articles.extend(search_state.get("articles_found", []))
    
    # Сохраняем в БД
    save_articles_to_db(all_articles)
    
    # Группируем по тональности
    positive = [a for a in all_articles if a["sentiment"] == "positive"]
    negative = [a for a in all_articles if a["sentiment"] == "negative"]
    neutral = [a for a in all_articles if a["sentiment"] == "neutral"]
    
    return {
        "all_articles": all_articles,
        "positive_articles": positive,
        "negative_articles": negative,
        "neutral_articles": neutral,
        "messages": [HumanMessage(
            content=f"Найдено статей: {len(all_articles)} "
            f"(позитивных: {len(positive)}, негативных: {len(negative)})"
        )]
    }

def create_orchestrator_graph():
    """Создаем граф оркестратора"""
    graph = StateGraph(OrchestratorState)
    
    # Узлы
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("language_search", search_news_in_language)
    graph.add_node("aggregate_results", aggregate_results)
    graph.add_node("sentiment_analysis", analyze_articles_sentiment)
    graph.add_node("generate_positive_digest", generate_positive_digest)
    graph.add_node("generate_negative_digest", generate_negative_digest)
    # Убрали send_notifications по запросу пользователя
    
    # Связи
    graph.set_entry_point("orchestrator")
    graph.add_edge("orchestrator", "language_search")
    graph.add_conditional_edges(
        "language_search",
        should_generate_digest,
        {
            True: "aggregate_results",
            False: "language_search"
        }
    )
    graph.add_edge("aggregate_results", "sentiment_analysis")
    graph.add_edge("sentiment_analysis", "generate_positive_digest")
    graph.add_edge("generate_positive_digest", "generate_negative_digest")
    graph.add_edge("generate_negative_digest", END)
    
    return graph.compile()
```

### 3.3 Языковые агенты (`language_agents.py`)

```python
import asyncio
from typing import Dict, List, Any
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from google import genai

from .state import LanguageSearchState, ArticleInfo
from .press_prompts import MULTI_LANGUAGE_SEARCH_PROMPT, ARTICLE_EXTRACTION_PROMPT
from .utils import clean_url

# Словарь переводов слова "Азербайджан" на разные языки
AZERBAIJAN_TRANSLATIONS = {
    "en": ["Azerbaijan", "Azerbaijani", "Azeri", "Baku"],
    "ru": ["Азербайджан", "азербайджанский", "азербайджанец", "Баку"],
    "tr": ["Azerbaycan", "Azeri", "Azerbaycanlı", "Bakü"],
    "ar": ["أذربيجان", "أذربيجاني", "باكو"],
    "zh": ["阿塞拜疆", "阿塞拜疆人", "巴库"],
    "ja": ["アゼルバイジャン", "アゼルバイジャン人", "バクー"],
    "ko": ["아제르바이잔", "아제르바이잔인", "바쿠"],
    "de": ["Aserbaidschan", "aserbaidschanisch", "Aserbaidschaner", "Baku"],
    "fr": ["Azerbaïdjan", "azerbaïdjanais", "Bakou"],
    "es": ["Azerbaiyán", "azerbaiyano", "Bakú"],
    "pt": ["Azerbaijão", "azerbaijano", "Baku"],
    "it": ["Azerbaigian", "azerbaigiano", "Baku"],
    "hi": ["अज़रबैजान", "अज़रबैजानी", "बाकू"],
    "fa": ["آذربایجان", "آذربایجانی", "باکو"],
    "he": ["אזרבייג'ן", "אזרבייג'ני", "באקו"],
    "is": ["Aserbaídsjan", "aserbaídsjanskt", "Bakú"],
    "sw": ["Azabajani", "Mwazabajani", "Baku"],
    "am": ["አዘርባይጃን", "አዘርባይጃናዊ", "ባኩ"],
    # Добавить все остальные языки...
}

async def create_language_search_queries(
    language_code: str, 
    language_name: str,
    model: ChatGoogleGenerativeAI
) -> List[str]:
    """Создает поисковые запросы для конкретного языка"""
    
    azerbaijan_terms = AZERBAIJAN_TRANSLATIONS.get(language_code, ["Azerbaijan"])
    
    prompt = MULTI_LANGUAGE_SEARCH_PROMPT.format(
        language_name=language_name,
        language_code=language_code,
        azerbaijan_terms=", ".join(azerbaijan_terms),
        current_date=datetime.now().strftime("%Y-%m-%d")
    )
    
    response = await model.ainvoke(prompt)
    
    # Парсим ответ и извлекаем запросы
    queries = []
    for line in response.content.split("\n"):
        if line.strip() and not line.startswith("#"):
            queries.append(line.strip())
    
    return queries[:5]  # Максимум 5 запросов на язык

async def search_news_in_language(state: LanguageSearchState) -> Dict[str, Any]:
    """Поиск новостей на конкретном языке"""
    
    client = genai.Client()
    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    
    # Создаем поисковые запросы если их еще нет
    if not state["search_queries"]:
        queries = await create_language_search_queries(
            state["language_code"],
            state["language_name"],
            model
        )
        state["search_queries"] = queries
    
    articles_found = []
    
    # Выполняем поиск по каждому запросу
    for query in state["search_queries"]:
        try:
            # Добавляем языковой фильтр к запросу
            language_filtered_query = f"{query} language:{state['language_code']}"
            
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=language_filtered_query,
                config={
                    "tools": [{"google_search": {}}],
                    "temperature": 0.7,
                }
            )
            
            # Извлекаем статьи из результатов
            if response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'grounding_metadata'):
                        for source in candidate.grounding_metadata.grounding_sources:
                            article = await extract_article_info(
                                source,
                                state["language_code"],
                                state["language_name"],
                                model
                            )
                            if article:
                                articles_found.append(article)
        
        except Exception as e:
            print(f"Ошибка при поиске на {state['language_name']}: {e}")
            continue
        
        # Небольшая задержка между запросами
        await asyncio.sleep(1)
    
    return {
        "articles_found": articles_found,
        "search_completed": True,
        "active_searches": {
            state["language_code"]: {
                **state,
                "articles_found": articles_found,
                "search_completed": True
            }
        }
    }

async def extract_article_info(
    source: Any,
    language_code: str,
    language_name: str,
    model: ChatGoogleGenerativeAI
) -> Optional[ArticleInfo]:
    """Извлекает информацию о статье"""
    
    try:
        # Базовая информация
        url = clean_url(source.uri)
        title = source.title or "Без названия"
        
        # Определяем источник и страну
        source_info = extract_source_info(url)
        
        # Получаем контент статьи
        content = source.text or ""
        
        # Анализируем статью
        prompt = ARTICLE_EXTRACTION_PROMPT.format(
            title=title,
            content=content[:3000],  # Ограничиваем размер
            language_name=language_name,
            azerbaijan_terms=", ".join(AZERBAIJAN_TRANSLATIONS.get(language_code, ["Azerbaijan"]))
        )
        
        analysis = await model.ainvoke(prompt)
        parsed_analysis = parse_article_analysis(analysis.content)
        
        return ArticleInfo(
            url=url,
            title=title,
            source_name=source_info["name"],
            source_country=source_info["country"],
            source_language=language_code,
            language_name=language_name,
            published_date=extract_date(source),
            original_content=content,
            translated_content=None,  # Будет добавлено позже если нужно
            summary=parsed_analysis["summary"],
            sentiment="neutral",  # Будет определено в sentiment_analyzer
            sentiment_score=0.0,
            sentiment_explanation="",
            key_phrases=parsed_analysis["key_phrases"],
            mentions_context=parsed_analysis["mentions"]
        )
        
    except Exception as e:
        print(f"Ошибка извлечения статьи: {e}")
        return None
```

### 3.4 Анализатор тональности (`sentiment_analyzer.py`)

```python
from typing import Dict, List, Any
from langchain_google_genai import ChatGoogleGenerativeAI

from .state import OrchestratorState, ArticleInfo
from .press_prompts import SENTIMENT_ANALYSIS_PROMPT
from .tools_and_schemas import SentimentAnalysis

async def analyze_articles_sentiment(state: OrchestratorState) -> Dict[str, Any]:
    """Анализирует тональность всех найденных статей"""
    
    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-pro-preview-05-06",
        temperature=0.3
    )
    
    analyzed_articles = []
    
    for article in state["all_articles"]:
        # Если статья не на английском, сначала переводим
        content_to_analyze = article["original_content"]
        if article["source_language"] != "en" and state.get("translation_enabled", True):
            content_to_analyze = await translate_content(
                article["original_content"],
                article["source_language"],
                model
            )
            article["translated_content"] = content_to_analyze
        
        # Анализируем тональность
        prompt = SENTIMENT_ANALYSIS_PROMPT.format(
            title=article["title"],
            content=content_to_analyze[:3000],
            summary=article["summary"],
            mentions=article["mentions_context"]
        )
        
        response = await model.ainvoke(
            prompt,
            output_parser=SentimentAnalysis
        )
        
        # Обновляем информацию о статье
        article["sentiment"] = response.sentiment
        article["sentiment_score"] = response.score
        article["sentiment_explanation"] = response.explanation
        article["key_phrases"].extend(response.key_phrases)
        
        analyzed_articles.append(article)
    
    # Группируем по тональности
    positive = [a for a in analyzed_articles if a["sentiment"] == "positive"]
    negative = [a for a in analyzed_articles if a["sentiment"] == "negative"]
    neutral = [a for a in analyzed_articles if a["sentiment"] == "neutral"]
    
    return {
        "all_articles": analyzed_articles,
        "positive_articles": positive,
        "negative_articles": negative,
        "neutral_articles": neutral,
        "messages": state["messages"] + [
            HumanMessage(content=f"Анализ тональности завершен. "
                               f"Позитивных: {len(positive)}, "
                               f"Негативных: {len(negative)}, "
                               f"Нейтральных: {len(neutral)}")
        ]
    }

async def translate_content(
    content: str,
    source_language: str,
    model: ChatGoogleGenerativeAI
) -> str:
    """Переводит контент на английский"""
    
    prompt = f"""Translate the following text from {source_language} to English.
    Preserve the meaning and tone as accurately as possible.
    
    Text:
    {content[:3000]}
    
    Translation:"""
    
    response = await model.ainvoke(prompt)
    return response.content
```

### 3.5 Генератор дайджестов (`digest_generator.py`)

```python
from typing import Dict, List, Any
from datetime import datetime
from collections import defaultdict
from langchain_google_genai import ChatGoogleGenerativeAI

from .state import OrchestratorState
from .press_prompts import DIGEST_GENERATION_PROMPT
from .database import save_digest_to_db

async def generate_positive_digest(state: OrchestratorState) -> Dict[str, Any]:
    """Генерирует позитивный дайджест"""
    
    if not state["positive_articles"]:
        return {
            "positive_digest": "Позитивных статей не найдено.",
            "digest_generated": True
        }
    
    digest = await generate_digest(
        articles=state["positive_articles"],
        digest_type="positive",
        model=ChatGoogleGenerativeAI(model="gemini-2.5-pro-preview-05-06")
    )
    
    # Сохраняем в БД
    save_digest_to_db(digest, "positive", state["positive_articles"])
    
    return {
        "positive_digest": digest,
        "messages": state["messages"] + [
            HumanMessage(content="Позитивный дайджест сгенерирован")
        ]
    }

async def generate_negative_digest(state: OrchestratorState) -> Dict[str, Any]:
    """Генерирует негативный дайджест"""
    
    if not state["negative_articles"]:
        return {
            "negative_digest": "Негативных статей не найдено.",
            "digest_generated": True
        }
    
    digest = await generate_digest(
        articles=state["negative_articles"],
        digest_type="negative",
        model=ChatGoogleGenerativeAI(model="gemini-2.5-pro-preview-05-06")
    )
    
    # Сохраняем в БД
    save_digest_to_db(digest, "negative", state["negative_articles"])
    
    return {
        "negative_digest": digest,
        "digest_generated": True,
        "messages": state["messages"] + [
            HumanMessage(content="Негативный дайджест сгенерирован")
        ]
    }

async def generate_digest(
    articles: List[ArticleInfo],
    digest_type: str,
    model: ChatGoogleGenerativeAI
) -> str:
    """Генерирует дайджест из статей"""
    
    # Группируем статьи по регионам и языкам
    articles_by_region = defaultdict(list)
    articles_by_language = defaultdict(int)
    
    for article in articles:
        region = get_region_by_language(article["source_language"])
        articles_by_region[region].append(article)
        articles_by_language[article["language_name"]] += 1
    
    # Извлекаем ключевые темы
    all_topics = []
    for article in articles:
        all_topics.extend(article.get("topics", []))
    
    key_themes = list(set(all_topics))[:10]  # Топ-10 тем
    
    # Формируем данные для промпта
    articles_data = []
    for region, region_articles in articles_by_region.items():
        articles_data.append({
            "region": region,
            "articles": [
                {
                    "title": a["title"],
                    "source": f"{a['source_name']} ({a['source_country']})",
                    "language": a["language_name"],
                    "summary": a["summary"],
                    "sentiment_explanation": a["sentiment_explanation"],
                    "url": a["url"]
                }
                for a in region_articles[:5]  # Максимум 5 статей на регион
            ]
        })
    
    prompt = DIGEST_GENERATION_PROMPT.format(
        digest_type=digest_type,
        total_articles=len(articles),
        languages_count=len(articles_by_language),
        languages_list=", ".join(articles_by_language.keys()),
        regions_count=len(articles_by_region),
        articles_by_region=articles_data,
        key_themes=key_themes,
        date=datetime.now().strftime("%Y-%m-%d")
    )
    
    response = await model.ainvoke(prompt)
    return response.content

def get_region_by_language(language_code: str) -> str:
    """Определяет регион по коду языка"""
    
    LANGUAGE_REGIONS = {
        # Европа
        "en": "Europe/Global",
        "de": "Europe",
        "fr": "Europe/Global", 
        "es": "Europe/Latin America",
        "it": "Europe",
        "pt": "Europe/Latin America",
        "ru": "Europe/Asia",
        "pl": "Europe",
        "uk": "Europe",
        "ro": "Europe",
        "nl": "Europe",
        "el": "Europe",
        "hu": "Europe",
        "cs": "Europe",
        "sv": "Europe",
        "da": "Europe",
        "fi": "Europe",
        "no": "Europe",
        "is": "Europe",
        "et": "Europe",
        "lv": "Europe",
        "lt": "Europe",
        "bg": "Europe",
        "hr": "Europe",
        "sr": "Europe",
        "sk": "Europe",
        "sl": "Europe",
        
        # Азия
        "zh": "Asia",
        "ja": "Asia",
        "ko": "Asia",
        "hi": "Asia",
        "bn": "Asia",
        "ur": "Asia",
        "fa": "Asia",
        "ar": "Middle East",
        "he": "Middle East",
        "tr": "Asia/Europe",
        "th": "Asia",
        "vi": "Asia",
        "id": "Asia",
        "ms": "Asia",
        "tl": "Asia",
        "my": "Asia",
        "km": "Asia",
        "lo": "Asia",
        "ne": "Asia",
        "si": "Asia",
        "ka": "Asia",
        "hy": "Asia",
        "az": "Asia",
        "kk": "Asia",
        "ky": "Asia",
        "uz": "Asia",
        "tg": "Asia",
        "mn": "Asia",
        
        # Африка
        "sw": "Africa",
        "am": "Africa",
        "yo": "Africa",
        "zu": "Africa",
        "xh": "Africa",
        "af": "Africa",
        
        # Америка
        "qu": "South America",
        "gn": "South America",
        "ay": "South America",
        "ht": "Caribbean",
    }
    
    return LANGUAGE_REGIONS.get(language_code, "Other")
```

### 3.6 Временной аналитический агент (`temporal_analytics.py`)

```python
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import pandas as pd
from langchain_google_genai import ChatGoogleGenerativeAI

from .state import TemporalAnalyticsState
from .database import get_historical_articles, get_sentiment_trends
from .press_prompts import TEMPORAL_ANALYSIS_PROMPT, TREND_COMPARISON_PROMPT

class TemporalAnalyticsAgent:
    """Агент для анализа изменений во времени по странам и регионам"""
    
    def __init__(self):
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.5-pro-preview-05-06",
            temperature=0.3
        )
    
    async def analyze_temporal_changes(
        self,
        country: Optional[str] = None,
        region: Optional[str] = None,
        time_period_days: int = 30,
        comparison_periods: List[int] = [7, 30, 90]
    ) -> Dict[str, Any]:
        """Анализирует изменения тональности во времени"""
        
        # Получаем исторические данные
        historical_data = await get_historical_articles(
            country=country,
            region=region,
            days_back=max(comparison_periods)
        )
        
        # Анализируем тренды по периодам
        trends = {}
        for period in comparison_periods:
            trends[f"{period}_days"] = await self._analyze_period(
                historical_data,
                period,
                country,
                region
            )
        
        # Детальный анализ последнего периода
        detailed_analysis = await self._detailed_temporal_analysis(
            historical_data,
            time_period_days
        )
        
        # Прогнозирование трендов
        predictions = await self._predict_trends(trends, detailed_analysis)
        
        return {
            "country": country,
            "region": region,
            "trends": trends,
            "detailed_analysis": detailed_analysis,
            "predictions": predictions,
            "generated_at": datetime.now()
        }
    
    async def _analyze_period(
        self,
        articles: List[Dict],
        period_days: int,
        country: Optional[str],
        region: Optional[str]
    ) -> Dict[str, Any]:
        """Анализирует конкретный период"""
        
        cutoff_date = datetime.now() - timedelta(days=period_days)
        period_articles = [
            a for a in articles 
            if a["published_date"] >= cutoff_date
        ]
        
        # Подсчет метрик
        total = len(period_articles)
        positive = len([a for a in period_articles if a["sentiment"] == "positive"])
        negative = len([a for a in period_articles if a["sentiment"] == "negative"])
        neutral = len([a for a in period_articles if a["sentiment"] == "neutral"])
        
        # Расчет процентных изменений
        positive_pct = (positive / total * 100) if total > 0 else 0
        negative_pct = (negative / total * 100) if total > 0 else 0
        
        # Группировка по темам
        topics_count = defaultdict(int)
        for article in period_articles:
            for topic in article.get("topics", []):
                topics_count[topic] += 1
        
        # Топ темы
        top_topics = sorted(
            topics_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        return {
            "period_days": period_days,
            "total_articles": total,
            "sentiment_breakdown": {
                "positive": positive,
                "negative": negative,
                "neutral": neutral,
                "positive_percentage": positive_pct,
                "negative_percentage": negative_pct
            },
            "top_topics": top_topics,
            "daily_average": total / period_days if period_days > 0 else 0
        }
    
    async def _detailed_temporal_analysis(
        self,
        articles: List[Dict],
        period_days: int
    ) -> Dict[str, Any]:
        """Детальный анализ с разбивкой по дням/неделям"""
        
        cutoff_date = datetime.now() - timedelta(days=period_days)
        period_articles = [
            a for a in articles 
            if a["published_date"] >= cutoff_date
        ]
        
        # Группировка по дням
        daily_sentiment = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0})
        
        for article in period_articles:
            day_key = article["published_date"].strftime("%Y-%m-%d")
            sentiment = article["sentiment"]
            daily_sentiment[day_key][sentiment] += 1
        
        # Поиск точек изменения тренда
        trend_changes = await self._identify_trend_changes(daily_sentiment)
        
        # Анализ причин изменений
        change_reasons = await self._analyze_change_reasons(
            period_articles,
            trend_changes
        )
        
        return {
            "daily_sentiment": dict(daily_sentiment),
            "trend_changes": trend_changes,
            "change_reasons": change_reasons,
            "volatility_score": self._calculate_volatility(daily_sentiment)
        }
    
    async def _identify_trend_changes(
        self,
        daily_sentiment: Dict[str, Dict[str, int]]
    ) -> List[Dict[str, Any]]:
        """Определяет точки изменения трендов"""
        
        changes = []
        dates = sorted(daily_sentiment.keys())
        
        for i in range(1, len(dates)):
            prev_date = dates[i-1]
            curr_date = dates[i]
            
            prev_sentiment = daily_sentiment[prev_date]
            curr_sentiment = daily_sentiment[curr_date]
            
            # Вычисляем изменение в процентах
            prev_positive_ratio = prev_sentiment["positive"] / max(sum(prev_sentiment.values()), 1)
            curr_positive_ratio = curr_sentiment["positive"] / max(sum(curr_sentiment.values()), 1)
            
            change_pct = (curr_positive_ratio - prev_positive_ratio) * 100
            
            # Если изменение больше 20%, фиксируем
            if abs(change_pct) > 20:
                changes.append({
                    "date": curr_date,
                    "change_percentage": change_pct,
                    "direction": "improvement" if change_pct > 0 else "deterioration",
                    "from_sentiment": prev_sentiment,
                    "to_sentiment": curr_sentiment
                })
        
        return changes
    
    async def _analyze_change_reasons(
        self,
        articles: List[Dict],
        trend_changes: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Анализирует причины изменения трендов"""
        
        reasons = []
        
        for change in trend_changes:
            change_date = datetime.strptime(change["date"], "%Y-%m-%d")
            
            # Находим статьи около даты изменения (±2 дня)
            relevant_articles = [
                a for a in articles
                if abs((a["published_date"] - change_date).days) <= 2
            ]
            
            # Анализируем через LLM
            if relevant_articles:
                articles_summary = "\n".join([
                    f"- {a['title']} ({a['sentiment']}): {a['summary']}"
                    for a in relevant_articles[:10]
                ])
                
                prompt = TREND_COMPARISON_PROMPT.format(
                    date=change["date"],
                    change_direction=change["direction"],
                    change_percentage=change["change_percentage"],
                    articles_summary=articles_summary
                )
                
                analysis = await self.model.ainvoke(prompt)
                
                reasons.append({
                    "date": change["date"],
                    "change": change,
                    "likely_reasons": analysis.content,
                    "supporting_articles": len(relevant_articles)
                })
        
        return reasons
    
    def _calculate_volatility(self, daily_sentiment: Dict[str, Dict[str, int]]) -> float:
        """Рассчитывает волатильность тональности"""
        
        if len(daily_sentiment) < 2:
            return 0.0
        
        # Вычисляем ежедневные positive ratios
        daily_ratios = []
        for sentiment in daily_sentiment.values():
            total = sum(sentiment.values())
            if total > 0:
                daily_ratios.append(sentiment["positive"] / total)
        
        if not daily_ratios:
            return 0.0
        
        # Стандартное отклонение как мера волатильности
        mean_ratio = sum(daily_ratios) / len(daily_ratios)
        variance = sum((r - mean_ratio) ** 2 for r in daily_ratios) / len(daily_ratios)
        
        return variance ** 0.5
    
    async def _predict_trends(
        self,
        historical_trends: Dict[str, Any],
        detailed_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Прогнозирует будущие тренды"""
        
        # Подготавливаем данные для анализа
        trend_summary = {
            "7_day_trend": historical_trends["7_days"]["sentiment_breakdown"],
            "30_day_trend": historical_trends["30_days"]["sentiment_breakdown"],
            "90_day_trend": historical_trends["90_days"]["sentiment_breakdown"],
            "volatility": detailed_analysis["volatility_score"],
            "recent_changes": detailed_analysis["trend_changes"][-3:] if detailed_analysis["trend_changes"] else []
        }
        
        prompt = f"""Based on the following sentiment trends for Azerbaijan coverage:

7-day trend: {trend_summary['7_day_trend']}
30-day trend: {trend_summary['30_day_trend']}
90-day trend: {trend_summary['90_day_trend']}
Volatility score: {trend_summary['volatility']}
Recent changes: {trend_summary['recent_changes']}

Predict:
1. Likely sentiment trend for next 7 days
2. Likely sentiment trend for next 30 days
3. Key factors that could influence the trend
4. Confidence level (low/medium/high)

Format as JSON."""

        prediction = await self.model.ainvoke(prompt)
        
        return {
            "next_7_days": "improving/stable/declining",
            "next_30_days": "improving/stable/declining", 
            "influencing_factors": ["factor1", "factor2"],
            "confidence": "medium",
            "raw_prediction": prediction.content
        }

async def create_temporal_analysis_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """Узел для временного анализа в графе"""
    
    agent = TemporalAnalyticsAgent()
    
    # Анализируем по всем странам с достаточным количеством данных
    countries_to_analyze = await get_countries_with_sufficient_data(
        min_articles=50,
        days_back=90
    )
    
    temporal_analyses = {}
    
    for country in countries_to_analyze[:10]:  # Топ 10 стран
        analysis = await agent.analyze_temporal_changes(
            country=country,
            time_period_days=30,
            comparison_periods=[7, 30, 90]
        )
        temporal_analyses[country] = analysis
    
    # Также делаем региональный анализ
    regional_analyses = {}
    regions = ["Asia", "Europe", "Middle East", "Americas", "Africa"]
    
    for region in regions:
        analysis = await agent.analyze_temporal_changes(
            region=region,
            time_period_days=30,
            comparison_periods=[7, 30, 90]
        )
        regional_analyses[region] = analysis
    
    return {
        "temporal_analyses": {
            "by_country": temporal_analyses,
            "by_region": regional_analyses,
            "generated_at": datetime.now()
        },
        "messages": state["messages"] + [
            HumanMessage(content=f"Temporal analysis completed for {len(temporal_analyses)} countries and {len(regional_analyses)} regions")
        ]
    }

# Добавляем в граф оркестратора
def create_enhanced_orchestrator_graph():
    """Создаем улучшенный граф с временным анализом"""
    
    graph = StateGraph(OrchestratorState)
    
    # Существующие узлы...
    graph.add_node("orchestrator", orchestrator_node)
    graph.add_node("language_search", search_news_in_language)
    graph.add_node("aggregate_results", aggregate_results)
    graph.add_node("sentiment_analysis", analyze_articles_sentiment)
    graph.add_node("temporal_analysis", create_temporal_analysis_node)  # НОВЫЙ
    graph.add_node("generate_positive_digest", generate_positive_digest)
    graph.add_node("generate_negative_digest", generate_negative_digest)
    
    # Обновленные связи
    graph.add_edge("sentiment_analysis", "temporal_analysis")
    graph.add_edge("temporal_analysis", "generate_positive_digest")
    
    return graph.compile()
```

### 3.7 Обновления для схем временного анализа в `state.py`

```python
class TemporalAnalyticsState(TypedDict):
    """Состояние для временного анализа"""
    country: Optional[str]
    region: Optional[str]
    time_periods: List[int]  # [7, 30, 90] дней
    sentiment_trends: Dict[str, Dict[str, float]]  # период -> тренды
    volatility_scores: Dict[str, float]
    trend_predictions: Dict[str, str]
    significant_events: List[Dict[str, Any]]
    comparison_data: Dict[str, Any]
```

## 🔄 ФАЗА 4: ИНТЕГРАЦИЯ С FRONTEND (День 8-9)

### 4.1 Обновление `app.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from langgraph.graph import StateGraph
from typing import Literal

from .graph import create_graph  # существующий граф
from .press_monitor_graph import create_press_monitor_graph  # новый граф

# Создаем оба графа
research_graph = create_graph()
press_monitor_graph = create_press_monitor_graph()

# Обновляем langgraph.json для поддержки обоих графов
LANGGRAPH_CONFIG = {
    "graphs": {
        "research_agent": {
            "graph": research_graph,
            "description": "Original research agent"
        },
        "press_monitor": {
            "graph": press_monitor_graph,
            "description": "Azerbaijan press monitoring agent"
        }
    }
}

# Добавляем новые эндпоинты
@app.post("/api/press-monitor/start")
async def start_press_monitoring(
    mode: Literal["all_languages", "specific_languages", "regions"],
    languages: Optional[List[str]] = None,
    regions: Optional[List[str]] = None
):
    """Запускает мониторинг прессы"""
    
    config = {
        "configurable": {
            "search_mode": mode,
            "target_languages": languages,
            "target_regions": regions,
            "translation_enabled": True,
            "max_articles_per_language": 10
        }
    }
    
    # Запускаем граф
    result = await press_monitor_graph.ainvoke(
        {"messages": [HumanMessage(content="Start press monitoring")]},
        config=config
    )
    
    return {
        "status": "started",
        "mode": mode,
        "result": result
    }

@app.get("/api/press-monitor/latest-digest")
async def get_latest_digest(digest_type: Literal["positive", "negative", "both"]):
    """Получает последний дайджест"""
    
    if digest_type == "both":
        positive = get_latest_digest_from_db("positive")
        negative = get_latest_digest_from_db("negative")
        return {
            "positive": positive,
            "negative": negative
        }
    else:
        digest = get_latest_digest_from_db(digest_type)
        return {"digest": digest}

@app.get("/api/press-monitor/statistics")
async def get_statistics():
    """Получает статистику мониторинга"""
    
    stats = get_monitoring_statistics()
    return stats
```

### 4.2 Обновление React компонентов

```typescript
// frontend/src/components/PressMonitor.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PressMonitorProps {
  onStartMonitoring: (mode: string, options?: any) => void;
}

export const PressMonitor: React.FC<PressMonitorProps> = ({ onStartMonitoring }) => {
  const [mode, setMode] = useState<'all_languages' | 'specific_languages' | 'regions'>('all_languages');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Russian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'hi', name: 'Hindi' },
    { code: 'fa', name: 'Persian' },
    { code: 'he', name: 'Hebrew' },
    { code: 'is', name: 'Icelandic' },
    { code: 'sw', name: 'Swahili' },
    { code: 'am', name: 'Amharic' },
    // ... добавить все языки
  ];
  
  const regions = [
    'Europe',
    'Asia', 
    'Middle East',
    'Africa',
    'North America',
    'South America',
    'Oceania'
  ];
  
  const handleStart = () => {
    const options: any = {};
    
    if (mode === 'specific_languages') {
      options.languages = selectedLanguages;
    } else if (mode === 'regions') {
      options.regions = selectedRegions;
    }
    
    onStartMonitoring(mode, options);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🌍 Azerbaijan Press Monitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Monitoring Mode
            </label>
            <Select value={mode} onValueChange={(value: any) => setMode(value)}>
              <option value="all_languages">All Languages (Global Coverage)</option>
              <option value="specific_languages">Specific Languages</option>
              <option value="regions">By Regions</option>
            </Select>
          </div>
          
          {mode === 'specific_languages' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Languages
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {languages.map(lang => (
                  <label key={lang.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={lang.code}
                      checked={selectedLanguages.includes(lang.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLanguages([...selectedLanguages, lang.code]);
                        } else {
                          setSelectedLanguages(selectedLanguages.filter(l => l !== lang.code));
                        }
                      }}
                    />
                    <span className="text-sm">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {mode === 'regions' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Regions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {regions.map(region => (
                  <label key={region} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={region}
                      checked={selectedRegions.includes(region)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRegions([...selectedRegions, region]);
                        } else {
                          setSelectedRegions(selectedRegions.filter(r => r !== region));
                        }
                      }}
                    />
                    <span className="text-sm">{region}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            onClick={handleStart}
            className="w-full"
            disabled={
              (mode === 'specific_languages' && selectedLanguages.length === 0) ||
              (mode === 'regions' && selectedRegions.length === 0)
            }
          >
            🚀 Start Monitoring
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// frontend/src/components/DigestView.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';

interface DigestViewProps {
  positiveDigest: string | null;
  negativeDigest: string | null;
  statistics: any;
}

export const DigestView: React.FC<DigestViewProps> = ({ 
  positiveDigest, 
  negativeDigest, 
  statistics 
}) => {
  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📊 Monitoring Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{statistics.totalArticles}</div>
              <div className="text-sm text-gray-600">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statistics.positiveCount}</div>
              <div className="text-sm text-gray-600">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statistics.negativeCount}</div>
              <div className="text-sm text-gray-600">Negative</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{statistics.languagesCount}</div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="positive" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="positive">
            ✅ Positive Digest ({statistics.positiveCount})
          </TabsTrigger>
          <TabsTrigger value="negative">
            ❌ Negative Digest ({statistics.negativeCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="positive">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">Positive Press Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              {positiveDigest ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{positiveDigest}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500">No positive articles found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="negative">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Negative Press Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              {negativeDigest ? (
                <div className="prose max-w-none">
                  <ReactMarkdown>{negativeDigest}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500">No negative articles found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// frontend/src/components/TemporalAnalytics.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TemporalAnalyticsProps {
  temporalData: any;
  selectedCountry?: string;
  selectedRegion?: string;
}

export const TemporalAnalytics: React.FC<TemporalAnalyticsProps> = ({ 
  temporalData, 
  selectedCountry,
  selectedRegion 
}) => {
  const formatChartData = (data: any) => {
    // Преобразуем данные для графика
    const dailySentiment = data.detailed_analysis?.daily_sentiment || {};
    return Object.entries(dailySentiment).map(([date, sentiment]: [string, any]) => ({
      date,
      positive: sentiment.positive,
      negative: sentiment.negative,
      neutral: sentiment.neutral,
      positiveRatio: sentiment.positive / (sentiment.positive + sentiment.negative + sentiment.neutral) * 100
    }));
  };

  const renderTrendIndicator = (trend: string) => {
    const icons = {
      improving: '📈',
      stable: '➡️',
      declining: '📉'
    };
    const colors = {
      improving: 'text-green-600',
      stable: 'text-yellow-600',
      declining: 'text-red-600'
    };
    return (
      <span className={colors[trend] || 'text-gray-600'}>
        {icons[trend] || '❓'} {trend}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Обзор трендов */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Temporal Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <h4 className="font-semibold mb-2">7-Day Trend</h4>
              {renderTrendIndicator(temporalData.trends?.['7_days']?.trend || 'stable')}
              <div className="text-sm text-gray-600 mt-1">
                {temporalData.trends?.['7_days']?.sentiment_breakdown?.positive || 0} positive /
                {temporalData.trends?.['7_days']?.sentiment_breakdown?.negative || 0} negative
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">30-Day Trend</h4>
              {renderTrendIndicator(temporalData.trends?.['30_days']?.trend || 'stable')}
              <div className="text-sm text-gray-600 mt-1">
                {temporalData.trends?.['30_days']?.sentiment_breakdown?.positive || 0} positive /
                {temporalData.trends?.['30_days']?.sentiment_breakdown?.negative || 0} negative
              </div>
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-2">90-Day Trend</h4>
              {renderTrendIndicator(temporalData.trends?.['90_days']?.trend || 'stable')}
              <div className="text-sm text-gray-600 mt-1">
                {temporalData.trends?.['90_days']?.sentiment_breakdown?.positive || 0} positive /
                {temporalData.trends?.['90_days']?.sentiment_breakdown?.negative || 0} negative
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* График тональности */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatChartData(temporalData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="positive" stroke="#22c55e" name="Positive" />
              <Line type="monotone" dataKey="negative" stroke="#ef4444" name="Negative" />
              <Line type="monotone" dataKey="neutral" stroke="#6b7280" name="Neutral" />
              <Line type="monotone" dataKey="positiveRatio" stroke="#3b82f6" name="Positive %" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Прогнозы */}
      <Card>
        <CardHeader>
          <CardTitle>🔮 Future Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Next 7 Days</h4>
              <p className="text-sm">{temporalData.predictions?.next_7_days || 'No prediction available'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Next 30 Days</h4>
              <p className="text-sm">{temporalData.predictions?.next_30_days || 'No prediction available'}</p>
            </div>
            <div>
              <h4 className="font-semibold">Key Influencing Factors</h4>
              <ul className="list-disc list-inside text-sm">
                {(temporalData.predictions?.influencing_factors || []).map((factor: string, idx: number) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Значимые изменения */}
      {temporalData.detailed_analysis?.trend_changes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🔄 Significant Trend Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {temporalData.detailed_analysis.trend_changes.map((change: any, idx: number) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="font-semibold">{change.date}</div>
                  <div className={change.direction === 'improvement' ? 'text-green-600' : 'text-red-600'}>
                    {change.direction} by {Math.abs(change.change_percentage).toFixed(1)}%
                  </div>
                  {temporalData.detailed_analysis.change_reasons?.[idx]?.likely_reasons && (
                    <div className="text-sm text-gray-600 mt-1">
                      {temporalData.detailed_analysis.change_reasons[idx].likely_reasons}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
```

## 🔐 ФАЗА 5: ТЕСТИРОВАНИЕ И ОПТИМИЗАЦИЯ (День 10-12)

### 5.1 Создание тестов

```python
# backend/tests/test_press_monitor.py
import pytest
from unittest.mock import Mock, patch
from agent.orchestrator import orchestrator_node, create_orchestrator_graph
from agent.language_agents import create_language_search_queries, AZERBAIJAN_TRANSLATIONS

@pytest.mark.asyncio
async def test_language_search_queries():
    """Тест создания поисковых запросов для разных языков"""
    
    mock_model = Mock()
    mock_model.ainvoke.return_value = Mock(
        content="Азербайджан новости\nБаку события\nКарабах ситуация"
    )
    
    queries = await create_language_search_queries("ru", "Russian", mock_model)
    
    assert len(queries) > 0
    assert any("Азербайджан" in q for q in queries)

@pytest.mark.asyncio
async def test_orchestrator_all_languages():
    """Тест оркестратора в режиме всех языков"""
    
    state = {
        "search_mode": "all_languages",
        "messages": [],
        "active_searches": {}
    }
    
    with patch('agent.database.get_uncovered_languages') as mock_languages:
        mock_languages.return_value = ["en", "ru", "tr"]
        
        result = orchestrator_node(state)
        
        assert len(result["active_searches"]) == 3
        assert "en" in result["active_searches"]

def test_azerbaijan_translations_coverage():
    """Проверяем покрытие переводов для всех языков"""
    
    required_languages = ["en", "ru", "tr", "ar", "zh", "ja", "ko", "de", "fr", "es", 
                         "pt", "it", "hi", "fa", "he", "is", "sw", "am"]
    
    for lang in required_languages:
        assert lang in AZERBAIJAN_TRANSLATIONS
        assert len(AZERBAIJAN_TRANSLATIONS[lang]) >= 2  # минимум 2 варианта

@pytest.mark.asyncio
async def test_sentiment_analysis():
    """Тест анализа тональности"""
    
    from agent.sentiment_analyzer import analyze_articles_sentiment
    
    state = {
        "all_articles": [
            {
                "title": "Azerbaijan wins international award",
                "original_content": "Azerbaijan has been recognized...",
                "source_language": "en",
                "summary": "Positive news about Azerbaijan",
                "mentions_context": [{"text": "Azerbaijan wins", "context": "achievement"}]
            }
        ],
        "messages": []
    }
    
    with patch('agent.sentiment_analyzer.ChatGoogleGenerativeAI') as mock_model:
        mock_response = Mock()
        mock_response.sentiment = "positive"
        mock_response.score = 0.8
        mock_response.explanation = "Positive achievement"
        mock_response.key_phrases = ["wins", "recognized"]
        
        mock_model.return_value.ainvoke.return_value = mock_response
        
        result = await analyze_articles_sentiment(state)
        
        assert len(result["positive_articles"]) == 1
        assert result["positive_articles"][0]["sentiment"] == "positive"
```

### 5.2 Оптимизация производительности

```python
# backend/src/agent/performance_optimizer.py
import asyncio
from typing import List, Dict, Any
from functools import lru_cache
import aioredis
from datetime import datetime, timedelta

class PerformanceOptimizer:
    """Оптимизация производительности для мониторинга прессы"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self._redis = None
    
    async def get_redis(self):
        if not self._redis:
            self._redis = await aioredis.from_url(self.redis_url)
        return self._redis
    
    @lru_cache(maxsize=1000)
    def get_cached_translation(self, text: str, source_lang: str, target_lang: str) -> str:
        """Кеширование переводов в памяти"""
        cache_key = f"translation:{source_lang}:{target_lang}:{hash(text)}"
        return cache_key
    
    async def batch_process_languages(
        self, 
        languages: List[str], 
        process_func: callable,
        batch_size: int = 5
    ) -> List[Any]:
        """Обработка языков батчами для оптимизации"""
        
        results = []
        for i in range(0, len(languages), batch_size):
            batch = languages[i:i + batch_size]
            batch_tasks = [process_func(lang) for lang in batch]
            batch_results = await asyncio.gather(*batch_tasks)
            results.extend(batch_results)
            
            # Небольшая задержка между батчами
            if i + batch_size < len(languages):
                await asyncio.sleep(2)
        
        return results
    
    async def cache_search_results(self, language: str, results: List[Dict]) -> None:
        """Кеширование результатов поиска"""
        
        redis = await self.get_redis()
        cache_key = f"search_results:{language}:{datetime.now().strftime('%Y-%m-%d')}"
        
        # Сохраняем на 24 часа
        await redis.setex(
            cache_key,
            86400,  # 24 часа
            json.dumps(results)
        )
    
    async def get_cached_search_results(self, language: str) -> Optional[List[Dict]]:
        """Получение закешированных результатов"""
        
        redis = await self.get_redis()
        cache_key = f"search_results:{language}:{datetime.now().strftime('%Y-%m-%d')}"
        
        cached = await redis.get(cache_key)
        if cached:
            return json.loads(cached)
        return None
    
    def should_skip_language(self, language: str, last_checked: datetime) -> bool:
        """Определяет, нужно ли пропустить язык"""
        
        # Пропускаем языки, проверенные менее 6 часов назад
        if datetime.now() - last_checked < timedelta(hours=6):
            return True
        
        # Менее популярные языки проверяем реже
        rare_languages = ['ay', 'gn', 'qu', 'ht']
        if language in rare_languages and datetime.now() - last_checked < timedelta(days=3):
            return True
        
        return False

# Использование в orchestrator.py
optimizer = PerformanceOptimizer()

async def optimized_orchestrator_node(state: OrchestratorState) -> Dict[str, Any]:
    """Оптимизированный оркестратор"""
    
    # Получаем языки для проверки
    all_languages = get_all_languages_from_db()
    
    # Фильтруем языки, которые недавно проверялись
    languages_to_check = []
    for lang in all_languages:
        last_checked = get_language_last_checked(lang)
        if not optimizer.should_skip_language(lang, last_checked):
            languages_to_check.append(lang)
    
    # Обрабатываем языки батчами
    search_tasks = await optimizer.batch_process_languages(
        languages_to_check,
        lambda lang: create_language_search_task(lang),
        batch_size=5
    )
    
    return {
        "active_searches": {lang: {} for lang in languages_to_check},
        "messages": [HumanMessage(
            content=f"Запускаю оптимизированный поиск по {len(languages_to_check)} языкам..."
        )]
    }
```

## 🚀 ФАЗА 6: ДЕПЛОЙ И МОНИТОРИНГ (День 13-14)

### 6.1 Обновление Docker конфигурации

```dockerfile
# Dockerfile (обновленный)
FROM python:3.11-slim as backend-builder

WORKDIR /app/backend

# Установка системных зависимостей для PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY backend/pyproject.toml backend/README.md ./
COPY backend/src ./src

RUN pip install --no-cache-dir .

# Frontend builder остается без изменений
FROM node:20-alpine as frontend-builder
# ... существующий код ...

# Final stage с добавлением cron для периодического мониторинга
FROM python:3.11-slim

# Установка cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

# Копирование backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /app/backend /app/backend

# Копирование frontend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Добавление cron задач
COPY cron/press-monitor-cron /etc/cron.d/press-monitor-cron
RUN chmod 0644 /etc/cron.d/press-monitor-cron
RUN crontab /etc/cron.d/press-monitor-cron

WORKDIR /app/backend

# Запуск cron и сервера
CMD cron && langgraph serve --host 0.0.0.0 --port 8000
```

### 6.2 Cron задачи для периодического мониторинга

```bash
# cron/press-monitor-cron
# Мониторинг всех языков каждые 6 часов
0 */6 * * * cd /app/backend && python -m agent.scheduled_monitor all_languages >> /var/log/press-monitor.log 2>&1

# Ежедневный дайджест в 9:00 UTC
0 9 * * * cd /app/backend && python -m agent.send_daily_digest >> /var/log/daily-digest.log 2>&1

# Еженедельный расширенный отчет по понедельникам
0 10 * * 1 cd /app/backend && python -m agent.send_weekly_report >> /var/log/weekly-report.log 2>&1
```

### 6.3 Скрипт для периодического мониторинга

```python
# backend/src/agent/scheduled_monitor.py
import asyncio
import sys
from datetime import datetime
import logging
from typing import Optional

from .orchestrator import create_orchestrator_graph
from .notification_sender import send_email_digest, send_telegram_digest
from .database import get_email_subscribers, get_telegram_subscribers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_scheduled_monitoring(mode: str = "all_languages"):
    """Запускает плановый мониторинг"""
    
    logger.info(f"Starting scheduled monitoring in {mode} mode at {datetime.now()}")
    
    try:
        # Создаем граф
        graph = create_orchestrator_graph()
        
        # Запускаем мониторинг
        config = {
            "configurable": {
                "search_mode": mode,
                "translation_enabled": True,
                "max_articles_per_language": 10,
                "notification_enabled": True
            }
        }
        
        result = await graph.ainvoke(
            {"messages": [HumanMessage(content="Scheduled press monitoring")]},
            config=config
        )
        
        logger.info(f"Monitoring completed. Found {len(result['all_articles'])} articles")
        
        # Уведомления убраны по запросу пользователя
        # Результаты доступны через frontend
        
    except Exception as e:
        logger.error(f"Error during scheduled monitoring: {e}")
        raise

def extract_statistics(result: Dict[str, Any]) -> Dict[str, Any]:
    """Извлекает статистику из результатов"""
    
    return {
        "total_articles": len(result.get("all_articles", [])),
        "positive_count": len(result.get("positive_articles", [])),
        "negative_count": len(result.get("negative_articles", [])),
        "neutral_count": len(result.get("neutral_articles", [])),
        "languages_covered": len(set(a["source_language"] for a in result.get("all_articles", []))),
        "countries_covered": len(set(a["source_country"] for a in result.get("all_articles", [])))
    }

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all_languages"
    asyncio.run(run_scheduled_monitoring(mode))
```

### 6.4 Frontend API для просмотра результатов

```python
# backend/src/agent/api_endpoints.py
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/press-monitor")

@router.get("/search")
async def search_press(
    country: Optional[str] = None,
    language: Optional[str] = None,
    days_back: int = Query(7, ge=1, le=90),
    sentiment: Optional[str] = None
):
    """Поиск статей по параметрам"""
    
    articles = await get_articles_from_db(
        country=country,
        language=language,
        days_back=days_back,
        sentiment=sentiment
    )
    
    return {
        "articles": articles,
        "total": len(articles),
        "parameters": {
            "country": country,
            "language": language,
            "days_back": days_back,
            "sentiment": sentiment
        }
    }

@router.get("/temporal/{country}")
async def get_temporal_analysis(
    country: str,
    periods: List[int] = Query([7, 30, 90])
):
    """Получить временной анализ для страны"""
    
    agent = TemporalAnalyticsAgent()
    analysis = await agent.analyze_temporal_changes(
        country=country,
        comparison_periods=periods
    )
    
    return analysis

@router.get("/live-monitor")
async def start_live_monitoring(
    mode: str = Query("all_languages"),
    languages: Optional[List[str]] = None,
    regions: Optional[List[str]] = None
):
    """Запустить мониторинг в реальном времени"""
    
    # Запускаем граф мониторинга
    result = await press_monitor_graph.ainvoke(
        {"messages": [HumanMessage(content=f"Monitor {mode}")]},
        config={
            "configurable": {
                "search_mode": mode,
                "target_languages": languages,
                "target_regions": regions
            }
        }
    )
    
    return {
        "status": "completed",
        "statistics": extract_statistics(result),
        "positive_digest": result.get("positive_digest"),
        "negative_digest": result.get("negative_digest"),
        "temporal_analyses": result.get("temporal_analyses")
    }
```

## 📋 ИТОГОВЫЙ ЧЕКЛИСТ РЕФАКТОРИНГА

### ✅ Фаза 1: База данных (День 1-2)
- [ ] Создать SQL миграции для новых таблиц
- [ ] Добавить индексы для оптимизации
- [ ] Заполнить таблицу языков
- [ ] Настроить connection pooling

### ✅ Фаза 2: Расширение State (День 3-4)
- [ ] Обновить state.py с новыми типами
- [ ] Расширить tools_and_schemas.py
- [ ] Добавить валидацию данных
- [ ] Создать helper функции

### ✅ Фаза 3: Новые агенты (День 5-7)
- [ ] Реализовать orchestrator.py
- [ ] Создать language_agents.py
- [ ] Написать sentiment_analyzer.py
- [ ] Разработать digest_generator.py
- [ ] Создать temporal_analytics.py для анализа изменений во времени
- [ ] Обновить промпты

### ✅ Фаза 4: Frontend (День 8-9)
- [ ] Создать PressMonitor компонент
- [ ] Добавить DigestView
- [ ] Создать TemporalAnalytics компонент для визуализации трендов
- [ ] Обновить роутинг
- [ ] Интегрировать с API
- [ ] Добавить интерактивные графики для анализа изменений

### ✅ Фаза 5: Тестирование (День 10-12)
- [ ] Написать unit тесты
- [ ] Создать integration тесты
- [ ] Провести нагрузочное тестирование
- [ ] Оптимизировать производительность

### ✅ Фаза 6: Деплой (День 13-14)
- [ ] Обновить Docker конфигурацию
- [ ] Настроить cron задачи
- [ ] Конфигурировать мониторинг
- [ ] Документировать API

## 🎯 КЛЮЧЕВЫЕ МЕТРИКИ УСПЕХА

1. **Покрытие языков**: 60+ языков мира
2. **Скорость обработки**: < 5 минут на полный цикл мониторинга
3. **Точность классификации**: > 85% правильной тональности
4. **Доступность системы**: 99.9% uptime
5. **Актуальность данных**: обновление каждые 6 часов

## 🔒 БЕЗОПАСНОСТЬ И МАСШТАБИРУЕМОСТЬ

1. **Rate Limiting**: Ограничение запросов к Google API
2. **Кеширование**: Redis для частых запросов
3. **Горизонтальное масштабирование**: Поддержка multiple workers
4. **Мониторинг**: Prometheus + Grafana
5. **Логирование**: Structured logging с correlation IDs

## 🎯 ИТОГОВАЯ АРХИТЕКТУРА СИСТЕМЫ

### Ключевые компоненты:
1. **Multi-Language Press Monitor** - мониторинг прессы на 60+ языках мира
2. **Sentiment Analyzer** - автоматическая классификация тональности статей
3. **Temporal Analytics Agent** - анализ изменений восприятия Азербайджана во времени по странам
4. **Interactive Frontend** - React приложение для просмотра результатов в реальном времени
5. **PostgreSQL + Redis** - хранение истории и кеширование

### Основные возможности:
- ✅ Поиск упоминаний Азербайджана на ВСЕХ языках мира
- ✅ Автоматическая классификация на позитивные/негативные статьи
- ✅ Анализ трендов изменения тональности по странам во времени
- ✅ Интерактивные дайджесты через веб-интерфейс
- ✅ API для интеграции с другими системами
- ✅ Сохранение полной истории для аналитики

### Особый фокус на:
- 🎯 Соседи Азербайджана (Турция, Россия, Иран, Грузия, Армения)
- 🎯 Вся Средняя Азия
- 🎯 Юго-Восточная Азия (Таиланд, Индонезия и др.)
- 🎯 ВСЕ регионы мира без исключения

Этот план обеспечивает плавную трансформацию существующего проекта в мощную систему мониторинга мировой прессы с сохранением всей работающей функциональности и добавлением критически важного временного анализа для отслеживания изменений восприятия Азербайджана в разных странах.