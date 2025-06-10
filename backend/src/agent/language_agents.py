"""Language-specific search agents"""

import asyncio
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai
from langchain_core.messages import HumanMessage, AIMessage

from .state import OrchestratorState, LanguageSearchState, ArticleInfo
from .press_prompts import ARTICLE_EXTRACTION_PROMPT
from .database import update_language_checked
from .utils import clean_url


# Dictionary of "Azerbaijan" translations in different languages
AZERBAIJAN_TRANSLATIONS = {
    "en": ["Azerbaijan", "Azerbaijani", "Azeri", "Baku"],
    "ru": ["Азербайджан", "азербайджанский", "азербайджанец", "Баку"],
    "uk": ["Азербайджан", "азербайджанський", "азербайджанець", "Баку"],
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
    "ka": ["აზერბაიჯანი", "აზერბაიჯანული", "ბაქო"],
    "hy": ["Ադրբեջան", "ադրբեջանական", "Բաքու"],
    "az": ["Azərbaycan", "azərbaycanlı", "Bakı"],
    "kk": ["Әзірбайжан", "әзірбайжандық", "Баку"],
    "uz": ["Ozarbayjon", "ozarbayjonlik", "Boku"],
    "tk": ["Azerbaýjan", "azerbaýjanlı", "Bakı"],
    "ky": ["Азербайжан", "азербайжандык", "Баку"],
    "tg": ["Озарбойҷон", "озарбойҷонӣ", "Боку"],
    "th": ["อาเซอร์ไบจาน", "ชาวอาเซอร์ไบจาน", "บากู"],
    "id": ["Azerbaijan", "Azerbaijan", "Baku"],
    "ms": ["Azerbaijan", "Azerbaijan", "Baku"],
    "vi": ["Azerbaijan", "người Azerbaijan", "Baku"],
    "tl": ["Azerbaijan", "Azerbaijani", "Baku"],
    "bn": ["আজারবাইজান", "আজারবাইজানি", "বাকু"],
    "ur": ["آذربائیجان", "آذربائیجانی", "باکو"],
    "ne": ["अजरबैजान", "अजरबैजानी", "बाकु"],
    "si": ["අසර්බයිජානය", "අසර්බයිජාන", "බකූ"],
    "my": ["အဇာဘိုင်ဂျန်", "အဇာဘိုင်ဂျန်", "ဘာကူ"],
    "km": ["អាស៊ែបៃហ្សង់", "អាស៊ែបៃហ្សង់", "បាគូ"],
    "lo": ["ອາເຊີໄບຈານ", "ອາເຊີໄບຈານ", "ບາກູ"],
    "mn": ["Азербайжан", "азербайжан", "Баку"],
    "sw": ["Azabajani", "Mwazabajani", "Baku"],
    "am": ["አዘርባይጃን", "አዘርባይጃናዊ", "ባኩ"],
    "yo": ["Azerbaijan", "Azerbaijan", "Baku"],
    "zu": ["Azerbaijan", "Azerbaijan", "Baku"],
    "xh": ["Azerbaijan", "Azerbaijan", "Baku"],
    "af": ["Azerbeidjan", "Azerbeidjaans", "Bakoe"],
    "pl": ["Azerbejdżan", "azerbejdżański", "Baku"],
    "uk": ["Азербайджан", "азербайджанський", "азербайджанець", "Баку"],
    "nl": ["Azerbeidzjan", "Azerbeidzjaans", "Bakoe"],
    "sv": ["Azerbajdzjan", "azerbajdzjansk", "Baku"],
    "no": ["Aserbajdsjan", "aserbajdsjansk", "Baku"],
    "da": ["Aserbajdsjan", "aserbajdsjansk", "Baku"],
    "fi": ["Azerbaidžan", "azerbaidžanilainen", "Baku"],
    "is": ["Aserbaídsjan", "aserbaídsjanskt", "Bakú"],
    "et": ["Aserbaidžaan", "aserbaidžaani", "Bakuu"],
    "lv": ["Azerbaidžāna", "azerbaidžāņu", "Baku"],
    "lt": ["Azerbaidžanas", "azerbaidžaniečių", "Baku"],
    "ro": ["Azerbaidjan", "azer", "Baku"],
    "bg": ["Азербайджан", "азербайджански", "Баку"],
    "hr": ["Azerbajdžan", "azerbajdžanski", "Baku"],
    "sr": ["Азербејџан", "азербејџански", "Баку"],
    "sk": ["Azerbajdžan", "azerbajdžanský", "Baku"],
    "sl": ["Azerbajdžan", "azerbajdžanski", "Baku"],
    "cs": ["Ázerbájdžán", "ázerbájdžánský", "Baku"],
    "hu": ["Azerbajdzsán", "azerbajdzsáni", "Baku"],
    "el": ["Αζερμπαϊτζάν", "Αζερμπαϊτζάν", "Μπακού"],
    "qu": ["Asirwayan", "Asirwayan", "Baku"],
    "gn": ["Azerbaiyán", "Azerbaiyán", "Bakú"],
    "ay": ["Asirwayana", "Asirwayana", "Baku"],
    "ht": ["Azerbaydjan", "Azerbaydjan", "Bakou"]
}


async def create_language_search_queries(
    language_code: str, 
    language_name: str,
    model: ChatGoogleGenerativeAI,
    date_filter: Optional[str] = None
) -> List[str]:
    """Create search queries using local language terms"""
    
    # Let AI determine the translation itself!
    from .press_prompts import MULTI_LANGUAGE_SEARCH_PROMPT
    from datetime import datetime
    
    prompt = MULTI_LANGUAGE_SEARCH_PROMPT.format(
        language_name=language_name,
        language_code=language_code,
        azerbaijan_terms="",  # Empty! Let AI figure it out!
        current_date=datetime.now().strftime("%B %d, %Y")
    )
    
    try:
        response = await model.ainvoke(prompt)
        queries = response.content.strip().split('\n')
        # Clean up queries
        queries = [q.strip() for q in queries if q.strip()]
        # Add date filter if provided
        if date_filter:
            queries = [f"{q} {date_filter}" for q in queries]
        return queries[:5]  # Max 5 queries
    except:
        # Fallback to simple queries
        main_term = azerbaijan_terms[0] if azerbaijan_terms else "Azerbaijan"
        queries = [main_term]
        if date_filter:
            queries = [f"{q} {date_filter}" for q in queries]
        return queries


async def language_search_node(state: OrchestratorState) -> Dict[str, Any]:
    """Node that spawns language-specific searches"""
    
    # Extract all language search states
    language_states = []
    active_languages = state.get("active_searches", {})
    
    for lang_code, lang_state in active_languages.items():
        if not lang_state.get("search_completed", False):
            language_states.append({
                "language_code": lang_code,
                "language_state": lang_state,
                "date_filter": state.get("date_filter")
            })
    
    if not language_states:
        return {"language_search_complete": True}
    
    # Create Gemini model
    model = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.7,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )
    
    # Run searches in parallel
    search_tasks = []
    for lang_data in language_states:
        task = search_news_in_language(
            language_code=lang_data["language_code"],
            language_state=lang_data["language_state"],
            model=model,
            date_filter=lang_data["date_filter"]
        )
        search_tasks.append(task)
    
    # Execute all searches in parallel
    results = await asyncio.gather(*search_tasks)
    
    # Update state with results
    updated_active_searches = state.get("active_searches", {}).copy()
    all_articles = state.get("all_articles", [])
    
    for i, lang_data in enumerate(language_states):
        lang_code = lang_data["language_code"]
        search_result = results[i]
        
        # Update language state
        updated_active_searches[lang_code].update(search_result)
        # Set the correct field for orchestrator
        updated_active_searches[lang_code]["search_completed"] = True
        
        # Add articles to global list
        if search_result.get("articles_found"):
            all_articles.extend(search_result["articles_found"])
    
    return {
        "active_searches": updated_active_searches,
        "all_articles": all_articles,
        "language_search_complete": True
    }


async def search_news_in_language(
    language_code: str,
    language_state: Dict[str, Any],
    model: ChatGoogleGenerativeAI,
    date_filter: str = None
) -> Dict[str, Any]:
    """Search for news in a specific language
    
    Args:
        language_code: Language code (e.g. 'tg', 'uz')
        language_state: Current state for this language search
        model: LLM model for queries
        date_filter: Date filter (e.g. 'after:2025-02-09 before:2025-02-10')
    """
    
    language_name = language_state["language_name"]
    
    # Default to today if no date filter specified
    if not date_filter:
        today = datetime.now().strftime("%Y-%m-%d")
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        date_filter = f"after:{today} before:{tomorrow}"
    
    # Create search queries if not already created
    if not language_state.get("search_queries"):
        queries = await create_language_search_queries(
            language_code,
            language_name,
            model,
            date_filter
        )
        language_state["search_queries"] = queries
    
    articles_found = []
    
    # Execute each search query
    for query in language_state["search_queries"]:
        try:
            # Use Google genai SDK directly for grounding search
            genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY"))
            
            # Create search query with date filter
            search_prompt = f"{query} {date_filter}"
            
            model = genai.GenerativeModel("gemini-2.0-flash-exp")
            response = model.generate_content(
                search_prompt,
                tools=[{"google_search": {}}],
                generation_config=genai.GenerationConfig(temperature=0.7)
            )
            
            # Extract articles from grounding metadata
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]
                if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                    grounding = candidate.grounding_metadata
                    
                    # Process grounding chunks
                    for chunk in grounding.grounding_chunks:
                        if hasattr(chunk, 'web') and chunk.web:
                            web_data = chunk.web
                            
                            # Create article entry for AI filtering
                            article = {
                                "url": clean_url(web_data.uri),
                                "title": web_data.title or "No title",
                                "source_name": extract_source_name(web_data.uri),
                                "source_country": "unknown",  # Will be determined later
                                "source_language": language_code,
                                "language_name": language_name,
                                "published_date": None,  # Not available from grounding
                                "original_content": response.text,  # Full response text
                                "translated_content": None,
                                "summary": "",
                                "sentiment": "neutral",
                                "sentiment_score": 0.0,
                                "sentiment_explanation": "",
                                "key_phrases": [],
                                "mentions_context": [],
                                "topics": [],
                                "search_query": query,
                                "found_date": datetime.now()
                            }
                            
                            # Add to list for AI filtering later
                            articles_found.append(article)
        
        except Exception as e:
            print(f"Error searching '{query}' in {language_name}: {e}")
            continue
    
    # AI filtering based on headlines ONLY - does this reflect country's opinion about Azerbaijan?
    if articles_found:
        print(f"🔍 Found {len(articles_found)} articles before filtering for {language_code}")
        articles_found = await ai_filter_articles_by_headlines(articles_found, model, language_code)
        print(f"✅ Kept {len(articles_found)} articles after headline filtering for {language_code}")
    
    # Update database
    await update_language_checked(language_code, True)
    
    return {
        "status": "completed",
        "articles_found": articles_found,
        "search_queries": language_state["search_queries"],
        "completed_at": datetime.now()
    }


def extract_source_name(url: str) -> str:
    """Extract source name from URL"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc
        
        # Remove www. prefix
        if domain.startswith("www."):
            domain = domain[4:]
            
        # Take first part of domain
        source = domain.split('.')[0]
        
        return source.title()
    except:
        return "Unknown Source"


async def extract_article_info(
    article: dict,
    model: ChatGoogleGenerativeAI
) -> dict:
    """Extract detailed information from article"""
    
    azerbaijan_terms = AZERBAIJAN_TRANSLATIONS.get(
        article["source_language"], 
        ["Azerbaijan"]
    )
    
    prompt = ARTICLE_EXTRACTION_PROMPT.format(
        title=article["title"],
        content=article["original_content"][:3000],  # Limit content length
        language_name=article["language_name"],
        azerbaijan_terms=", ".join(azerbaijan_terms)
    )
    
    try:
        response = await model.ainvoke(prompt)
        
        # Parse response
        lines = response.content.split('\n')
        
        for line in lines:
            if line.startswith("SUMMARY:"):
                article["summary"] = line.replace("SUMMARY:", "").strip()
            elif line.startswith("MENTIONS:"):
                mentions = line.replace("MENTIONS:", "").strip()
                article["mentions_context"] = [{"text": mentions, "context": "general"}]
            elif line.startswith("TOPICS:"):
                topics = line.replace("TOPICS:", "").strip()
                article["topics"] = [t.strip() for t in topics.split(",")]
            elif line.startswith("KEY_PHRASES:"):
                phrases = line.replace("KEY_PHRASES:", "").strip()
                article["key_phrases"] = [p.strip() for p in phrases.split(",")]
    
    except Exception as e:
        print(f"Error extracting info from article: {e}")
        article["summary"] = "Error extracting summary"
    
    return article


async def ai_filter_articles_by_headlines(
    articles: List[dict],
    model: ChatGoogleGenerativeAI,
    language_code: str
) -> List[dict]:
    """AI looks at HEADLINES ONLY and decides: does this reflect country's opinion about Azerbaijan?"""
    
    if not articles:
        return []
    
    # Prepare article headlines for AI analysis
    headlines_data = []
    for i, article in enumerate(articles):
        headlines_data.append(f"{i+1}. [{article['source_name']}] {article['title']}")
    
    headlines_text = "\n".join(headlines_data)
    
    # Map language codes to country names
    country_names = {
        "uk": "Ukraine", "ru": "Russia", "tr": "Turkey", "de": "Germany", 
        "fr": "France", "es": "Spain", "it": "Italy", "pl": "Poland",
        "en": "International English-speaking media", "ar": "Arab countries",
        "fa": "Iran", "az": "Azerbaijan itself", "ka": "Georgia", "hy": "Armenia"
    }
    
    country_name = country_names.get(language_code, f"country using {language_code} language")
    
    prompt = f"""HEADLINE ANALYSIS: Look at these headlines and decide - do they show {country_name}'s OPINION/PERSPECTIVE about Azerbaijan?

Language: {language_code} 
Country/Region: {country_name}

Headlines found:
{headlines_text}

QUESTION: Which headlines show how {country_name} VIEWS or DISCUSSES Azerbaijan?

INCLUDE headlines that show:
✅ {country_name}'s diplomatic position on Azerbaijan
✅ {country_name}'s economic relations with Azerbaijan  
✅ {country_name}'s political commentary about Azerbaijan
✅ How {country_name} media analyzes Azerbaijan's actions
✅ {country_name}'s stance on Azerbaijan conflicts/policies

EXCLUDE headlines about:
❌ Sports matches/results (football, UEFA, etc.)
❌ Weather/tourism
❌ Internal Azerbaijan news (we want EXTERNAL view)
❌ Headlines that don't actually mention Azerbaijan
❌ Entertainment/celebrity news
❌ Technical/economic data without political context

Focus: Does this headline reflect {country_name}'s PERSPECTIVE on Azerbaijan?

Return only the numbers separated by commas (e.g. "1,3,7")
If NO headlines show country's opinion about Azerbaijan, return "NONE"
"""

    try:
        response = await model.ainvoke(prompt)
        result = response.content.strip()
        
        if result == "NONE":
            return []
        
        # Parse the numbers
        try:
            selected_indices = [int(x.strip()) - 1 for x in result.split(",") if x.strip().isdigit()]
            filtered_articles = [articles[i] for i in selected_indices if 0 <= i < len(articles)]
            return filtered_articles
            
        except Exception as e:
            # If parsing fails, return all articles
            return articles
    
    except Exception as e:
        print(f"Error in headline filtering: {e}")
        return articles