'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAnalytics, useRealtimeAnalytics } from '../../hooks/useAnalytics'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Star,
  Bookmark,
  Eye,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Target,
  Users,
  Trash2,
  Lightbulb,
  Timer,
  FolderOpen,
  Tag,
  AlertTriangle,
  Zap,
  Sun
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalBookmarks: number
    totalVisits: number
    engagementScore: number
    growthRate: number
    timeSpent: number
    productivityScore: number
  }
  timeTracking: {
    dailyAverage: number
    weeklyPattern: { day: string; hours: number }[]
    peakHours: { hour: string; productivity: number }[]
    totalHours: number
  }
  bookmarkInsights: {
    topPerformers: { name: string; visits: number; timeSpent: number; productivity: number }[]
    underperformers: { name: string; visits: number; lastVisited: string; category: string }[]
    unusedBookmarks: { name: string; daysUnused: number; category: string }[]
  }
  categoryAnalysis: {
    categories: { name: string; efficiency: number; timeSpent: number; bookmarkCount: number }[]
    productivityByCategory: { category: string; score: number }[]
  }
  projectManagement: {
    activeProjects: { name: string; progress: number; deadline: string; status: string }[]
    resourceAllocation: { resource: string; utilization: number }[]
  }
  smartRecommendations: {
    cleanup: { type: string; count: number; impact: string }[]
    optimization: { suggestion: string; benefit: string; effort: string }[]
    trending: { item: string; growth: number; category: string }[]
  }
}

type Summary = {
  totalBookmarks: number
  totalVisits: number
  engagementScore: number
  totalTimeSpentMinutes: number
}

export function ComprehensiveAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [summary, setSummary] = useState<Summary | null>(null)
  
  // Real analytics data
  const { data, loading, error, lastUpdated, refetch, updateTimeRange } = useAnalytics({
    timeRange,
    autoRefresh: true,
    refreshInterval: 30000
  })

  // Load summary (live zeros)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/analytics/summary', { cache: 'no-store' })
        if (res.ok) {
          const s = await res.json()
          setSummary({
            totalBookmarks: Number(s.totalBookmarks) || 0,
            totalVisits: Number(s.totalVisits) || 0,
            engagementScore: Number(s.engagementScore) || 0,
            totalTimeSpentMinutes: Number(s.totalTimeSpentMinutes) || 0,
          })
        }
      } catch {}
    }
    load()
  }, [])

  // Real-time updates
  const { lastUpdate } = useRealtimeAnalytics()

  // Refetch when real-time update occurs
  useEffect(() => {
    if (lastUpdate) {
      refetch()
    }
  }, [lastUpdate, refetch])

  // Handle time range change
  const handleTimeRangeChange = (newRange: '7d' | '30d' | '90d' | '1y') => {
    setTimeRange(newRange)
    updateTimeRange(newRange)
  }

  // Show error state if needed
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Failed to load analytics data</div>
          <Button onClick={refetch} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Time Range Selector & Live Update Indicator */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          {lastUpdate && (
            <Badge variant="secondary" className="text-xs">
              Live updates active
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-blue-500" />
              <div className="text-sm text-gray-600">Total Bookmarks</div>
            </div>
            <div className="text-2xl font-bold">{(summary?.totalBookmarks ?? data.overview.totalBookmarks) || 0}</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <ArrowUp className="h-3 w-3" />
              +{data.overview.growthRate}% this month
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div className="text-sm text-gray-600">Total Visits</div>
            </div>
            <div className="text-2xl font-bold">{(summary?.totalVisits ?? data.overview.totalVisits || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500">This month</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div className="text-sm text-gray-600">Engagement Score</div>
            </div>
            <div className="text-2xl font-bold">{summary?.engagementScore ?? data.overview.engagementScore || 0}%</div>
            <Progress value={summary?.engagementScore ?? data.overview.engagementScore || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-500" />
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div className="text-2xl font-bold">{Number(((summary?.totalTimeSpentMinutes ?? 0) / 60).toFixed(1))}h</div>
            <div className="text-xs text-gray-500">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Unused Bookmarks for Cleanup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Top 5 Unused Bookmarks - Recommended for Cleanup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.bookmarkInsights.unusedBookmarks.slice(0, 5).map((bookmark, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-medium">{bookmark.name}</div>
                    <div className="text-sm text-gray-600">{bookmark.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-600">{bookmark.daysUnused} days unused</div>
                  <Button variant="outline" size="sm" className="mt-1">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Productivity Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{data.overview.productivityScore}%</div>
            <Progress value={data.overview.productivityScore} className="h-3 mb-2" />
            <div className="text-sm text-gray-600">
              Based on time spent vs bookmark usage efficiency
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{data.timeTracking.dailyAverage}h</div>
            <div className="text-sm text-gray-600">
              Average time spent on bookmarks per day
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTimeTracking = () => (
    <div className="space-y-6">
      {/* Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium">Daily Average</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{data.timeTracking.dailyAverage}h</div>
              <div className="text-xs text-gray-600">+0.5h vs last week</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Total Hours</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{data.timeTracking.totalHours}h</div>
              <div className="text-xs text-gray-600">This month</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Focus Sessions</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">23</div>
              <div className="text-xs text-gray-600">Avg 1.8h each</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Efficiency</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{data.timeTracking.peakHours[0].productivity}%</div>
              <div className="text-xs text-gray-600">Peak performance</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Pattern
            </CardTitle>
            <p className="text-sm text-gray-600">Your bookmark usage throughout the week</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.timeTracking.weeklyPattern.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium w-12">{day.day}</span>
                    <span className="text-sm text-gray-600">{day.hours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(day.hours / 7) * 100} className="h-3 flex-1" />
                    <span className="text-xs text-gray-500 w-8">{Math.round((day.hours / 7) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">💡 Insight</div>
              <div className="text-xs text-blue-600">You're most productive on Tuesdays and Wednesdays</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Peak Hours Analysis
            </CardTitle>
            <p className="text-sm text-gray-600">When you're most effective with bookmarks</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.timeTracking.peakHours.map((hour, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{hour.hour}</span>
                    <Badge variant={hour.productivity > 80 ? "default" : "secondary"}>
                      {hour.productivity}% efficiency
                    </Badge>
                  </div>
                  <Progress value={hour.productivity} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">
                    {hour.productivity > 80 ? "🔥 Peak performance" : 
                     hour.productivity > 60 ? "⚡ Good focus" : "😴 Low energy"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deep Dive Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-purple-500" />
              Session Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Short sessions (&lt;30min)</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Medium sessions (30min-2h)</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Long sessions (&gt;2h)</span>
              <span className="font-medium">5</span>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600">
                💡 Your optimal session length is 1.8 hours
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              Distraction Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tab switching rate</span>
              <span className="font-medium text-yellow-600">12/hour</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Focus streaks</span>
              <span className="font-medium text-green-600">6 avg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Break frequency</span>
              <span className="font-medium">Every 45min</span>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600">
                🎯 Consider 25min focused work blocks
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Time Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Goal (5h)</span>
                <span className="text-green-600">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Goal (30h)</span>
                <span className="text-blue-600">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600">
                📈 On track to exceed monthly goal
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderBookmarkInsights = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.bookmarkInsights.topPerformers.map((bookmark, index) => (
                <div key={index} className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bookmark.name}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {bookmark.productivity}% productivity
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {bookmark.visits} visits • {bookmark.timeSpent}h spent
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-500" />
              Underperformers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.bookmarkInsights.underperformers.map((bookmark, index) => (
                <div key={index} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bookmark.name}</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      {bookmark.visits} visits
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Last visited: {bookmark.lastVisited} • {bookmark.category}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCategoryAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              Category Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categoryAnalysis.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.efficiency}%</span>
                  </div>
                  <Progress value={category.efficiency} className="h-2" />
                  <div className="text-xs text-gray-500">
                    {category.timeSpent}h spent • {category.bookmarkCount} bookmarks
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Productivity by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.categoryAnalysis.productivityByCategory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm font-medium">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={item.score} className="h-2 w-20" />
                    <span className="text-sm text-gray-600">{item.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderProjectManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.projectManagement.activeProjects.map((project, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{project.name}</span>
                    <Badge 
                      variant={project.status === 'On Track' ? 'default' : project.status === 'Ahead' ? 'secondary' : 'destructive'}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Deadline: {project.deadline}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Resource Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.projectManagement.resourceAllocation.map((resource, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{resource.resource}</span>
                    <span className="text-sm text-gray-600">{resource.utilization}%</span>
                  </div>
                  <Progress value={resource.utilization} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSmartRecommendations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Cleanup Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.smartRecommendations.cleanup.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-red-50 border-red-200">
                  <div className="font-medium text-sm">{item.type}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.count} items • {item.impact}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.smartRecommendations.optimization.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="font-medium text-sm">{item.suggestion}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.benefit} • {item.effort} effort
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Trending Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.smartRecommendations.trending.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="font-medium text-sm">{item.item}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    +{item.growth}% growth • {item.category}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
         <Tabs defaultValue="overview" className="space-y-6">
       <TabsList className="grid w-full grid-cols-6">
         <TabsTrigger value="overview">Overview</TabsTrigger>
         <TabsTrigger value="time">Time Tracking</TabsTrigger>
         <TabsTrigger value="insights">Insights</TabsTrigger>
         <TabsTrigger value="categories">Categories</TabsTrigger>
         <TabsTrigger value="projects">Projects</TabsTrigger>
         <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
       </TabsList>
      <TabsContent value="overview">
        {renderOverview()}
      </TabsContent>
      <TabsContent value="time">
        {renderTimeTracking()}
      </TabsContent>
      <TabsContent value="insights">
        {renderBookmarkInsights()}
      </TabsContent>
      <TabsContent value="categories">
        {renderCategoryAnalysis()}
      </TabsContent>
      <TabsContent value="projects">
        {renderProjectManagement()}
      </TabsContent>
      <TabsContent value="recommendations">
        {renderSmartRecommendations()}
      </TabsContent>
    </Tabs>
  )
} 