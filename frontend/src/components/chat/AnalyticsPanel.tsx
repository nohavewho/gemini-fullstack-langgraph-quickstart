import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, LineChart, BarChart3, Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { AnalysisResult } from "@/lib/types";

interface AnalyticsPanelProps {
  results: AnalysisResult | null;
}

export function AnalyticsPanel({ results }: AnalyticsPanelProps) {
  if (!results) return null;

  return (
    <Tabs defaultValue="sentiment" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="sentiment" className="text-xs">
          <PieChart className="w-3 h-3 mr-1" />
          Sentiment
        </TabsTrigger>
        <TabsTrigger value="coverage" className="text-xs">
          <BarChart3 className="w-3 h-3 mr-1" />
          Coverage
        </TabsTrigger>
        <TabsTrigger value="timeline" className="text-xs">
          <LineChart className="w-3 h-3 mr-1" />
          Timeline
        </TabsTrigger>
        <TabsTrigger value="topics" className="text-xs">
          <Activity className="w-3 h-3 mr-1" />
          Topics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sentiment" className="mt-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Sentiment Analysis</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Positive</span>
              <span className="text-sm font-medium">{results.sentiment.positive}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${results.sentiment.positive}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Negative</span>
              <span className="text-sm font-medium">{results.sentiment.negative}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-red-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${results.sentiment.negative}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Neutral</span>
              <span className="text-sm font-medium">{results.sentiment.neutral}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gray-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${results.sentiment.neutral}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="coverage" className="mt-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Coverage by Country</h4>
          <div className="space-y-2">
            {results.coverage.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.country}</span>
                <span className="text-sm font-medium">{item.articles} articles</span>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="timeline" className="mt-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Timeline</h4>
          <div className="space-y-2">
            {results.timeline.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{item.date}</span>
                <span className="text-sm font-medium">{item.mentions} mentions</span>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="topics" className="mt-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Topics Distribution</h4>
          <div className="space-y-2">
            {results.topics.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{item.topic}</span>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}