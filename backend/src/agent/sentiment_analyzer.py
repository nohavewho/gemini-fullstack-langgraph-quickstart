"""Sentiment analysis for press articles"""

import os
import asyncio
from typing import Dict, List, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage

from .state import OrchestratorState
from .press_prompts import SENTIMENT_ANALYSIS_PROMPT, get_language_specific_instruction
from .tools_and_schemas import SentimentAnalysis
from .database import save_articles_to_db


async def analyze_article_sentiment(
    article: Dict[str, Any],
    model: ChatGoogleGenerativeAI,
    target_countries: List[str] = ["AZ"]
) -> Dict[str, Any]:
    """Analyze sentiment of a single article"""
    
    # Get language-specific instructions
    lang_instruction = get_language_specific_instruction(article["source_language"], target_countries)
    
    # Prepare prompt
    prompt = SENTIMENT_ANALYSIS_PROMPT.format(
        title=article["title"],
        target_countries_names="Azerbaijan and region"
    )
    
    # Add language-specific instruction
    prompt += f"\n\n{lang_instruction}"
    
    try:
        # Get sentiment analysis with structured output
        response = await model.with_structured_output(SentimentAnalysis).ainvoke(prompt)
        
        # Update article with sentiment data
        article["sentiment"] = response.sentiment
        article["sentiment_score"] = response.score
        article["sentiment_explanation"] = response.explanation
        article["key_phrases"].extend(response.key_phrases)
        
        return article
        
    except Exception as e:
        print(f"Error analyzing sentiment for article {article['url']}: {e}")
        # Default to neutral if analysis fails
        article["sentiment"] = "neutral"
        article["sentiment_score"] = 0.0
        article["sentiment_explanation"] = "Analysis failed"
        return article


async def translate_content_if_needed(
    article: Dict[str, Any],
    model: ChatGoogleGenerativeAI = None
) -> Dict[str, Any]:
    """Translate article content to English if needed"""
    
    # Skip if already in English or already translated
    if article["source_language"] == "en" or article.get("translated_content"):
        return article
    
    # Skip translation for very long content
    if len(article["original_content"]) > 5000:
        return article
    
    try:
        prompt = f"""Translate the following text from {article['language_name']} to English.
        Preserve the meaning and tone as accurately as possible.
        
        Text:
        {article['original_content'][:3000]}
        
        Translation:"""
        
        response = await model.ainvoke(prompt)
        article["translated_content"] = response.content
        
    except Exception as e:
        print(f"Error translating article {article['url']}: {e}")
    
    return article


async def sentiment_analysis_node(state: OrchestratorState) -> Dict[str, Any]:
    """Node function for sentiment analysis in the graph"""
    
    # Initialize model with higher capability for sentiment analysis
    model = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.3,  # Lower temperature for more consistent analysis
        google_api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("GOOGLE_API_KEY")
    )
    
    all_articles = state["all_articles"]
    
    if not all_articles:
        return {
            "messages": state["messages"] + [
                AIMessage(content="No articles to analyze for sentiment.")
            ]
        }
    
    # Process articles
    analyzed_articles = []
    
    # Process in batches to avoid overwhelming the API
    batch_size = 10
    for i in range(0, len(all_articles), batch_size):
        batch = all_articles[i:i + batch_size]
        
        for article in batch:
            # Translate if needed and enabled
            if state.get("translation_enabled", True):
                article = await translate_content_if_needed(article, model)
            
            # Analyze sentiment
            article = await analyze_article_sentiment(
                article, 
                model,
                state.get("target_countries", ["AZ"])
            )
            analyzed_articles.append(article)
        
        # Small delay between batches
        if i + batch_size < len(all_articles):
            await asyncio.sleep(2)
    
    # Save updated articles with sentiment to database
    await save_articles_to_db(analyzed_articles)
    
    # Group by sentiment
    positive = [a for a in analyzed_articles if a["sentiment"] == "positive"]
    negative = [a for a in analyzed_articles if a["sentiment"] == "negative"]
    neutral = [a for a in analyzed_articles if a["sentiment"] == "neutral"]
    
    # Calculate statistics
    total = len(analyzed_articles)
    pos_pct = (len(positive) / total * 100) if total > 0 else 0
    neg_pct = (len(negative) / total * 100) if total > 0 else 0
    neu_pct = (len(neutral) / total * 100) if total > 0 else 0
    
    messages = state["messages"] + [
        AIMessage(
            content=f"Sentiment analysis completed for {total} articles:\n"
                   f"- Positive: {len(positive)} ({pos_pct:.1f}%)\n"
                   f"- Negative: {len(negative)} ({neg_pct:.1f}%)\n"
                   f"- Neutral: {len(neutral)} ({neu_pct:.1f}%)"
        )
    ]
    
    return {
        "all_articles": analyzed_articles,
        "positive_articles": positive,
        "negative_articles": negative,
        "neutral_articles": neutral,
        "messages": messages
    }


def calculate_overall_sentiment_trend(articles: List[Dict[str, Any]]) -> str:
    """Calculate overall sentiment trend from articles"""
    
    if not articles:
        return "neutral"
    
    # Calculate average sentiment score
    total_score = sum(a.get("sentiment_score", 0) for a in articles)
    avg_score = total_score / len(articles)
    
    # Determine trend
    if avg_score > 0.3:
        return "positive"
    elif avg_score < -0.3:
        return "negative"
    else:
        return "neutral"


def get_top_sentiment_drivers(
    articles: List[Dict[str, Any]], 
    sentiment_type: str = "positive"
) -> List[Dict[str, str]]:
    """Get articles that most strongly drive a particular sentiment"""
    
    # Filter by sentiment type
    filtered = [a for a in articles if a["sentiment"] == sentiment_type]
    
    # Sort by sentiment score (absolute value for impact)
    if sentiment_type == "positive":
        sorted_articles = sorted(filtered, key=lambda x: x.get("sentiment_score", 0), reverse=True)
    else:
        sorted_articles = sorted(filtered, key=lambda x: x.get("sentiment_score", 0))
    
    # Return top 5 with key info
    top_drivers = []
    for article in sorted_articles[:5]:
        top_drivers.append({
            "title": article["title"],
            "source": f"{article['source_name']} ({article['source_country']})",
            "language": article["language_name"],
            "score": article["sentiment_score"],
            "explanation": article["sentiment_explanation"],
            "url": article["url"]
        })
    
    return top_drivers


# Import asyncio here to avoid circular imports
import asyncio