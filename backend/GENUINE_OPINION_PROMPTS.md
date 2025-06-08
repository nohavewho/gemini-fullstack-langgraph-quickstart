# Azerbaijan Genuine Public Opinion Search Prompts

## Overview
These prompts are designed to find REAL PUBLIC DISCOURSE about Azerbaijan in international media, avoiding PR materials and official statements.

## Key Improvements Made

### 1. Query Writer Instructions
**Focus**: Generate sophisticated queries that target genuine opinions rather than official news

**Key Features**:
- Advanced search patterns for opinion pieces, editorials, expert analysis
- Specific keywords for investigative journalism and civil society views  
- Exclusion filters to avoid PR materials (-"press release" -"official statement")
- Source targeting for think tanks and credible outlets
- Language-specific patterns for finding authentic discourse

**Example Query Patterns**:
```
"Azerbaijan" opinion editorial -"press release" site:foreignpolicy.com
"Azerbaijan" expert analysis corruption -official -minister
"Azerbaijan" "human rights" investigation report site:hrw.org
"Азербайджан" мнение эксперт проблемы -"пресс-релиз"
```

### 2. Web Searcher Instructions  
**Focus**: Identify and prioritize genuine public opinion over diplomatic language

**Content Priorities**:
- Opinion & editorial pieces
- Expert analysis & research
- Investigative & in-depth reporting
- Civil society & human interest stories
- Business & economic reality assessments

**Quality Indicators**:
- Named authors with credentials
- Multiple sources beyond officials
- Discussion of problems/challenges
- Data-driven analysis
- Questions official narratives

### 3. Article Extraction Prompt
**Focus**: Deep analysis of content authenticity and opinion quality

**Analysis Framework**:
- Content type identification (Opinion/Editorial/Analysis/Investigation)
- Authenticity assessment (Genuine Opinion/Mixed/PR Material)
- Author credibility evaluation
- Evidence and data extraction
- Key insights and criticisms identification

**Output Format**:
```
CONTENT_TYPE: Editorial
AUTHOR_CREDIBILITY: High - Senior fellow at Carnegie Endowment
AUTHENTICITY: Genuine Opinion - Original analysis with multiple sources
MAIN_ARGUMENT: Azerbaijan's economic diversification faces structural challenges
CRITICISMS: Over-reliance on oil, weak institutions, corruption concerns
EVIDENCE: World Bank data, expert interviews, comparative analysis
```

### 4. Sentiment Analysis Prompt
**Focus**: Distinguish genuine sentiment from diplomatic courtesy

**Sentiment Layers**:
- Surface sentiment (apparent message)
- Underlying sentiment (real meaning)
- Implied criticisms (between the lines)
- Contextual sentiment (regional comparison)

**Authenticity Markers**:
- Genuine Positive: Specific achievements with data
- Genuine Negative: Substantive problems identified
- Diplomatic/Neutral: Vague language, avoiding controversies

### 5. Digest Generation Prompt
**Focus**: Comprehensive analysis of genuine public discourse

**Three Main Sections**:
1. **Genuine Public Discourse Digest**
   - Expert & think tank perspectives
   - Media commentary & editorials
   - Civil society & human rights views
   - Economic & business analysis

2. **Sentiment Reality Check**
   - Authentic positive sentiment
   - Genuine concerns & criticisms
   - Mixed/nuanced views

3. **Key Insights & Patterns**
   - Dominant narratives
   - Regional variations
   - Forward-looking analysis

### 6. Language-Specific Instructions
Enhanced for each language to focus on finding genuine opinions:

**Russian**: Focus on авторские колонки, экспертные оценки, think tanks like Карнеги
**Turkish**: Target köşe yazıları, uzman yorumları, araştırma raporları
**English**: Prioritize op-eds, investigative reports, think tank analysis
**Arabic**: Look for مقالات الرأي، تحليلات الخبراء، تقارير البحوث
**Persian**: Search for مقالات تحلیلی، نظرات کارشناسان
**Chinese**: Find 专栏文章、专家评论、深度分析

## Implementation Tips

1. **Query Construction**:
   - Always include exclusion filters for PR materials
   - Target specific credible sources when possible
   - Use opinion-specific keywords in local languages

2. **Content Evaluation**:
   - Prioritize articles with named authors and credentials
   - Look for evidence-based analysis, not just statements
   - Identify whether criticism is substantive or superficial

3. **Sentiment Analysis**:
   - Read between the lines for diplomatic language
   - Distinguish courtesy from genuine approval
   - Look for specific evidence supporting opinions

4. **Digest Creation**:
   - Clearly separate genuine opinion from PR
   - Highlight most impactful insights
   - Provide actionable intelligence
   - Focus on reputation implications

## Success Metrics

A successful search should find:
- 60%+ genuine opinion content (vs PR/official statements)
- Multiple perspective types (editorial, expert, investigative)
- Diverse geographic sources
- Both positive and critical viewpoints
- Evidence-based analysis
- Forward-looking insights

## Red Flags to Avoid

- Anonymous or staff-written articles
- Content that only quotes officials
- Press release language
- Lack of original analysis
- No discussion of challenges
- Overly diplomatic tone without substance