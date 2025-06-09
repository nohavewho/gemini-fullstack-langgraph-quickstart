import { GoogleGenerativeAI } from '@google/generative-ai';
import { COUNTRIES, LANGUAGES } from '../../src/lib/constants';

export const runtime = 'edge';
export const maxDuration = 300; // 5 minutes

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { 
      messages, 
      targetCountries = ['AZ'], 
      selectedCountries = ['TR', 'RU', 'IR', 'GE'],
      dateRange,
      effort = 2,
      language = 'en' 
    } = await req.json();

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content;
    
    // Build comprehensive prompt for press monitoring
    const prompt = buildPressMonitoringPrompt({
      query: userMessage,
      targetCountries,
      selectedCountries,
      dateRange,
      language,
      effort
    });

    // Use Gemini 2.0 Flash for analysis
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    // Generate streaming response
    const result = await model.generateContentStream(prompt);

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Format as AI SDK expects
              controller.enqueue(new TextEncoder().encode(`0:"${text.replace(/"/g, '\\"')}"\n`));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    console.error('API error:', error);
    
    if (error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ 
          error: 'Request timeout',
          message: 'The analysis is taking longer than expected. Please try with a lower effort level.'
        }),
        { 
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function buildPressMonitoringPrompt({
  query,
  targetCountries,
  selectedCountries,
  dateRange,
  language,
  effort
}: {
  query: string;
  targetCountries: string[];
  selectedCountries: string[];
  dateRange?: { from?: string; to?: string };
  language: string;
  effort: number;
}) {
  const targetNames = targetCountries.map(getCountryName).join(', ');
  const sourceNames = selectedCountries.map(getCountryName).join(', ');
  const langName = getLanguageName(language);
  
  // Map effort to depth
  const effortLevels = {
    1: 'basic overview with 3-5 key points',
    2: 'moderate analysis with 5-10 findings',
    3: 'comprehensive analysis with 10-15 detailed findings',
    4: 'exhaustive analysis with 15+ findings and deep insights'
  };
  
  const analysisDepth = effortLevels[effort] || effortLevels[2];
  
  return `You are an expert press monitoring and media analysis system specializing in global news coverage about ${targetNames}.

Your task: Analyze recent press coverage about ${targetNames} in media outlets from ${sourceNames}.

Context:
- Target countries: ${targetNames}
- Source countries for press: ${sourceNames}  
- Date range: ${dateRange?.from || 'last 7 days'} to ${dateRange?.to || 'today'}
- Analysis depth: ${analysisDepth}
- Response language: ${langName}

User query: "${query}"

Instructions:
1. Search and analyze relevant news articles from the specified source countries
2. Focus on articles published within the specified date range
3. Provide sentiment analysis (positive, negative, neutral)
4. Identify key themes and narratives
5. Highlight any significant developments or trending topics
6. Note any bias or particular perspectives from different sources

Format your response with these sections:

## Executive Summary
Brief overview of the main findings

## Key Findings
- Finding 1
- Finding 2
- Finding 3
(Continue based on effort level)

## Sentiment Analysis
Overall sentiment breakdown with percentages

## Major Themes
List and explain the dominant themes in coverage

## Notable Articles
Cite specific examples with source and date

## Regional Perspectives
How different source countries are covering the topic

## Trends and Patterns
Observable patterns in the coverage over time

## Recommendations
Actionable insights based on the analysis

Important: 
- Provide specific examples and quotes where relevant
- Be objective and balanced in your analysis
- Respond entirely in ${langName}
- Adjust the detail level based on the effort parameter (currently ${effort}/4)`;
}

function getCountryName(code: string): string {
  const country = COUNTRIES.find(c => c.code === code);
  return country?.name || code;
}

function getLanguageName(code: string): string {
  return LANGUAGES[code]?.name || 'English';
}