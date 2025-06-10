# Vercel Timeout Solutions Guide

## Understanding Vercel Function Timeouts

### Runtime Comparison

| Feature | Edge Runtime | Node.js Runtime |
|---------|--------------|-----------------|
| Initial Response | Must respond within 25 seconds | Can take up to maxDuration |
| Max Duration | 300 seconds (5 min) | 10s (Hobby), 60s-300s (Pro), 900s (Enterprise) |
| Streaming | Supported but must start within 25s | Fully supported |
| Global Distribution | Yes | Regional |
| Node.js APIs | Limited (Web APIs only) | Full access |
| Cold Start | Faster | Slower |

### Current Issues & Solutions

#### Problem: 504 Gateway Timeout on Edge Functions
- **Cause**: Edge functions must send initial response within 25 seconds
- **Solution**: Switch to Node.js runtime or implement early response pattern

#### Problem: maxDuration not working
- **Cause**: Runtime mismatch or plan limitations
- **Solution**: Ensure correct runtime configuration and verify plan limits

## Implementation Solutions

### Solution 1: Use Node.js Runtime (Recommended)

```javascript
// In your API file
export const config = {
  runtime: 'nodejs',
  maxDuration: 300, // up to 5 minutes on Pro plan
};
```

### Solution 2: Edge Runtime with Early Response

```javascript
export const config = {
  runtime: 'edge',
  maxDuration: 300,
};

export default async function handler(request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  
  // Start async processing
  processLongRunning(writer).catch(console.error);
  
  // Return stream immediately
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  });
}
```

### Solution 3: Enable Vercel Fluid Compute

For network-intensive operations, enable Fluid Compute in your Vercel dashboard:
- Provides up to 14 minutes execution time on paid plans
- Better for data processing and API calls
- Requires redeployment after enabling

## Configuration Best Practices

### 1. vercel.json Configuration

```json
{
  "functions": {
    "api/long-running.js": {
      "runtime": "nodejs20.x",
      "maxDuration": 300
    },
    "api/streaming.js": {
      "runtime": "edge",
      "maxDuration": 300
    }
  }
}
```

### 2. Inline Configuration (Takes Precedence)

```javascript
export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};
```

## Streaming Response Patterns

### For AI SDK v5

```javascript
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

// Node.js runtime - simple streaming
const response = await streamText({
  model: google('gemini-2.5-flash-preview-05-20'),
  prompt: 'Your prompt',
});

return response.toTextStreamResponse();
```

### For Custom Streaming

```javascript
// Edge runtime - must respond quickly
const stream = new ReadableStream({
  async start(controller) {
    // Send initial data within 25 seconds
    controller.enqueue('data: {"status": "processing"}\n\n');
    
    // Continue processing
    const result = await longRunningOperation();
    controller.enqueue(`data: ${JSON.stringify(result)}\n\n`);
    controller.close();
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
  }
});
```

## Debugging Tips

1. **Check Function Logs**: 
   ```bash
   vercel logs
   ```

2. **Verify Runtime**: Add logging to confirm runtime
   ```javascript
   console.log('Runtime:', process.env.VERCEL_REGION || 'edge');
   ```

3. **Test Locally**: Use Vercel CLI
   ```bash
   vercel dev
   ```

4. **Monitor Execution Time**: Add timing logs
   ```javascript
   const start = Date.now();
   // ... your code ...
   console.log('Execution time:', Date.now() - start);
   ```

## Plan Limits Summary

| Plan | Default Timeout | Max Configurable | With Fluid Compute |
|------|----------------|------------------|-------------------|
| Hobby | 10 seconds | 10 seconds | 60 seconds |
| Pro | 10 seconds | 300 seconds | 840 seconds |
| Enterprise | 15 seconds | 900 seconds | 900 seconds |

## Recommendations

1. **For Long-Running APIs**: Use Node.js runtime with proper maxDuration
2. **For Global Low-Latency**: Use Edge runtime with early response pattern
3. **For AI/ML Workloads**: Enable Fluid Compute on Pro/Enterprise plans
4. **For Streaming**: Ensure initial response within timeout window

## Important Notes

- Always redeploy after changing configuration
- Edge runtime changes coming March 2025 (300s total limit)
- Consider using background jobs for operations > 5 minutes
- Use proper error handling for timeout scenarios