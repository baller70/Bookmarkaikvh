'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Heart, 
  Bookmark, 
  Users, 
  Calendar, 
  RefreshCw,
  Download,
  Share2,
  Star,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Edit,
  Sparkles
} from 'lucide-react';
import { useCollections } from '@/hooks/use-collections';

interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  views?: number;
  likes?: number;
  bookmarks?: number;
  collections?: number;
}

export const CollectionAnalytics: React.FC = () => {
  const { analytics, getCollectionAnalytics } = useCollections();
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');
  const [loading, setLoading] = useState(false);

  // Mock data for charts
  const viewsOverTime: ChartData[] = [
    { name: 'Jan 14', views: 45, likes: 12, collections: 2 },
    { name: 'Jan 15', views: 67, likes: 18, collections: 3 },
    { name: 'Jan 16', views: 89, likes: 24, collections: 4 },
    { name: 'Jan 17', views: 123, likes: 31, collections: 5 },
    { name: 'Jan 18', views: 156, likes: 42, collections: 6 },
    { name: 'Jan 19', views: 201, likes: 56, collections: 8 },
    { name: 'Jan 20', views: 234, likes: 67, collections: 9 }
  ];

  const categoryDistribution: ChartData[] = [
    { name: 'Technology', value: 35, color: '#3B82F6' },
    { name: 'Design', value: 25, color: '#8B5CF6' },
    { name: 'Business', value: 20, color: '#10B981' },
    { name: 'Education', value: 15, color: '#F59E0B' },
    { name: 'Personal', value: 5, color: '#EF4444' }
  ];

  const topCollections: Array<{
    id: string;
    name: string;
    views: number;
    likes: number;
    bookmarks: number;
    growth: number;
  }> = [
    { id: '1', name: 'Web Development Resources', views: 1250, likes: 89, bookmarks: 15, growth: 23 },
    { id: '2', name: 'AI & Machine Learning', views: 980, likes: 67, bookmarks: 12, growth: 18 },
    { id: '3', name: 'Design Inspiration', views: 756, likes: 45, bookmarks: 8, growth: -5 },
    { id: '4', name: 'Startup Resources', views: 623, likes: 34, bookmarks: 10, growth: 12 },
    { id: '5', name: 'Learning Path', views: 445, likes: 28, bookmarks: 6, growth: 8 }
  ];

  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Views',
      value: analytics?.totalViews || 0,
      change: 15.3,
      changeType: 'increase',
      icon: <Eye className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      label: 'Total Likes',
      value: analytics?.totalLikes || 0,
      change: 8.7,
      changeType: 'increase',
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-600'
    },
    {
      label: 'Collections',
      value: analytics?.totalCollections || 0,
      change: 12.1,
      changeType: 'increase',
      icon: <Bookmark className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      label: 'Avg Bookmarks',
      value: Math.round(analytics?.averageBookmarksPerCollection || 0),
      change: -2.4,
      changeType: 'decrease',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-purple-600'
    }
  ];

  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      await getCollectionAnalytics();
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // In a real app, this would export the analytics data
    console.log('Exporting analytics data...');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collection Analytics</h2>
          <p className="text-gray-600 mt-1">
            Track performance and insights for your bookmark collections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={refreshAnalytics} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={metric.color}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold">{formatNumber(metric.value)}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views Over Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Views Over Time
                </CardTitle>
                <CardDescription>
                  Track how your collections are being discovered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Category Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of collections by category
                </CardDescription>
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
                      label={({ name, value }) => `${name}: ${value}%`}
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
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest actions on your collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {activity.type === 'created' && <Plus className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'updated' && <Edit className="h-4 w-4 text-green-600" />}
                      {activity.type === 'shared' && <Share2 className="h-4 w-4 text-purple-600" />}
                      {activity.type === 'liked' && <Heart className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Collection "{activity.collectionName}" was {activity.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>
                  Views, likes, and interactions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="likes" stroke="#EF4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Growth Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate</CardTitle>
                <CardDescription>
                  Collection creation and bookmark additions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="collections" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          {/* Top Performing Collections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Performing Collections
              </CardTitle>
              <CardDescription>
                Your most viewed and liked collections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCollections.map((collection, index) => (
                  <div key={collection.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{collection.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(collection.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {collection.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-4 w-4" />
                            {collection.bookmarks}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${
                        collection.growth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {collection.growth >= 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {Math.abs(collection.growth)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">vs last week</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Growing Engagement</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your collections received 23% more views this week compared to last week.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Top Category</span>
                  </div>
                  <p className="text-sm text-green-800">
                    Technology collections are your most popular, accounting for 35% of all views.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">Collaboration</span>
                  </div>
                  <p className="text-sm text-purple-800">
                    Collections with collaborators get 40% more engagement on average.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📈 Optimize for Discovery</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Add more descriptive tags to increase discoverability by 25%.
                  </p>
                  <Button size="sm" variant="outline">
                    Add Tags
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🤝 Invite Collaborators</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Collections with collaborators perform better. Consider inviting others.
                  </p>
                  <Button size="sm" variant="outline">
                    Invite People
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🌟 Create More Templates</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Your development template is popular. Create similar ones for other topics.
                  </p>
                  <Button size="sm" variant="outline">
                    Create Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 