'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star,
  Bookmark,
  Eye,
  Activity,
  ArrowUp,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
  PieChart,
  TimerIcon,
  Zap,
  Award,
  Globe,
  FolderIcon,
  RefreshCw
} from 'lucide-react'

interface BookmarkAnalytics {
  id: string
  title: string
  url: string
  domain: string
  folder?: string
  tags: string[]
  visitCount: number
  totalTimeSpent: number // in minutes
  lastVisited: string
  createdAt: string
  avgSessionTime: number
  isUnused: boolean
  productivityScore: number
}

interface AnalyticsSummary {
  totalBookmarks: number
  totalVisits: number
  totalTimeSpent: number
  avgTimePerBookmark: number
  mostUsedDomain: string
  leastUsedBookmarks: number
  productivityScore: number
  weeklyGrowth: number
  topCategories: Array<{ name: string; count: number; timeSpent: number }>
  timeDistribution: Array<{ hour: number; visits: number }>
  unusedBookmarks: BookmarkAnalytics[]
  topPerformers: BookmarkAnalytics[]
  recommendations: Array<{ type: 'delete' | 'organize' | 'prioritize'; message: string; count: number }>
}

interface ComprehensiveAnalyticsDashboardProps {
  userId: string
}

export function ComprehensiveAnalyticsDashboard({ userId }: ComprehensiveAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeSection, setActiveSection] = useState<'overview' | 'usage' | 'productivity' | 'recommendations'>('overview')

  useEffect(() => {
    loadAnalyticsData()
  }, [userId, selectedTimeRange])

  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      // Mock comprehensive analytics data
      const mockBookmarks: BookmarkAnalytics[] = [
        {
          id: '1',
          title: 'React Documentation',
          url: 'https://react.dev',
          domain: 'react.dev',
          folder: 'Development',
          tags: ['React', 'JavaScript', 'Frontend'],
          visitCount: 45,
          totalTimeSpent: 180, // 3 hours
          lastVisited: '2024-01-20T15:30:00Z',
          createdAt: '2024-01-01T10:00:00Z',
          avgSessionTime: 4,
          isUnused: false,
          productivityScore: 95
        },
        {
          id: '2',
          title: 'Old Tutorial - jQuery Basics',
          url: 'https://example.com/jquery-tutorial',
          domain: 'example.com',
          folder: 'Learning',
          tags: ['jQuery', 'JavaScript'],
          visitCount: 2,
          totalTimeSpent: 5,
          lastVisited: '2023-12-01T10:00:00Z',
          createdAt: '2023-11-15T10:00:00Z',
          avgSessionTime: 2.5,
          isUnused: true,
          productivityScore: 15
        }
      ]

      const totalBookmarks = mockBookmarks.length
      const totalVisits = mockBookmarks.reduce((sum, b) => sum + b.visitCount, 0)
      const totalTimeSpent = mockBookmarks.reduce((sum, b) => sum + b.totalTimeSpent, 0)
      const unusedBookmarks = mockBookmarks.filter(b => b.isUnused)
      const topPerformers = mockBookmarks
        .filter(b => !b.isUnused)
        .sort((a, b) => b.productivityScore - a.productivityScore)
        .slice(0, 5)

      const mockData: AnalyticsSummary = {
        totalBookmarks,
        totalVisits,
        totalTimeSpent,
        avgTimePerBookmark: totalTimeSpent / totalBookmarks,
        mostUsedDomain: 'react.dev',
        leastUsedBookmarks: unusedBookmarks.length,
        productivityScore: Math.round(mockBookmarks.reduce((sum, b) => sum + b.productivityScore, 0) / totalBookmarks),
        weeklyGrowth: 12.5,
        topCategories: [
          { name: 'Development', count: 1, timeSpent: 180 },
          { name: 'Learning', count: 1, timeSpent: 5 }
        ],
        timeDistribution: [
          { hour: 9, visits: 25 },
          { hour: 14, visits: 22 }
        ],
        unusedBookmarks,
        topPerformers,
        recommendations: [
          { type: 'delete', message: 'Remove unused bookmarks older than 60 days', count: unusedBookmarks.length }
        ]
      }

      setData(mockData)
      setBookmarks(mockBookmarks)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const sidebarSections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'usage', label: 'Usage Patterns', icon: Activity },
    { id: 'productivity', label: 'Productivity', icon: Target },
    { id: 'recommendations', label: 'Recommendations', icon: Zap }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 sticky top-0 h-screen overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analytics</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive insights</p>
          </div>

          <div className="space-y-2">
            {sidebarSections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Time Range</h3>
            <div className="space-y-1">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`w-full text-left px-2 py-1 text-sm rounded ${
                    selectedTimeRange === range
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {range === '7d' && 'Last 7 days'}
                  {range === '30d' && 'Last 30 days'}
                  {range === '90d' && 'Last 3 months'}
                  {range === '1y' && 'Last year'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sidebarSections.find(s => s.id === activeSection)?.label}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {activeSection === 'overview' && 'Complete overview of your bookmark usage and performance'}
                  {activeSection === 'usage' && 'Detailed patterns of how you interact with your bookmarks'}
                  {activeSection === 'productivity' && 'Insights into your most valuable bookmarks and time usage'}
                  {activeSection === 'recommendations' && 'Smart suggestions to optimize your bookmark collection'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadAnalyticsData}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookmarks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalBookmarks}</p>
                      </div>
                      <Bookmark className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 dark:text-green-400">+{data.weeklyGrowth}%</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">this week</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Time Spent</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(data.totalTimeSpent)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Avg: {formatTime(data.avgTimePerBookmark)} per bookmark
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productivity Score</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.productivityScore}%</p>
                      </div>
                      <Target className="h-8 w-8 text-purple-500" />
                    </div>
                    <Progress value={data.productivityScore} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unused Bookmarks</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.leastUsedBookmarks}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {Math.round((data.leastUsedBookmarks / data.totalBookmarks) * 100)}% of total
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span>Category Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topCategories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.name}</span>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{category.count} bookmarks</span>
                            <span>{formatTime(category.timeSpent)}</span>
                          </div>
                        </div>
                        <Progress 
                          value={(category.count / data.totalBookmarks) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Usage Patterns Section */}
          {activeSection === 'usage' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>Visit Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.timeDistribution.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {item.hour}:00 - {item.hour + 1}:00
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(item.visits / Math.max(...data.timeDistribution.map(d => d.visits))) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                            {item.visits}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Productivity Section */}
          {activeSection === 'productivity' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.topPerformers.map((bookmark, index) => (
                      <div key={bookmark.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            <h4 className="font-medium text-sm truncate">{bookmark.title}</h4>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {bookmark.visitCount} visits • {formatTime(bookmark.totalTimeSpent)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            {bookmark.productivityScore}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recommendations Section */}
          {activeSection === 'recommendations' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <span>Cleanup Suggestions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start space-x-3">
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-800 dark:text-red-300">
                            Remove Unused Bookmarks
                          </h4>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {data.leastUsedBookmarks} bookmarks haven't been visited in over 60 days
                          </p>
                          <div className="mt-3 space-y-2">
                            {data.unusedBookmarks.slice(0, 3).map((bookmark) => (
                              <div key={bookmark.id} className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 p-2 rounded">
                                <span className="truncate">{bookmark.title}</span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  {new Date(bookmark.lastVisited).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button size="sm" variant="outline" className="mt-3">
                            Review All ({data.leastUsedBookmarks})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 