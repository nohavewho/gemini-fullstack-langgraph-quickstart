"""Database operations for Press Monitor"""

import os
import asyncio
import asyncpg
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
from contextlib import asynccontextmanager

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost/pressmonitor")


class DatabaseManager:
    """Manages database connections and operations"""
    
    def __init__(self):
        self.pool = None
    
    async def initialize(self):
        """Initialize connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                DATABASE_URL,
                min_size=2,
                max_size=5,
                command_timeout=10,
                timeout=10
            )
        except Exception as e:
            print(f"⚠️ Database connection failed: {e}")
            print("⚠️ Running without database - results won't be persisted")
            self.pool = None
    
    async def close(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()
    
    @asynccontextmanager
    async def acquire(self):
        """Acquire a connection from the pool"""
        if not self.pool:
            yield None
        else:
            async with self.pool.acquire() as connection:
                yield connection


# Global database manager instance
db_manager = DatabaseManager()


async def save_articles_to_db(articles: List[Dict[str, Any]]) -> None:
    """Save articles to the database"""
    async with db_manager.acquire() as conn:
        if not conn:
            print("⚠️ No database connection - skipping article save")
            return
        # Prepare the insert statement
        insert_query = """
            INSERT INTO press_monitor.press_articles (
                url, title, source_name, source_country, source_language,
                language_name, region, published_date, original_content,
                translated_content, summary, sentiment, sentiment_score,
                sentiment_explanation, key_phrases, mentions_context, topics
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            )
            ON CONFLICT (url) DO UPDATE SET
                sentiment = EXCLUDED.sentiment,
                sentiment_score = EXCLUDED.sentiment_score,
                sentiment_explanation = EXCLUDED.sentiment_explanation,
                fetched_date = NOW()
        """
        
        # Convert articles to tuples for batch insert
        values = []
        for article in articles:
            values.append((
                article['url'],
                article['title'],
                article['source_name'],
                article.get('source_country'),
                article['source_language'],
                article['language_name'],
                article.get('region'),
                article.get('published_date'),
                article['original_content'],
                article.get('translated_content'),
                article['summary'],
                article['sentiment'],
                article['sentiment_score'],
                article.get('sentiment_explanation', ''),
                json.dumps(article.get('key_phrases', [])),
                json.dumps(article.get('mentions_context', [])),
                json.dumps(article.get('topics', []))
            ))
        
        # Execute batch insert
        await conn.executemany(insert_query, values)


async def get_uncovered_languages(hours_threshold: int = 24) -> List[str]:
    """Get languages that haven't been checked recently"""
    async with db_manager.acquire() as conn:
        if not conn:
            return []  # Return empty list if no database
        query = f"""
            SELECT language_code 
            FROM press_monitor.language_coverage 
            WHERE last_checked IS NULL 
               OR last_checked < NOW() - INTERVAL '{hours_threshold} hours'
            ORDER BY last_checked ASC NULLS FIRST
        """
        rows = await conn.fetch(query)
        return [row['language_code'] for row in rows]


async def get_languages_by_regions(regions: List[str]) -> List[str]:
    """Get language codes for specific regions"""
    async with db_manager.acquire() as conn:
        if not conn:
            return []  # Return empty list if no database
        query = """
            SELECT DISTINCT language_code 
            FROM press_monitor.language_coverage 
            WHERE region = ANY($1::text[])
        """
        rows = await conn.fetch(query, regions)
        return [row['language_code'] for row in rows]


async def update_language_checked(language_code: str, articles_found: int) -> None:
    """Update when a language was last checked"""
    async with db_manager.acquire() as conn:
        if not conn:
            return  # Skip if no database
        query = """
            UPDATE press_monitor.language_coverage 
            SET last_checked = NOW(), 
                articles_found = articles_found + $2
            WHERE language_code = $1
        """
        await conn.execute(query, language_code, articles_found)


async def save_digest_to_db(
    digest_content: str, 
    digest_type: str, 
    articles: List[Dict[str, Any]]
) -> None:
    """Save a digest to the database"""
    async with db_manager.acquire() as conn:
        if not conn:
            print("⚠️ No database connection - skipping digest save")
            return
        # Calculate statistics
        languages = list(set(a['source_language'] for a in articles))
        countries = list(set(a['source_country'] for a in articles if a.get('source_country')))
        regions = {}
        for article in articles:
            region = article.get('region', 'Unknown')
            regions[region] = regions.get(region, 0) + 1
        
        # Insert digest
        digest_id = await conn.fetchval("""
            INSERT INTO press_monitor.press_digests (
                digest_type, content, articles_count,
                languages_covered, countries_covered, regions_breakdown
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        """, digest_type, digest_content, len(articles),
            json.dumps({lang: sum(1 for a in articles if a['source_language'] == lang) for lang in languages}),
            json.dumps(countries),
            json.dumps(regions)
        )
        
        # Link articles to digest
        if articles and digest_id:
            article_urls = [a['url'] for a in articles]
            await conn.execute("""
                INSERT INTO press_monitor.article_digest_mapping (article_id, digest_id)
                SELECT a.id, $2
                FROM press_monitor.press_articles a
                WHERE a.url = ANY($1::text[])
            """, article_urls, digest_id)


async def get_historical_articles(
    country: Optional[str] = None,
    region: Optional[str] = None,
    days_back: int = 90
) -> List[Dict[str, Any]]:
    """Get historical articles for analysis"""
    async with db_manager.acquire() as conn:
        query = f"""
            SELECT 
                url, title, source_name, source_country, source_language,
                language_name, region, published_date, summary,
                sentiment, sentiment_score, sentiment_explanation,
                key_phrases, mentions_context, topics
            FROM press_monitor.press_articles
            WHERE published_date >= NOW() - INTERVAL '{days_back} days'
        """
        params = []
        
        if country:
            query += " AND source_country = $1"
            params.append(country)
        elif region:
            query += " AND region = $1"
            params.append(region)
        
        query += " ORDER BY published_date DESC"
        
        rows = await conn.fetch(query, *params)
        
        # Convert to list of dicts
        articles = []
        for row in rows:
            article = dict(row)
            # Parse JSON fields
            article['key_phrases'] = json.loads(article['key_phrases'])
            article['mentions_context'] = json.loads(article['mentions_context'])
            article['topics'] = json.loads(article['topics'])
            articles.append(article)
        
        return articles


async def get_countries_with_sufficient_data(
    min_articles: int = 50,
    days_back: int = 90
) -> List[str]:
    """Get countries with enough articles for temporal analysis"""
    async with db_manager.acquire() as conn:
        if not conn:
            return []  # No database connection
        query = f"""
            SELECT source_country, COUNT(*) as article_count
            FROM press_monitor.press_articles
            WHERE published_date >= NOW() - INTERVAL '{days_back} days'
              AND source_country IS NOT NULL
            GROUP BY source_country
            HAVING COUNT(*) >= $1
            ORDER BY COUNT(*) DESC
        """
        rows = await conn.fetch(query, min_articles)
        return [row['source_country'] for row in rows]


async def get_latest_digest_from_db(digest_type: str) -> Optional[Dict[str, Any]]:
    """Get the latest digest of a specific type"""
    async with db_manager.acquire() as conn:
        query = """
            SELECT id, content, articles_count, languages_covered,
                   countries_covered, regions_breakdown, generated_at
            FROM press_monitor.press_digests
            WHERE digest_type = $1
            ORDER BY generated_at DESC
            LIMIT 1
        """
        row = await conn.fetchrow(query, digest_type)
        
        if row:
            digest = dict(row)
            digest['languages_covered'] = json.loads(digest['languages_covered'])
            digest['countries_covered'] = json.loads(digest['countries_covered'])
            digest['regions_breakdown'] = json.loads(digest['regions_breakdown'])
            return digest
        
        return None


async def get_monitoring_statistics() -> Dict[str, Any]:
    """Get overall monitoring statistics"""
    async with db_manager.acquire() as conn:
        # Get total counts
        total_stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_articles,
                COUNT(DISTINCT source_language) as languages_count,
                COUNT(DISTINCT source_country) as countries_count,
                COUNT(CASE WHEN sentiment = 'positive' THEN 1 END) as positive_count,
                COUNT(CASE WHEN sentiment = 'negative' THEN 1 END) as negative_count,
                COUNT(CASE WHEN sentiment = 'neutral' THEN 1 END) as neutral_count
            FROM press_monitor.press_articles
            WHERE fetched_date >= NOW() - INTERVAL '7 days'
        """)
        
        # Get language breakdown
        language_stats = await conn.fetch("""
            SELECT source_language, language_name, COUNT(*) as count
            FROM press_monitor.press_articles
            WHERE fetched_date >= NOW() - INTERVAL '7 days'
            GROUP BY source_language, language_name
            ORDER BY COUNT(*) DESC
            LIMIT 10
        """)
        
        # Get country breakdown
        country_stats = await conn.fetch("""
            SELECT source_country, COUNT(*) as count
            FROM press_monitor.press_articles
            WHERE fetched_date >= NOW() - INTERVAL '7 days'
              AND source_country IS NOT NULL
            GROUP BY source_country
            ORDER BY COUNT(*) DESC
            LIMIT 10
        """)
        
        return {
            'total_articles': total_stats['total_articles'],
            'languages_count': total_stats['languages_count'],
            'countries_count': total_stats['countries_count'],
            'positive_count': total_stats['positive_count'],
            'negative_count': total_stats['negative_count'],
            'neutral_count': total_stats['neutral_count'],
            'top_languages': [dict(row) for row in language_stats],
            'top_countries': [dict(row) for row in country_stats]
        }


async def get_articles_from_db(
    country: Optional[str] = None,
    language: Optional[str] = None,
    days_back: int = 7,
    sentiment: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Search articles with filters"""
    async with db_manager.acquire() as conn:
        query = f"""
            SELECT * FROM press_monitor.press_articles
            WHERE published_date >= NOW() - INTERVAL '{days_back} days'
        """
        params = []
        param_count = 0
        
        if country:
            param_count += 1
            query += f" AND source_country = ${param_count}"
            params.append(country)
        
        if language:
            param_count += 1
            query += f" AND source_language = ${param_count}"
            params.append(language)
        
        if sentiment:
            param_count += 1
            query += f" AND sentiment = ${param_count}"
            params.append(sentiment)
        
        query += " ORDER BY published_date DESC LIMIT 100"
        
        rows = await conn.fetch(query, *params)
        
        articles = []
        for row in rows:
            article = dict(row)
            # Parse JSON fields
            if article.get('key_phrases'):
                article['key_phrases'] = json.loads(article['key_phrases'])
            if article.get('mentions_context'):
                article['mentions_context'] = json.loads(article['mentions_context'])
            if article.get('topics'):
                article['topics'] = json.loads(article['topics'])
            articles.append(article)
        
        return articles


# Language name mapping
LANGUAGE_NAMES = {
    'en': 'English', 'ru': 'Russian', 'tr': 'Turkish', 'ar': 'Arabic',
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean', 'de': 'German',
    'fr': 'French', 'es': 'Spanish', 'pt': 'Portuguese', 'it': 'Italian',
    'hi': 'Hindi', 'fa': 'Persian', 'he': 'Hebrew', 'ka': 'Georgian',
    'hy': 'Armenian', 'az': 'Azerbaijani', 'kk': 'Kazakh', 'uz': 'Uzbek',
    'tk': 'Turkmen', 'ky': 'Kyrgyz', 'tg': 'Tajik', 'th': 'Thai',
    'id': 'Indonesian', 'ms': 'Malay', 'vi': 'Vietnamese', 'tl': 'Filipino',
    'bn': 'Bengali', 'ur': 'Urdu', 'ne': 'Nepali', 'si': 'Sinhala',
    'my': 'Burmese', 'km': 'Khmer', 'lo': 'Lao', 'mn': 'Mongolian',
    'sw': 'Swahili', 'am': 'Amharic', 'yo': 'Yoruba', 'zu': 'Zulu',
    'xh': 'Xhosa', 'af': 'Afrikaans', 'pl': 'Polish', 'uk': 'Ukrainian',
    'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian', 'da': 'Danish',
    'fi': 'Finnish', 'is': 'Icelandic', 'et': 'Estonian', 'lv': 'Latvian',
    'lt': 'Lithuanian', 'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian',
    'sr': 'Serbian', 'sk': 'Slovak', 'sl': 'Slovenian', 'cs': 'Czech',
    'hu': 'Hungarian', 'el': 'Greek', 'qu': 'Quechua', 'gn': 'Guarani',
    'ay': 'Aymara', 'ht': 'Haitian Creole'
}