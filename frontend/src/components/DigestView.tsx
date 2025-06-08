import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Calendar,
  RefreshCw,
  Download,
  ExternalLink
} from "lucide-react";
import { format } from 'date-fns';

interface Article {
  id: string;
  title: string;
  url: string;
  source_name: string;
  source_country: string;
  source_language: string;
  language_name: string;
  published_date: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentiment_score: number;
  sentiment_explanation: string;
  key_phrases: string[];
  topics: string[];
}

interface Digest {
  id: string;
  digest_type: 'positive' | 'negative';
  content: string;
  created_at: string;
  article_count: number;
  languages_covered: number;
  countries_covered: number;
}

interface DigestViewProps {
  onRefresh?: () => void;
}

export const DigestView: React.FC<DigestViewProps> = ({ onRefresh }) => {
  const [positiveDigest, setPositiveDigest] = useState<Digest | null>(null);
  const [negativeDigest, setNegativeDigest] = useState<Digest | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'positive' | 'negative'>('positive');
  const [executiveSummary] = useState<string>('');

  useEffect(() => {
    fetchDigests();
    fetchArticles();
  }, []);

  const fetchDigests = async () => {
    try {
      // Fetch positive digest
      const posResponse = await fetch('/api/press-monitor/digest/positive');
      if (posResponse.ok) {
        const posData = await posResponse.json();
        setPositiveDigest(posData);
      }

      // Fetch negative digest
      const negResponse = await fetch('/api/press-monitor/digest/negative');
      if (negResponse.ok) {
        const negData = await negResponse.json();
        setNegativeDigest(negData);
      }
    } catch (error) {
      console.error('Error fetching digests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/press-monitor/articles?days_back=7');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchDigests();
    await fetchArticles();
    if (onRefresh) {
      await onRefresh();
    }
    setIsLoading(false);
  };

  const downloadDigest = (digest: Digest) => {
    const blob = new Blob([digest.content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azerbaijan-press-${digest.digest_type}-digest-${format(new Date(digest.created_at), 'yyyy-MM-dd')}.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const renderDigestContent = (content: string) => {
    // Simple markdown rendering (could be enhanced with a proper markdown library)
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 mt-6">{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 mt-4">{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mb-2 mt-3">{line.substring(4)}</h3>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold mb-2">{line.substring(2, line.length - 2)}</p>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.substring(2)}</li>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2">{line}</p>;
      }
    });
  };

  const getRelevantArticles = (digestType: 'positive' | 'negative') => {
    return articles.filter(article => article.sentiment === digestType);
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
      {/* Executive Summary Card */}
      {executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {renderDigestContent(executiveSummary)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digests Tabs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Press Digests
            </CardTitle>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'positive' | 'negative')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="positive" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Positive Coverage
              </TabsTrigger>
              <TabsTrigger value="negative" className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Negative Coverage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="positive" className="space-y-4">
              {positiveDigest ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(positiveDigest.created_at), 'PPP')}
                      </span>
                      <Badge variant="secondary">
                        {positiveDigest.article_count} articles
                      </Badge>
                      <Badge variant="secondary">
                        {positiveDigest.languages_covered} languages
                      </Badge>
                      <Badge variant="secondary">
                        {positiveDigest.countries_covered} countries
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => downloadDigest(positiveDigest)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-sm max-w-none">
                      {renderDigestContent(positiveDigest.content)}
                    </div>
                  </ScrollArea>

                  {/* Related Articles */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Featured Articles</h3>
                    <div className="space-y-3">
                      {getRelevantArticles('positive').slice(0, 5).map(article => (
                        <Card key={article.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{article.source_name}</span>
                              <span>•</span>
                              <span>{article.source_country}</span>
                              <span>•</span>
                              <span>{article.language_name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {article.key_phrases.slice(0, 3).map((phrase, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {phrase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No positive digest available
                </div>
              )}
            </TabsContent>

            <TabsContent value="negative" className="space-y-4">
              {negativeDigest ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(negativeDigest.created_at), 'PPP')}
                      </span>
                      <Badge variant="secondary">
                        {negativeDigest.article_count} articles
                      </Badge>
                      <Badge variant="secondary">
                        {negativeDigest.languages_covered} languages
                      </Badge>
                      <Badge variant="secondary">
                        {negativeDigest.countries_covered} countries
                      </Badge>
                    </div>
                    <Button 
                      onClick={() => downloadDigest(negativeDigest)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-sm max-w-none">
                      {renderDigestContent(negativeDigest.content)}
                    </div>
                  </ScrollArea>

                  {/* Related Articles */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Featured Articles</h3>
                    <div className="space-y-3">
                      {getRelevantArticles('negative').slice(0, 5).map(article => (
                        <Card key={article.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{article.source_name}</span>
                              <span>•</span>
                              <span>{article.source_country}</span>
                              <span>•</span>
                              <span>{article.language_name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {article.key_phrases.slice(0, 3).map((phrase, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {phrase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No negative digest available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};