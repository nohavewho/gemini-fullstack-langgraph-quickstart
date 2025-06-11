// Test script to debug Press Monitor on production
// Run this in browser console on airesearchprojects.com

async function testPressMonitorAPI() {
    console.log('=== Testing Press Monitor API ===');
    
    const testData = {
        target_countries: ['AZ'],
        source_countries: ['KZ', 'UZ', 'TM', 'KG', 'TJ'],
        search_mode: 'about',
        date_from: '2025-06-03',
        date_to: '2025-06-10'
    };
    
    console.log('Request data:', testData);
    
    try {
        const response = await fetch('/api/press-monitor-langgraph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            const error = await response.text();
            console.error('API Error:', error);
            return;
        }
        
        // Read SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let eventCount = 0;
        
        console.log('Starting to read stream...');
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                console.log('Stream complete!');
                break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    eventCount++;
                    try {
                        const data = JSON.parse(line.slice(6));
                        console.log(`Event #${eventCount} (${data.type}):`, data);
                        
                        // Log specific important events
                        if (data.type === 'complete') {
                            console.log('✅ ANALYSIS COMPLETE!');
                            console.log('Digest:', data.digest);
                            console.log('Duration:', data.duration);
                        } else if (data.type === 'error') {
                            console.error('❌ ERROR:', data.error);
                        } else if (data.type === 'statistics') {
                            console.log('📊 Statistics:', {
                                total: data.total_articles,
                                positive: data.positive,
                                negative: data.negative
                            });
                        }
                    } catch (e) {
                        console.error('Failed to parse event:', e, line);
                    }
                }
            }
        }
        
        console.log(`Total events received: ${eventCount}`);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Also test if the hook is properly initialized
function checkPressMonitorHook() {
    console.log('=== Checking Press Monitor Hook ===');
    
    // Try to find React components
    const reactRoot = document.querySelector('#root')._reactRootContainer;
    if (reactRoot) {
        console.log('React root found');
        // This would require React DevTools to properly inspect
        console.log('Install React DevTools to inspect component state');
    }
    
    // Check if usePressMonitor is being called
    console.log('Look for console logs starting with [usePressMonitor]');
}

// Run tests
console.log('Run testPressMonitorAPI() to test the API');
console.log('Run checkPressMonitorHook() to check React hook');