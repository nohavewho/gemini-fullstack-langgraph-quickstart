# Press Monitor on Vercel Edge Functions

This implementation ports the backend press monitoring logic to run entirely on Vercel Edge Functions using the Google Gemini API.

## Overview

The press monitor has been simplified and optimized to run as serverless functions:

1. **No Backend Required**: Runs entirely on Vercel Edge
2. **Direct Gemini Integration**: Uses Google Gemini API directly
3. **Streaming Support**: Real-time progress updates
4. **Simplified Architecture**: No database, no complex state management

## Files Created

### Edge Functions
- `/functions/api/press-monitor.js` - Main press monitor API endpoint
- `/functions/api/press-monitor-stream.js` - Streaming version with real-time updates

### React Integration
- `/src/hooks/usePressMonitor.ts` - React hook for consuming the streaming API
- `/src/components/PressMonitorDemo.tsx` - Demo component showing integration
- `/src/components/ui/progress.tsx` - Progress bar component

### Testing
- `/src/test-press-monitor.html` - Standalone HTML test page

## How It Works

### 1. Orchestration Flow
```
User Request → Language Search → Article Filtering → Sentiment Analysis → Digest Generation
```

### 2. Key Features
- **Multi-language Search**: Searches in up to 8 languages simultaneously
- **Smart Filtering**: AI filters headlines to find relevant opinions
- **Sentiment Analysis**: Analyzes each article for positive/negative/neutral sentiment
- **Comprehensive Digest**: Generates executive-level summary with statistics

### 3. API Endpoints

#### Normal API: `/api/press-monitor`
```javascript
POST /api/press-monitor
{
  "target_countries": ["AZ"],
  "source_countries": [],  // Optional: specific source countries
  "search_mode": "about"   // "about" | "in" | "cross_reference"
}

Response:
{
  "success": true,
  "digest": "...comprehensive markdown digest...",
  "statistics": {
    "total_articles": 25,
    "languages_searched": 8,
    "processing_time": "45.3s",
    "positive_count": 10,
    "negative_count": 5,
    "neutral_count": 10
  },
  "articles": [...]
}
```

#### Streaming API: `/api/press-monitor-stream`
Same request format, but returns Server-Sent Events (SSE) stream:
```
data: {"type": "status", "message": "Initializing..."}
data: {"type": "phase", "phase": "search", "message": "Searching in 8 languages..."}
data: {"type": "language_complete", "language": "English", "articles_found": 5}
data: {"type": "statistics", "positive": 10, "negative": 5, "neutral": 10}
data: {"type": "complete", "digest": "...", "duration": "45.3s"}
```

## Usage Examples

### 1. Basic React Integration
```tsx
import { usePressMonitor } from '@/hooks/usePressMonitor';

function MyComponent() {
  const { state, runMonitor } = usePressMonitor();

  const handleAnalyze = () => {
    runMonitor({
      targetCountries: ['AZ', 'GE'],
      searchMode: 'about'
    });
  };

  return (
    <div>
      <button onClick={handleAnalyze}>Run Analysis</button>
      {state.status === 'streaming' && (
        <div>Progress: {state.progress}%</div>
      )}
      {state.digest && (
        <div>{state.digest}</div>
      )}
    </div>
  );
}
```

### 2. Direct API Call
```javascript
const response = await fetch('/api/press-monitor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_countries: ['AZ'],
    search_mode: 'about'
  })
});

const data = await response.json();
console.log(data.digest);
```

### 3. Streaming with Progress
```javascript
const response = await fetch('/api/press-monitor-stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target_countries: ['AZ']
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  // Parse SSE data...
}
```

## Environment Variables

Add to your Vercel project:
```
GEMINI_API_KEY=your_google_gemini_api_key
```

## Testing

1. **Local Testing**: Open `/src/test-press-monitor.html` in a browser
2. **Deploy to Vercel**: Functions will automatically deploy with your project
3. **Use Demo Component**: Import `PressMonitorDemo` in your app

## Performance

- Average processing time: 30-60 seconds for 8 languages
- Concurrent language processing for faster results
- Streaming updates for better UX
- Edge function timeout: 30 seconds (can be increased)

## Limitations

1. **No Database**: Results are not persisted
2. **Simplified Search**: Uses Gemini's knowledge instead of real-time web search
3. **Rate Limits**: Subject to Gemini API rate limits
4. **Edge Constraints**: Limited to Vercel Edge runtime capabilities

## Future Enhancements

1. Add real web search integration (Google Custom Search API)
2. Implement result caching with Vercel KV
3. Add more sophisticated temporal analysis
4. Support for scheduled monitoring
5. Export results to various formats (PDF, CSV)

## Cost Considerations

- Each analysis uses approximately 10-20 Gemini API calls
- With Gemini Flash 2.0: ~$0.01-0.02 per full analysis
- Consider implementing caching to reduce costs