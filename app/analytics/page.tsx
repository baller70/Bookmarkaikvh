'use client';

import React, { useState, useEffect } from 'react'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { KnowledgeGraphVisualization } from '@/components/analytics/KnowledgeGraphVisualization'
import { UsagePatternInsights } from '@/components/analytics/UsagePatternInsights'
import { TrendAnalysisReporting } from '@/components/analytics/TrendAnalysisReporting'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Network, 
  Brain, 
  TrendingUp,
  Activity,
  Target,
  Zap,
  Eye
} from 'lucide-react'

interface AnalyticsSummary {
  totalBookmarks: number;
  totalCategories: number;
  engagementScore: number;
  activeStreak: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics/summary');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics summary');
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // In a real app, this would come from authentication
  const userId = 'dev-user-123'

  const handleExport = (format: string, data?: any) => {
    console.log(`Exporting ${format}:`, data)
    // Implement export functionality
  }

  const handleShare = (reportId?: string) => {
    console.log(`Sharing report:`, reportId)
    // Implement share functionality
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <Badge variant="secondary">Pro</Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Comprehensive insights into your bookmark usage patterns and trends
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{summary?.totalBookmarks ?? 0}</div>}
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{summary?.totalCategories ?? 0}</div>}
            <p className="text-xs text-muted-foreground">All unique categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{(summary?.engagementScore ?? 0)}/10</div>}
            <p className="text-xs text-muted-foreground">Based on recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{summary?.activeStreak ?? 0} days</div>}
            <p className="text-xs text-muted-foreground">Keep it going!</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="knowledge-graph" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Knowledge Graph
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Usage Patterns
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trend Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AnalyticsDashboard
            userId={userId}
            onExport={handleExport}
            onShare={handleShare}
          />
        </TabsContent>

        <TabsContent value="knowledge-graph" className="mt-6">
          <KnowledgeGraphVisualization
            userId={userId}
            onNodeClick={(node) => console.log('Node clicked:', node)}
            onEdgeClick={(edge) => console.log('Edge clicked:', edge)}
          />
        </TabsContent>

        <TabsContent value="patterns" className="mt-6">
          <UsagePatternInsights
            userId={userId}
            onInsightClick={(insight) => console.log('Insight clicked:', insight)}
          />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendAnalysisReporting
            userId={userId}
            onExport={handleExport}
            onShare={handleShare}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 