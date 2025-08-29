'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-picker'
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Users,
  BookOpen,
  Clock,
  Target,
  Zap,
  Download,
  Share,
  RefreshCw,
  Settings,
  Filter,
  Calendar,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import { AnalyticsDashboard as DashboardType, AnalyticsWidget, UserBehaviorMetrics, TimeRange } from '@/features/analytics/types'

interface AnalyticsDashboardProps {
  userId: string
  dashboardId?: string
  timeRange?: TimeRange
  onExport?: (format: string) => void
  onShare?: () => void
}

export function AnalyticsDashboard({ 
  userId, 
  dashboardId,
  timeRange: initialTimeRange,
  onExport,
  onShare 
}: AnalyticsDashboardProps) {
  const [dashboard, setDashboard] = useState<DashboardType | null>(null)
  const [userMetrics, setUserMetrics] = useState<UserBehaviorMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(
    initialTimeRange || {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
      preset: 'last_30_days',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  )
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Mock data for demonstration
  const mockBookmarkData = useMemo(() => {
    const data = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString().split('T')[0],
        bookmarks: Math.floor(Math.random() * 10) + 5,
        visits: Math.floor(Math.random() * 50) + 20,
        timeSpent: Math.floor(Math.random() * 120) + 30
      })
    }
    return data
  }, [])

  const mockCategoryData = [
    { name: 'Technology', value: 35, color: '#3b82f6' },
    { name: 'Design', value: 25, color: '#10b981' },
    { name: 'Business', value: 20, color: '#f59e0b' },
    { name: 'Education', value: 15, color: '#ef4444' },
    { name: 'Other', value: 5, color: '#8b5cf6' }
  ]

  const mockDeviceData = [
    { device: 'Desktop', visits: 450, percentage: 65 },
    { device: 'Mobile', visits: 180, percentage: 25 },
    { device: 'Tablet', visits: 70, percentage: 10 }
  ]

  const mockHourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    activity: Math.floor(Math.random() * 100) + 10
  }))

  const mockTopBookmarks = [
    { title: 'React Documentation', visits: 45, timeSpent: 120, category: 'Technology' },
    { title: 'Figma Design System', visits: 38, timeSpent: 95, category: 'Design' },
    { title: 'TypeScript Handbook', visits: 32, timeSpent: 85, category: 'Technology' },
    { title: 'Business Strategy Guide', visits: 28, timeSpent: 75, category: 'Business' },
    { title: 'UI/UX Best Practices', visits: 25, timeSpent: 65, category: 'Design' }
  ]

  useEffect(() => {
    loadDashboardData()
  }, [userId, dashboardId, timeRange])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock user metrics
      setUserMetrics({
        userId,
        totalBookmarks: 1247,
        totalVisits: 3456,
        totalTimeSpent: 2847, // minutes
        averageTimePerBookmark: 2.3,
        mostActiveHours: [9, 10, 14, 15, 20],
        mostActiveDays: ['Monday', 'Tuesday', 'Wednesday'],
        topCategories: mockCategoryData.map(cat => ({
          category: cat.name,
          count: cat.value * 10,
          visits: cat.value * 15,
          timeSpent: cat.value * 20,
          percentage: cat.value,
          growth: Math.random() > 0.5 ? Math.random() * 20 : -Math.random() * 10,
          color: cat.color
        })),
        topTags: [
          { tag: 'react', count: 156, frequency: 0.12, coOccurrence: ['javascript', 'frontend'], sentiment: 'positive', trending: true },
          { tag: 'design', count: 134, frequency: 0.11, coOccurrence: ['ui', 'ux'], sentiment: 'positive', trending: true },
          { tag: 'typescript', count: 98, frequency: 0.08, coOccurrence: ['javascript', 'react'], sentiment: 'positive', trending: false }
        ],
        searchQueries: [
          { query: 'react hooks', count: 45, resultsFound: 23, clickThroughRate: 0.85, timestamp: new Date(), success: true },
          { query: 'css grid', count: 32, resultsFound: 18, clickThroughRate: 0.78, timestamp: new Date(), success: true }
        ],
        organizationPatterns: [
          { type: 'by_category', usage: 0.65, efficiency: 0.82, preference: 0.75 },
          { type: 'by_tag', usage: 0.45, efficiency: 0.78, preference: 0.68 }
        ],
        engagementScore: 8.5,
        retentionRate: 0.85,
        lastActiveDate: new Date(),
        streakDays: 12
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }: {
    title: string
    value: string | number
    change?: number
    icon: any
    color?: string
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-500`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(change).toFixed(1)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-lg">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your bookmark usage</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange.preset} onValueChange={(value) => {
            const now = new Date()
            let start = new Date()
            
            switch (value) {
              case 'today':
                start = new Date(now.setHours(0, 0, 0, 0))
                break
              case 'last_7_days':
                start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
              case 'last_30_days':
                start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                break
              case 'last_90_days':
                start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                break
            }
            
            setTimeRange({ ...timeRange, start, end: new Date(), preset: value as any })
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="last_30_days">Last 30 days</SelectItem>
              <SelectItem value="last_90_days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {onExport && (
            <Button onClick={() => onExport('pdf')} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          
          {onShare && (
            <Button onClick={onShare} variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Bookmarks"
          value={userMetrics?.totalBookmarks.toLocaleString() || '0'}
          change={12.5}
          icon={BookOpen}
          color="blue"
        />
        <MetricCard
          title="Total Visits"
          value={userMetrics?.totalVisits.toLocaleString() || '0'}
          change={8.2}
          icon={Eye}
          color="green"
        />
        <MetricCard
          title="Time Spent"
          value={`${Math.floor((userMetrics?.totalTimeSpent || 0) / 60)}h ${(userMetrics?.totalTimeSpent || 0) % 60}m`}
          change={-2.1}
          icon={Clock}
          color="orange"
        />
        <MetricCard
          title="Engagement Score"
          value={userMetrics?.engagementScore?.toFixed(1) || '0'}
          change={5.7}
          icon={Target}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookmarks Over Time */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Bookmarks Over Time</CardTitle>
                <CardDescription>Daily bookmark creation and visit patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockBookmarkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="bookmarks" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="visits" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Breakdown by bookmark categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockCategoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>Access patterns by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDeviceData.map((device) => {
                    const Icon = device.device === 'Desktop' ? Monitor : 
                                device.device === 'Mobile' ? Smartphone : Tablet
                    return (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">{device.device}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{device.percentage}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Heatmap */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Daily Activity Pattern</CardTitle>
                <CardDescription>Your bookmark usage throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockHourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="activity" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Bookmarks */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Most Visited Bookmarks</CardTitle>
                <CardDescription>Your most frequently accessed content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopBookmarks.map((bookmark, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{bookmark.title}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {bookmark.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{bookmark.visits} visits</div>
                        <div className="text-xs text-gray-500">{bookmark.timeSpent}m total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Performance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Engagement metrics by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userMetrics?.topCategories || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" name="Bookmarks" />
                    <Bar dataKey="visits" fill="#10b981" name="Visits" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Growth Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Category growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockBookmarkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="bookmarks" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="visits" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 