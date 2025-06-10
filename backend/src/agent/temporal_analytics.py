"""Temporal analytics for tracking sentiment changes over time"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage

from .state import OrchestratorState, TemporalAnalyticsState
from .database import (
    get_historical_articles,
    get_countries_with_sufficient_data,
    get_monitoring_statistics
)
from .press_prompts import TEMPORAL_ANALYSIS_PROMPT, TREND_COMPARISON_PROMPT
from .tools_and_schemas import TemporalTrendAnalysis


class TemporalAnalyticsAgent:
    """Agent for analyzing sentiment changes over time"""
    
    def __init__(self):
        import os
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.3,
            google_api_key=os.getenv("GEMINI_API_KEY")
        )
    
    async def analyze_temporal_changes(
        self,
        country: Optional[str] = None,
        region: Optional[str] = None,
        time_period_days: int = 30,
        comparison_periods: List[int] = [7, 30, 90]
    ) -> Dict[str, Any]:
        """Analyze sentiment changes over time periods"""
        
        # Get historical data
        historical_data = await get_historical_articles(
            country=country,
            region=region,
            days_back=max(comparison_periods)
        )
        
        if not historical_data:
            return {
                "country": country,
                "region": region,
                "error": "Insufficient data for temporal analysis",
                "trends": {},
                "predictions": None
            }
        
        # Analyze trends for each period
        trends = {}
        for period in comparison_periods:
            trends[f"{period}_days"] = await self._analyze_period(
                historical_data,
                period,
                country,
                region
            )
        
        # Detailed analysis of the main period
        detailed_analysis = await self._detailed_temporal_analysis(
            historical_data,
            time_period_days
        )
        
        # Predict future trends
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
        """Analyze a specific time period"""
        
        cutoff_date = datetime.now() - timedelta(days=period_days)
        period_articles = [
            a for a in articles 
            if a["published_date"] >= cutoff_date
        ]
        
        if not period_articles:
            return {
                "period_days": period_days,
                "total_articles": 0,
                "trend": "insufficient_data"
            }
        
        # Calculate metrics
        total = len(period_articles)
        positive = len([a for a in period_articles if a["sentiment"] == "positive"])
        negative = len([a for a in period_articles if a["sentiment"] == "negative"])
        neutral = len([a for a in period_articles if a["sentiment"] == "neutral"])
        
        # Calculate percentages
        positive_pct = (positive / total * 100) if total > 0 else 0
        negative_pct = (negative / total * 100) if total > 0 else 0
        
        # Group by topics
        topics_count = defaultdict(int)
        for article in period_articles:
            for topic in article.get("topics", []):
                topics_count[topic] += 1
        
        # Get top topics
        top_topics = sorted(
            topics_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10]
        
        # Calculate trend direction
        if total < 5:
            trend = "insufficient_data"
        elif positive_pct > negative_pct + 20:
            trend = "improving"
        elif negative_pct > positive_pct + 20:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "period_days": period_days,
            "total_articles": total,
            "sentiment_breakdown": {
                "positive": positive,
                "negative": negative,
                "neutral": neutral,
                "positive_percentage": positive_pct,
                "negative_percentage": negative_pct,
                "neutral_percentage": 100 - positive_pct - negative_pct
            },
            "top_topics": top_topics,
            "daily_average": total / period_days if period_days > 0 else 0,
            "trend": trend
        }
    
    async def _detailed_temporal_analysis(
        self,
        articles: List[Dict],
        period_days: int
    ) -> Dict[str, Any]:
        """Perform detailed day-by-day analysis"""
        
        cutoff_date = datetime.now() - timedelta(days=period_days)
        period_articles = [
            a for a in articles 
            if a["published_date"] >= cutoff_date
        ]
        
        # Group by day
        daily_sentiment = defaultdict(lambda: {"positive": 0, "negative": 0, "neutral": 0, "total": 0})
        
        for article in period_articles:
            day_key = article["published_date"].strftime("%Y-%m-%d")
            sentiment = article["sentiment"]
            daily_sentiment[day_key][sentiment] += 1
            daily_sentiment[day_key]["total"] += 1
        
        # Identify trend changes
        trend_changes = await self._identify_trend_changes(daily_sentiment)
        
        # Analyze reasons for changes
        change_reasons = []
        if trend_changes:
            change_reasons = await self._analyze_change_reasons(
                period_articles,
                trend_changes
            )
        
        # Calculate volatility
        volatility_score = self._calculate_volatility(daily_sentiment)
        
        # Find significant events
        significant_events = await self._find_significant_events(
            period_articles,
            daily_sentiment
        )
        
        return {
            "daily_sentiment": dict(daily_sentiment),
            "trend_changes": trend_changes,
            "change_reasons": change_reasons,
            "volatility_score": volatility_score,
            "significant_events": significant_events
        }
    
    async def _identify_trend_changes(
        self,
        daily_sentiment: Dict[str, Dict[str, int]]
    ) -> List[Dict[str, Any]]:
        """Identify significant trend changes"""
        
        changes = []
        dates = sorted(daily_sentiment.keys())
        
        if len(dates) < 2:
            return changes
        
        # Calculate rolling averages
        window = 3  # 3-day window
        for i in range(window, len(dates)):
            # Current window
            current_window = dates[i-window+1:i+1]
            current_positive_avg = sum(
                daily_sentiment[d]["positive"] / max(daily_sentiment[d]["total"], 1)
                for d in current_window
            ) / window
            
            # Previous window
            if i >= window * 2:
                prev_window = dates[i-window*2+1:i-window+1]
                prev_positive_avg = sum(
                    daily_sentiment[d]["positive"] / max(daily_sentiment[d]["total"], 1)
                    for d in prev_window
                ) / window
                
                # Calculate change
                change_pct = (current_positive_avg - prev_positive_avg) * 100
                
                # Significant change threshold
                if abs(change_pct) > 20:
                    changes.append({
                        "date": dates[i],
                        "change_percentage": change_pct,
                        "direction": "improvement" if change_pct > 0 else "deterioration",
                        "current_avg": current_positive_avg,
                        "previous_avg": prev_positive_avg
                    })
        
        return changes
    
    async def _analyze_change_reasons(
        self,
        articles: List[Dict],
        trend_changes: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Analyze reasons for trend changes"""
        
        reasons = []
        
        for change in trend_changes[:5]:  # Analyze top 5 changes
            change_date = datetime.strptime(change["date"], "%Y-%m-%d")
            
            # Find articles around the change date
            relevant_articles = [
                a for a in articles
                if abs((a["published_date"] - change_date).days) <= 2
            ]
            
            if relevant_articles:
                # Prepare summary for analysis
                articles_summary = "\n".join([
                    f"- [{a['source_language']}] {a['title']} ({a['sentiment']}): {a['summary'][:100]}..."
                    for a in relevant_articles[:10]
                ])
                
                prompt = TREND_COMPARISON_PROMPT.format(
                    date=change["date"],
                    change_direction=change["direction"],
                    change_percentage=abs(change["change_percentage"]),
                    target_countries_names="Azerbaijan and region"
                )
                
                response = await self.model.ainvoke(prompt)
                
                reasons.append({
                    "date": change["date"],
                    "change": change,
                    "likely_reasons": response.content,
                    "supporting_articles": len(relevant_articles),
                    "key_articles": [
                        {
                            "title": a["title"],
                            "source": f"{a['source_name']} ({a['source_country']})",
                            "sentiment": a["sentiment"]
                        }
                        for a in relevant_articles[:3]
                    ]
                })
        
        return reasons
    
    def _calculate_volatility(self, daily_sentiment: Dict[str, Dict[str, int]]) -> float:
        """Calculate sentiment volatility score"""
        
        if len(daily_sentiment) < 2:
            return 0.0
        
        # Calculate daily positive ratios
        daily_ratios = []
        for day_data in daily_sentiment.values():
            total = day_data["total"]
            if total > 0:
                positive_ratio = day_data["positive"] / total
                daily_ratios.append(positive_ratio)
        
        if len(daily_ratios) < 2:
            return 0.0
        
        # Calculate standard deviation as volatility measure
        try:
            volatility = statistics.stdev(daily_ratios)
            # Normalize to 0-1 scale
            return min(volatility * 2, 1.0)
        except:
            return 0.0
    
    async def _find_significant_events(
        self,
        articles: List[Dict],
        daily_sentiment: Dict[str, Dict[str, int]]
    ) -> List[Dict[str, Any]]:
        """Find days with significant events"""
        
        events = []
        
        # Find days with unusual article volume
        daily_counts = [d["total"] for d in daily_sentiment.values()]
        if daily_counts:
            avg_count = statistics.mean(daily_counts)
            std_count = statistics.stdev(daily_counts) if len(daily_counts) > 1 else 0
            
            for date, data in daily_sentiment.items():
                # Significant if > 2 standard deviations from mean
                if std_count > 0 and data["total"] > avg_count + 2 * std_count:
                    # Find articles from that day
                    day_articles = [
                        a for a in articles
                        if a["published_date"].strftime("%Y-%m-%d") == date
                    ]
                    
                    # Get most common topics
                    topics = defaultdict(int)
                    for article in day_articles:
                        for topic in article.get("topics", []):
                            topics[topic] += 1
                    
                    top_topics = sorted(topics.items(), key=lambda x: x[1], reverse=True)[:3]
                    
                    events.append({
                        "date": date,
                        "article_count": data["total"],
                        "sentiment_breakdown": {
                            "positive": data["positive"],
                            "negative": data["negative"],
                            "neutral": data["neutral"]
                        },
                        "significance": "high_volume",
                        "top_topics": top_topics,
                        "deviation": (data["total"] - avg_count) / std_count if std_count > 0 else 0
                    })
        
        # Sort by significance
        events.sort(key=lambda x: x["deviation"], reverse=True)
        
        return events[:10]  # Top 10 significant events
    
    async def _predict_trends(
        self,
        historical_trends: Dict[str, Any],
        detailed_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Predict future sentiment trends"""
        
        # Prepare data for prediction
        trend_7 = historical_trends.get("7_days", {})
        trend_30 = historical_trends.get("30_days", {})
        trend_90 = historical_trends.get("90_days", {})
        
        # Check if we have enough data
        if (not trend_7.get("total_articles") or 
            trend_7["total_articles"] < 5):
            return {
                "next_7_days": "insufficient_data",
                "next_30_days": "insufficient_data",
                "confidence": "low",
                "explanation": "Not enough recent data for reliable prediction"
            }
        
        # Analyze trend progression
        trends_sequence = []
        for period_data in [trend_90, trend_30, trend_7]:
            if period_data.get("trend"):
                trends_sequence.append(period_data["trend"])
        
        # Simple trend prediction logic
        recent_trend = trend_7.get("trend", "stable")
        volatility = detailed_analysis.get("volatility_score", 0)
        recent_changes = detailed_analysis.get("trend_changes", [])
        
        # Determine predictions
        if volatility > 0.7:
            confidence = "low"
            next_7_days = "volatile"
            next_30_days = "uncertain"
        elif recent_trend == "improving" and len(recent_changes) < 2:
            confidence = "high"
            next_7_days = "improving"
            next_30_days = "stable_positive"
        elif recent_trend == "declining" and len(recent_changes) < 2:
            confidence = "high"
            next_7_days = "declining"
            next_30_days = "needs_intervention"
        else:
            confidence = "medium"
            next_7_days = "stable"
            next_30_days = "stable"
        
        # Get influencing factors
        factors = []
        if recent_changes:
            factors.append(f"Recent trend change on {recent_changes[-1]['date']}")
        if volatility > 0.5:
            factors.append("High sentiment volatility")
        if trend_7.get("top_topics"):
            top_topic = trend_7["top_topics"][0][0]
            factors.append(f"Dominant topic: {top_topic}")
        
        return {
            "next_7_days": next_7_days,
            "next_30_days": next_30_days,
            "confidence": confidence,
            "influencing_factors": factors,
            "volatility_score": volatility,
            "trend_sequence": trends_sequence,
            "explanation": self._generate_prediction_explanation(
                next_7_days, next_30_days, confidence, factors
            )
        }
    
    def _generate_prediction_explanation(
        self,
        next_7: str,
        next_30: str,
        confidence: str,
        factors: List[str]
    ) -> str:
        """Generate human-readable prediction explanation"""
        
        explanation = f"Based on the analysis, sentiment is predicted to be {next_7} "
        explanation += f"over the next 7 days and {next_30} over the next 30 days. "
        explanation += f"This prediction has {confidence} confidence"
        
        if factors:
            explanation += f" due to: {', '.join(factors)}."
        else:
            explanation += "."
        
        return explanation


async def temporal_analysis_node(state: OrchestratorState) -> Dict[str, Any]:
    """Node function for temporal analysis in the graph"""
    
    agent = TemporalAnalyticsAgent()
    
    # Get countries with sufficient data
    countries_to_analyze = await get_countries_with_sufficient_data(
        min_articles=50,
        days_back=90
    )
    
    # Limit to top countries to avoid overload
    countries_to_analyze = countries_to_analyze[:10]
    
    # Perform temporal analysis for each country
    temporal_analyses = {}
    
    for country in countries_to_analyze:
        try:
            analysis = await agent.analyze_temporal_changes(
                country=country,
                time_period_days=30,
                comparison_periods=[7, 30, 90]
            )
            temporal_analyses[country] = analysis
        except Exception as e:
            print(f"Error analyzing temporal trends for {country}: {e}")
            temporal_analyses[country] = {"error": str(e)}
    
    # Also perform regional analysis
    regional_analyses = {}
    regions = ["Asia", "Europe", "Middle East", "Africa", "Americas"]
    
    for region in regions:
        try:
            analysis = await agent.analyze_temporal_changes(
                region=region,
                time_period_days=30,
                comparison_periods=[7, 30, 90]
            )
            regional_analyses[region] = analysis
        except Exception as e:
            print(f"Error analyzing temporal trends for {region}: {e}")
            regional_analyses[region] = {"error": str(e)}
    
    # Update state
    messages = state["messages"] + [
        AIMessage(
            content=f"Temporal analysis completed for {len(temporal_analyses)} countries "
                   f"and {len(regional_analyses)} regions."
        )
    ]
    
    return {
        "temporal_analyses": {
            "by_country": temporal_analyses,
            "by_region": regional_analyses,
            "generated_at": datetime.now().isoformat()
        },
        "messages": messages
    }


def summarize_temporal_insights(temporal_analyses: Dict[str, Any]) -> Dict[str, Any]:
    """Summarize key temporal insights across all analyses"""
    
    insights = {
        "improving_countries": [],
        "declining_countries": [],
        "volatile_countries": [],
        "stable_countries": [],
        "key_trend_changes": [],
        "overall_outlook": ""
    }
    
    # Analyze by country
    for country, analysis in temporal_analyses.get("by_country", {}).items():
        if "error" in analysis:
            continue
        
        trend_7 = analysis.get("trends", {}).get("7_days", {}).get("trend")
        volatility = analysis.get("detailed_analysis", {}).get("volatility_score", 0)
        
        if volatility > 0.7:
            insights["volatile_countries"].append(country)
        elif trend_7 == "improving":
            insights["improving_countries"].append(country)
        elif trend_7 == "declining":
            insights["declining_countries"].append(country)
        else:
            insights["stable_countries"].append(country)
        
        # Collect significant trend changes
        for change in analysis.get("detailed_analysis", {}).get("trend_changes", [])[:2]:
            insights["key_trend_changes"].append({
                "country": country,
                "date": change["date"],
                "direction": change["direction"],
                "magnitude": abs(change["change_percentage"])
            })
    
    # Determine overall outlook
    total_countries = len(temporal_analyses.get("by_country", {}))
    if total_countries == 0:
        insights["overall_outlook"] = "No data available"
    elif len(insights["improving_countries"]) > len(insights["declining_countries"]):
        insights["overall_outlook"] = "Generally positive trajectory"
    elif len(insights["declining_countries"]) > len(insights["improving_countries"]):
        insights["overall_outlook"] = "Concerning negative trends"
    else:
        insights["overall_outlook"] = "Mixed sentiment with regional variations"
    
    return insights