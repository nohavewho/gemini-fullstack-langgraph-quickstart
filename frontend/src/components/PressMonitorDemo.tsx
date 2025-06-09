/**
 * Demo component for the Press Monitor functionality
 */

import React from 'react';
import { usePressMonitor } from '../hooks/usePressMonitor';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Loader2, Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function PressMonitorDemo() {
  const { state, runMonitor, reset } = usePressMonitor();

  const handleRunMonitor = () => {
    runMonitor({
      targetCountries: ['AZ'],
      searchMode: 'about',
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Press Monitor Demo</CardTitle>
          <CardDescription>
            Real-time press monitoring powered by Google Gemini running on Vercel Edge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.status === 'idle' && (
            <Button onClick={handleRunMonitor} className="w-full">
              <Globe className="mr-2 h-4 w-4" />
              Start Press Monitoring
            </Button>
          )}

          {(state.status === 'loading' || state.status === 'streaming') && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">{state.message}</span>
              </div>

              {state.progress > 0 && (
                <Progress value={state.progress} className="w-full" />
              )}

              {state.phase && (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{state.phase}</Badge>
                  {state.phase === 'search' && state.languages.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      Searching in {state.languages.length} languages
                    </span>
                  )}
                </div>
              )}

              {Object.keys(state.languageProgress).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Language Progress:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(state.languageProgress).map(([code, progress]) => (
                      <div key={code} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{code}</span>
                        {progress.status === 'processing' && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {progress.status === 'complete' && (
                          <Badge variant="secondary" className="text-xs">
                            {progress.articlesFound} articles
                          </Badge>
                        )}
                        {progress.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">Error</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state.statistics && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Live Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="flex items-center justify-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-2xl font-bold">{state.statistics.positive}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Positive</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-yellow-600">
                          <Minus className="h-4 w-4 mr-1" />
                          <span className="text-2xl font-bold">{state.statistics.neutral}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Neutral</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center text-red-600">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          <span className="text-2xl font-bold">{state.statistics.negative}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Negative</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total Articles:</span>
                        <span>{state.statistics.totalArticles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Languages:</span>
                        <span>{state.statistics.languages}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sources:</span>
                        <span>{state.statistics.sources}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {state.status === 'complete' && state.digest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="default" className="text-sm">
                  Analysis Complete
                </Badge>
                {state.processingTime && (
                  <span className="text-sm text-muted-foreground">
                    Processed in {state.processingTime}
                  </span>
                )}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Press Monitoring Digest</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: formatMarkdown(state.digest) }} />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={reset} variant="outline" className="w-full">
                Run Another Analysis
              </Button>
            </div>
          )}

          {state.status === 'error' && (
            <div className="space-y-4">
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{state.error}</p>
                </CardContent>
              </Card>
              <Button onClick={reset} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
}