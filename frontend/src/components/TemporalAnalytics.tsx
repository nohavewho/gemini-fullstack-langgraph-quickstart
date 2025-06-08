import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe,
  AlertCircle,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { format } from 'date-fns';

interface TemporalTrend {
  period_days: number;
  total_articles: number;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
    positive_percentage: number;
    negative_percentage: number;
    neutral_percentage: number;
  };
  top_topics: Array<[string, number]>;
  daily_average: number;
  trend: 'improving' | 'declining' | 'stable' | 'volatile' | 'insufficient_data';
}

interface DailySentiment {
  [date: string]: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
}

interface TrendChange {
  date: string;
  change_percentage: number;
  direction: 'improvement' | 'deterioration';
  current_avg: number;
  previous_avg: number;
}

interface TemporalAnalysis {
  country?: string;
  region?: string;
  trends: {
    '7_days': TemporalTrend;
    '30_days': TemporalTrend;
    '90_days': TemporalTrend;
  };
  detailed_analysis: {
    daily_sentiment: DailySentiment;
    trend_changes: TrendChange[];
    volatility_score: number;
    significant_events: Array<{
      date: string;
      article_count: number;
      sentiment_breakdown: {
        positive: number;
        negative: number;
        neutral: number;
      };
      significance: string;
      top_topics: Array<[string, number]>;
    }>;
  };
  predictions: {
    next_7_days: string;
    next_30_days: string;
    confidence: 'high' | 'medium' | 'low';
    influencing_factors: string[];
    explanation: string;
  };
}

interface TemporalAnalyticsProps {
  onRefresh?: () => void;
}

export const TemporalAnalytics: React.FC<TemporalAnalyticsProps> = ({ onRefresh }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<TemporalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'predictions'>('overview');

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry !== 'all') {
      fetchAnalysis(selectedCountry);
    }
  }, [selectedCountry]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/press-monitor/statistics');
      if (response.ok) {
        const data = await response.json();
        const countryList = Object.keys(data.by_country || {}).filter(
          country => data.by_country[country].total > 10
        );
        setCountries(countryList);
        if (countryList.length > 0) {
          setSelectedCountry(countryList[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchAnalysis = async (country: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/press-monitor/temporal/${country}?periods=7&periods=30&periods=90`);
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching temporal analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedCountry !== 'all') {
      await fetchAnalysis(selectedCountry);
    }
    if (onRefresh) {
      await onRefresh();
    }
  };

  const prepareDailyChartData = (dailySentiment: DailySentiment) => {
    return Object.entries(dailySentiment)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: format(new Date(date), 'MMM dd'),
        fullDate: date,
        positive: data.positive,
        negative: data.negative,
        neutral: data.neutral,
        total: data.total,
        positivePercentage: data.total > 0 ? (data.positive / data.total * 100).toFixed(1) : 0,
        negativePercentage: data.total > 0 ? (data.negative / data.total * 100).toFixed(1) : 0
      }));
  };


  const COLORS = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280'
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'volatile':
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadgeVariant = (trend: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (trend) {
      case 'improving':
        return 'default';
      case 'declining':
        return 'destructive';
      case 'volatile':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Temporal Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select a country</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={isLoading || selectedCountry === 'all'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {analysis ? (
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Period Comparison */}
            <div className="grid grid-cols-3 gap-4">
              {['7_days', '30_days', '90_days'].map((period) => {
                const trend = analysis.trends[period as keyof typeof analysis.trends];
                return (
                  <Card key={period}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-medium">
                          {period.replace('_', ' ').replace('days', 'Days')}
                        </CardTitle>
                        <Badge variant={getTrendBadgeVariant(trend.trend)}>
                          {getTrendIcon(trend.trend)}
                          <span className="ml-1">{trend.trend}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{trend.total_articles}</div>
                        <div className="text-xs text-muted-foreground">
                          {trend.daily_average.toFixed(1)} articles/day
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div>
                            <span className="text-green-600">+{trend.sentiment_breakdown.positive_percentage.toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-red-600">-{trend.sentiment_breakdown.negative_percentage.toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">~{trend.sentiment_breakdown.neutral_percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Daily Sentiment Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareDailyChartData(analysis.detailed_analysis.daily_sentiment)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded p-2 shadow-lg">
                              <p className="font-semibold">{data.fullDate}</p>
                              <p className="text-sm">Total: {data.total} articles</p>
                              <p className="text-sm text-green-600">Positive: {data.positive} ({data.positivePercentage}%)</p>
                              <p className="text-sm text-red-600">Negative: {data.negative} ({data.negativePercentage}%)</p>
                              <p className="text-sm text-gray-600">Neutral: {data.neutral}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="positive" 
                      stackId="1" 
                      stroke={COLORS.positive} 
                      fill={COLORS.positive} 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="negative" 
                      stackId="1" 
                      stroke={COLORS.negative} 
                      fill={COLORS.negative} 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="neutral" 
                      stackId="1" 
                      stroke={COLORS.neutral} 
                      fill={COLORS.neutral} 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volatility Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sentiment Volatility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {(analysis.detailed_analysis.volatility_score * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analysis.detailed_analysis.volatility_score > 0.7 ? 'High volatility' :
                       analysis.detailed_analysis.volatility_score > 0.3 ? 'Moderate volatility' :
                       'Low volatility'}
                    </p>
                  </div>
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { value: analysis.detailed_analysis.volatility_score },
                            { value: 1 - analysis.detailed_analysis.volatility_score }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={90}
                          endAngle={-270}
                          innerRadius="60%"
                          outerRadius="80%"
                          dataKey="value"
                        >
                          <Cell fill={
                            analysis.detailed_analysis.volatility_score > 0.7 ? COLORS.negative :
                            analysis.detailed_analysis.volatility_score > 0.3 ? '#f59e0b' :
                            COLORS.positive
                          } />
                          <Cell fill="#e5e7eb" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {/* Trend Changes */}
            {analysis.detailed_analysis.trend_changes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Significant Trend Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.detailed_analysis.trend_changes.map((change, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {change.direction === 'improvement' ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{format(new Date(change.date), 'PPP')}</p>
                            <p className="text-sm text-muted-foreground">
                              {change.direction === 'improvement' ? 'Positive' : 'Negative'} shift of {Math.abs(change.change_percentage).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Significant Events */}
            {analysis.detailed_analysis.significant_events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">High-Activity Days</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysis.detailed_analysis.significant_events.map((event, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{format(new Date(event.date), 'PPP')}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.article_count} articles (unusually high)
                            </p>
                          </div>
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            High Activity
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div className="text-green-600">
                            +{event.sentiment_breakdown.positive}
                          </div>
                          <div className="text-red-600">
                            -{event.sentiment_breakdown.negative}
                          </div>
                          <div className="text-gray-600">
                            ~{event.sentiment_breakdown.neutral}
                          </div>
                        </div>
                        {event.top_topics.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {event.top_topics.slice(0, 3).map(([topic, count], topicIdx) => (
                              <Badge key={topicIdx} variant="outline" className="text-xs">
                                {topic} ({count})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Topics Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="7_days">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="7_days">7 Days</TabsTrigger>
                    <TabsTrigger value="30_days">30 Days</TabsTrigger>
                    <TabsTrigger value="90_days">90 Days</TabsTrigger>
                  </TabsList>
                  {['7_days', '30_days', '90_days'].map((period) => {
                    const trend = analysis.trends[period as keyof typeof analysis.trends];
                    return (
                      <TabsContent key={period} value={period}>
                        <div className="space-y-2">
                          {trend.top_topics.slice(0, 10).map(([topic, count], idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm">{topic}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ 
                                      width: `${(count / trend.total_articles * 100)}%` 
                                    }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground w-12 text-right">
                                  {count}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            {/* Predictions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Future Outlook</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Prediction Confidence: {analysis.predictions.confidence}</AlertTitle>
                  <AlertDescription>
                    {analysis.predictions.explanation}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Next 7 Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={getTrendBadgeVariant(analysis.predictions.next_7_days)} className="text-lg py-1">
                        {analysis.predictions.next_7_days.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Next 30 Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge variant={getTrendBadgeVariant(analysis.predictions.next_30_days)} className="text-lg py-1">
                        {analysis.predictions.next_30_days.replace('_', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {analysis.predictions.influencing_factors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Key Influencing Factors</h4>
                    <ul className="space-y-1">
                      {analysis.predictions.influencing_factors.map((factor, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations based on predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.predictions.next_7_days === 'declining' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Immediate Action Required</AlertTitle>
                      <AlertDescription>
                        Negative sentiment is predicted to continue. Consider proactive communication strategies.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {analysis.predictions.next_7_days === 'improving' && (
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertTitle>Capitalize on Positive Momentum</AlertTitle>
                      <AlertDescription>
                        Positive trends are expected to continue. This is an opportunity for enhanced engagement.
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysis.predictions.next_7_days === 'volatile' && (
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertTitle>Monitor Closely</AlertTitle>
                      <AlertDescription>
                        High volatility expected. Increase monitoring frequency and prepare flexible response strategies.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a country to view temporal analytics
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};