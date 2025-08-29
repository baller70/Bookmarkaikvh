'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Brain, 
  Clock, 
  Hash, 
  Eye, 
  Star,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

interface CategoryAnalytics {
  id: string;
  name: string;
  bookmarkCount: number;
  totalVisits: number;
  averageTimeSpent: number;
  lastUsed: string;
  growthRate: number;
  efficiency: number;
  popularityScore: number;
  aiAccuracy?: number;
  weeklyTrend: number[];
  monthlyTrend: number[];
}

interface CategoryStats {
  totalCategories: number;
  totalBookmarks: number;
  averageBookmarksPerCategory: number;
  aiSuggestedCount: number;
  hierarchyDepth: number;
  mostPopularCategory: string;
  leastUsedCategory: string;
  categoryGrowthRate: number;
}

interface CategoryAnalyticsDashboardProps {
  analytics: CategoryAnalytics[];
  stats: CategoryStats;
  onRefresh?: () => void;
  onExport?: () => void;
  className?: string;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const CategoryAnalyticsDashboard: React.FC<CategoryAnalyticsDashboardProps> = ({
  analytics,
  stats,
  onRefresh,
  onExport,
  className = ''
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [sortBy, setSortBy] = useState<'bookmarkCount' | 'totalVisits' | 'efficiency' | 'growthRate'>('bookmarkCount');
  const [filterBy, setFilterBy] = useState<'all' | 'growing' | 'declining' | 'ai-suggested'>('all');

  // Memoized calculations
  const filteredAnalytics = useMemo(() => {
    let filtered = [...analytics];

    // Apply filters
    switch (filterBy) {
      case 'growing':
        filtered = filtered.filter(a => a.growthRate > 0);
        break;
      case 'declining':
        filtered = filtered.filter(a => a.growthRate < 0);
        break;
      case 'ai-suggested':
        filtered = filtered.filter(a => a.aiAccuracy !== undefined);
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'bookmarkCount':
          return b.bookmarkCount - a.bookmarkCount;
        case 'totalVisits':
          return b.totalVisits - a.totalVisits;
        case 'efficiency':
          return b.efficiency - a.efficiency;
        case 'growthRate':
          return b.growthRate - a.growthRate;
        default:
          return 0;
      }
    });

    return filtered;
  }, [analytics, filterBy, sortBy]);

  const topPerformers = useMemo(() => {
    return [...analytics]
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 5);
  }, [analytics]);

  const categoryDistribution = useMemo(() => {
    return analytics.map(a => ({
      name: a.name,
      value: a.bookmarkCount,
      color: COLORS[analytics.indexOf(a) % COLORS.length]
    }));
  }, [analytics]);

  const trendData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      visits: Math.floor(Math.random() * 100) + 20,
      bookmarks: Math.floor(Math.random() * 10) + 2,
      efficiency: Math.floor(Math.random() * 20) + 70
    }));
  }, [timeRange]);

  const performanceMetrics = useMemo(() => {
    const totalVisits = analytics.reduce((sum, a) => sum + a.totalVisits, 0);
    const avgEfficiency = analytics.reduce((sum, a) => sum + a.efficiency, 0) / analytics.length;
    const growingCategories = analytics.filter(a => a.growthRate > 0).length;
    const aiAccuracy = analytics
      .filter(a => a.aiAccuracy !== undefined)
      .reduce((sum, a) => sum + (a.aiAccuracy || 0), 0) / analytics.filter(a => a.aiAccuracy !== undefined).length;

    return {
      totalVisits,
      avgEfficiency: Math.round(avgEfficiency),
      growingCategories,
      aiAccuracy: Math.round(aiAccuracy)
    };
  }, [analytics]);

  return (
    <div className={`category-analytics-dashboard space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bookmarkCount">Bookmark Count</SelectItem>
              <SelectItem value="totalVisits">Total Visits</SelectItem>
              <SelectItem value="efficiency">Efficiency</SelectItem>
              <SelectItem value="growthRate">Growth Rate</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="growing">Growing</SelectItem>
              <SelectItem value="declining">Declining</SelectItem>
              <SelectItem value="ai-suggested">AI Suggested</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
              </div>
              <Hash className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {stats.aiSuggestedCount} AI suggested
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visits</p>
                <p className="text-2xl font-bold">{performanceMetrics.totalVisits.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Across all categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Efficiency</p>
                <p className="text-2xl font-bold">{performanceMetrics.avgEfficiency}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {performanceMetrics.growingCategories} growing categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold">{performanceMetrics.aiAccuracy}%</p>
              </div>
              <Brain className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              AI suggested categories
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Bookmark distribution across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Categories</CardTitle>
                <CardDescription>Categories with highest efficiency scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPerformers.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-gray-600">{category.bookmarkCount} bookmarks</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{category.efficiency}%</p>
                      <div className="flex items-center text-xs">
                        {category.growthRate > 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                        )}
                        {Math.abs(category.growthRate).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {filteredAnalytics.map(category => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Hash className="h-3 w-3 mr-1" />
                          {category.bookmarkCount} bookmarks
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {category.totalVisits} visits
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {category.averageTimeSpent}s avg
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={category.growthRate > 0 ? "default" : "secondary"}>
                        {category.growthRate > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(category.growthRate).toFixed(1)}%
                      </Badge>
                      {category.aiAccuracy && (
                        <Badge variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          {category.aiAccuracy}% AI
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Efficiency Score</span>
                        <span>{category.efficiency}%</span>
                      </div>
                      <Progress value={category.efficiency} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Popularity Score</span>
                        <span>{category.popularityScore}</span>
                      </div>
                      <Progress value={category.popularityScore} className="h-2" />
                    </div>
                    
                    {category.aiAccuracy && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>AI Accuracy</span>
                          <span>{category.aiAccuracy}%</span>
                        </div>
                        <Progress value={category.aiAccuracy} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Last used: {new Date(category.lastUsed).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Usage Trends</CardTitle>
              <CardDescription>Track category performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="visits" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="bookmarks" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Category growth rates comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="growthRate" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Scores</CardTitle>
                <CardDescription>Category efficiency comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="efficiency" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Positive Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">High AI Accuracy</p>
                    <p className="text-xs text-gray-600">
                      AI-suggested categories show {performanceMetrics.aiAccuracy}% accuracy rate
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Growing Categories</p>
                    <p className="text-xs text-gray-600">
                      {performanceMetrics.growingCategories} categories showing positive growth
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Most Popular</p>
                    <p className="text-xs text-gray-600">
                      "{stats.mostPopularCategory}" is your most active category
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Underutilized Categories</p>
                    <p className="text-xs text-gray-600">
                      "{stats.leastUsedCategory}" has low bookmark activity
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Category Depth</p>
                    <p className="text-xs text-gray-600">
                      Hierarchy depth of {stats.hierarchyDepth} levels might be too complex
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Distribution</p>
                    <p className="text-xs text-gray-600">
                      Consider redistributing bookmarks for better balance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 text-blue-600 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Optimize Category Structure</h4>
                <p className="text-sm text-blue-800">
                  Consider merging similar categories or creating subcategories for better organization.
                  Your current hierarchy depth of {stats.hierarchyDepth} levels could be simplified.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Leverage AI Suggestions</h4>
                <p className="text-sm text-green-800">
                  With {performanceMetrics.aiAccuracy}% accuracy, AI suggestions are performing well.
                  Consider accepting more AI-suggested categories to improve organization.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Focus on Growing Categories</h4>
                <p className="text-sm text-purple-800">
                  Invest more time in the {performanceMetrics.growingCategories} growing categories 
                  as they show positive engagement trends.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoryAnalyticsDashboard; 