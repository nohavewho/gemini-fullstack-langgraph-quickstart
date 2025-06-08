# Azerbaijan Press Monitoring - Adaptive Search System Changes

## Overview
Updated the press monitoring system to be more flexible and adaptive, recognizing that not every day has deep analysis about Azerbaijan and some countries rarely mention it. The system now casts a wider net initially and then intelligently filters for importance.

## Key Changes Made

### 1. Query Writer Instructions (`query_writer_instructions`)
**Previous approach:** Focused heavily on finding opinion pieces and expert analysis with many exclusion filters.

**New adaptive approach:**
- **Tier 1 - Discovery Phase:** Cast widest net with simple queries like "Азербайджан" after:{date} with NO exclusions
- **Tier 2 - Intelligent Search:** Add targeted searches for analysis and opinions with minimal exclusions
- **Tier 3 - Adaptive Expansion:** If little found, expand date range, try alternate spellings, search regional context

**Key improvements:**
- Language-specific broad searches for Russian, Turkish, English, Persian, Arabic, and Chinese
- Flexible date ranges (can expand ±1-2 days if needed)
- Pre-filtering guidance for importance levels (HIGH/MEDIUM/LOW)

### 2. Web Searcher Instructions (`web_searcher_instructions`)
**Previous approach:** Strict filtering that could miss important content on quiet days.

**New adaptive approach:**
- **Stage 1:** Accept everything initially, be flexible with dates
- **Stage 2:** Smart categorization by importance (HIGH/MEDIUM/LOW)
- **Stage 3:** Adaptive depth analysis based on content availability

**Key improvements:**
- Adaptive extraction rules for scarce vs abundant days
- Flexible interpretation of simple news to find hidden insights
- Recognition that absence of coverage is also significant

### 3. Reflection Instructions (`reflection_instructions`)
**Previous approach:** Sought comprehensive coverage with all types of opinions.

**New adaptive approach:**
- Assesses coverage volume (Abundant/Moderate/Scarce)
- Provides adaptive strategies based on what's found
- Realistic completeness criteria

**Key improvements:**
- Different evaluation criteria for routine days vs news event days
- Smart gap identification that doesn't force non-existent content
- Adaptive follow-up strategies (expand for scarce days, refine for abundant days)

### 4. Answer Instructions (`answer_instructions`)
**Previous approach:** Fixed format expecting positive/negative/neutral categorization.

**New adaptive approach:**
- Coverage reality assessment first
- Importance-based analysis (HIGH/MEDIUM/LOW)
- Adaptive insights based on coverage density

**Key improvements:**
- Format adaptations based on content availability
- Strategic assessment that acknowledges reality (scarce/routine/rich coverage)
- Extracts quality analysis from ANY amount of content

## Implementation Benefits

1. **More Realistic:** Acknowledges that not every day has deep Azerbaijan analysis
2. **Better Coverage:** Catches more content by starting broad
3. **Smarter Filtering:** AI analyzes after finding, not before
4. **Adaptive Depth:** Adjusts analysis based on what's available
5. **Meaningful Insights:** Extracts value even from simple news

## Usage Notes

The system now:
- Starts with broad searches to find ALL mentions
- Intelligently filters by importance after discovery
- Adapts search depth based on results
- Provides meaningful analysis regardless of content volume
- Recognizes patterns in both presence and absence of coverage

This approach ensures Azerbaijan's press monitoring captures all relevant mentions while providing intelligent analysis adapted to daily reality rather than forcing a rigid framework.