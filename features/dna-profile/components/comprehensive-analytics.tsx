'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  Globe,
  Folder,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Timer,
  Zap,
  TrendingDown,
  PieChart,
  LineChart,
  Hash,
  Archive,
  Trash2
} from 'lucide-react'

interface ComprehensiveAnalyticsData {
  timeTracking: {
    totalTimeSpent: number // hours
    averageSessionTime: number // minutes
    mostActiveHours: string[]
    weeklyPattern: { day: string; hours: number }[]
    productivity: {
      focusedTime: number
      distractedTime: number
      productivityScore: number
    }
  }
  bookmarkInsights: {
    totalBookmarks: number
    activeBookmarks: number
    unusedBookmarks: number
    favoriteBookmarks: number
    averageVisitsPerBookmark: number
    topPerformers: Array<{
      title: string
      visits: number
      timeSpent: number
      lastVisited: string
      productivity: 'high' | 'medium' | 'low'
    }>
    underperformers: Array<{
      title: string
      visits: number
      daysSinceLastVisit: number
      category: string
      recommendation: string
    }>
  }
  categoryAnalysis: {
    categories: Array<{
      name: string
      count: number
      totalVisits: number
      averageTimeSpent: number
      efficiency: number
      trend: 'up' | 'down' | 'stable'
    }>
    mostProductiveCategory: string
    leastProductiveCategory: string
  }
  projectManagement: {
    activeProjects: number
    completedProjects: number
    projectEfficiency: number
    resourceAllocation: Array<{
      project: string
      timeSpent: number
      progress: number
      priority: 'high' | 'medium' | 'low'
      status: 'on-track' | 'behind' | 'ahead'
    }>
    upcomingDeadlines: Array<{
      project: string
      deadline: string
      daysLeft: number
      completion: number
    }>
  }
  recommendations: {
    toDelete: Array<{
      title: string
      reason: string
      daysSinceLastVisit: number
      category: string
    }>
    toOptimize: Array<{
      title: string
      suggestion: string
      potentialTimeSaving: number
    }>
    trending: Array<{
      title: string
      growthRate: number
      category: string
    }>
  }
}

const sidebarSections = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'time-tracking', label: 'Time Tracking', icon: Clock },
  { id: 'bookmark-insights', label: 'Bookmark Insights', icon: Bookmark },
  { id: 'category-analysis', label: 'Category Analysis', icon: PieChart },
  { id: 'project-management', label: 'Project Management', icon: Target },
  { id: 'recommendations', label: 'Smart Recommendations', icon: Zap }
]

export function ComprehensiveAnalytics() {
  const [data, setData] = useState<ComprehensiveAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadComprehensiveData()
  }, [timeRange])

  const loadComprehensiveData = async () => {
    setLoading(true)
    try {
      // Mock comprehensive analytics data
      const mockData: ComprehensiveAnalyticsData = {
        timeTracking: {
          totalTimeSpent: 127.5,
          averageSessionTime: 23,
          mostActiveHours: ['9:00 AM', '2:00 PM', '7:00 PM'],
          weeklyPattern: [
            { day: 'Mon', hours: 18.5 },
            { day: 'Tue', hours: 22.3 },
            { day: 'Wed', hours: 19.8 },
            { day: 'Thu', hours: 25.1 },
            { day: 'Fri', hours: 21.7 },
            { day: 'Sat', hours: 12.4 },
            { day: 'Sun', hours: 7.7 }
          ],
          productivity: {
            focusedTime: 89.2,
            distractedTime: 38.3,
            productivityScore: 82
          }
        },
        bookmarkInsights: {
          totalBookmarks: 247,
          activeBookmarks: 156,
          unusedBookmarks: 91,
          favoriteBookmarks: 23,
          averageVisitsPerBookmark: 7.4,
          topPerformers: [
            { title: 'React Documentation', visits: 89, timeSpent: 12.5, lastVisited: '2024-01-20', productivity: 'high' },
            { title: 'GitHub Repository', visits: 67, timeSpent: 8.3, lastVisited: '2024-01-19', productivity: 'high' },
            { title: 'Figma Design System', visits: 45, timeSpent: 6.7, lastVisited: '2024-01-18', productivity: 'medium' },
            { title: 'TypeScript Handbook', visits: 34, timeSpent: 9.2, lastVisited: '2024-01-17', productivity: 'high' },
            { title: 'VS Code Extensions', visits: 28, timeSpent: 3.4, lastVisited: '2024-01-16', productivity: 'medium' }
          ],
          underperformers: [
            { title: 'Old Tutorial Site', visits: 2, daysSinceLastVisit: 45, category: 'Learning', recommendation: 'Consider removing - outdated content' },
            { title: 'Unused Design Tool', visits: 1, daysSinceLastVisit: 62, category: 'Design', recommendation: 'Archive or delete - not being used' },
            { title: 'Dead Project Link', visits: 0, daysSinceLastVisit: 89, category: 'Development', recommendation: 'Delete - link appears broken' },
            { title: 'Outdated Framework Docs', visits: 3, daysSinceLastVisit: 38, category: 'Development', recommendation: 'Update to newer version' },
            { title: 'Inactive Blog', visits: 1, daysSinceLastVisit: 71, category: 'Learning', recommendation: 'Remove - no longer active' }
          ]
        },
        categoryAnalysis: {
          categories: [
            { name: 'Development', count: 89, totalVisits: 456, averageTimeSpent: 15.2, efficiency: 87, trend: 'up' },
            { name: 'Design', count: 64, totalVisits: 234, averageTimeSpent: 12.8, efficiency: 72, trend: 'stable' },
            { name: 'Productivity', count: 45, totalVisits: 189, averageTimeSpent: 8.5, efficiency: 68, trend: 'up' },
            { name: 'Learning', count: 32, totalVisits: 123, averageTimeSpent: 18.7, efficiency: 91, trend: 'up' },
            { name: 'Others', count: 17, totalVisits: 67, averageTimeSpent: 6.3, efficiency: 45, trend: 'down' }
          ],
          mostProductiveCategory: 'Learning',
          leastProductiveCategory: 'Others'
        },
        projectManagement: {
          activeProjects: 8,
          completedProjects: 12,
          projectEfficiency: 78,
          resourceAllocation: [
            { project: 'E-commerce Platform', timeSpent: 45.2, progress: 78, priority: 'high', status: 'on-track' },
            { project: 'Mobile App Design', timeSpent: 32.1, progress: 65, priority: 'high', status: 'behind' },
            { project: 'API Documentation', timeSpent: 18.7, progress: 92, priority: 'medium', status: 'ahead' },
            { project: 'User Research', timeSpent: 12.3, progress: 45, priority: 'medium', status: 'on-track' },
            { project: 'Performance Optimization', timeSpent: 8.9, progress: 23, priority: 'low', status: 'behind' }
          ],
          upcomingDeadlines: [
            { project: 'Mobile App Design', deadline: '2024-02-15', daysLeft: 12, completion: 65 },
            { project: 'E-commerce Platform', deadline: '2024-02-28', daysLeft: 25, completion: 78 },
            { project: 'User Research', deadline: '2024-03-10', daysLeft: 35, completion: 45 }
          ]
        },
        recommendations: {
          toDelete: [
            { title: 'Old Tutorial Site', reason: 'Not visited in 45 days, outdated content', daysSinceLastVisit: 45, category: 'Learning' },
            { title: 'Broken Project Link', reason: 'Link appears to be dead, no visits in 89 days', daysSinceLastVisit: 89, category: 'Development' },
            { title: 'Inactive Blog', reason: 'Blog no longer active, minimal engagement', daysSinceLastVisit: 71, category: 'Learning' },
            { title: 'Unused Design Tool', reason: 'Tool not being utilized, only 1 visit in 62 days', daysSinceLastVisit: 62, category: 'Design' },
            { title: 'Outdated Documentation', reason: 'Framework deprecated, better alternatives available', daysSinceLastVisit: 38, category: 'Development' }
          ],
          toOptimize: [
            { title: 'React Documentation', suggestion: 'Create shortcuts to frequently visited sections', potentialTimeSaving: 15 },
            { title: 'GitHub Repository', suggestion: 'Organize into project-specific folders', potentialTimeSaving: 12 },
            { title: 'Design System', suggestion: 'Add quick access tags for components', potentialTimeSaving: 8 }
          ],
          trending: [
            { title: 'Next.js 14 Documentation', growthRate: 156, category: 'Development' },
            { title: 'Tailwind CSS Components', growthRate: 89, category: 'Design' },
            { title: 'TypeScript Advanced Patterns', growthRate: 67, category: 'Learning' }
          ]
        }
      }
      setData(mockData)
    } catch (error) {
      console.error('Failed to load comprehensive analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{data?.timeTracking.totalTimeSpent}h</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Bookmarks</p>
                <p className="text-2xl font-bold text-gray-900">{data?.bookmarkInsights.activeBookmarks}</p>
                <p className="text-xs text-gray-500">of {data?.bookmarkInsights.totalBookmarks} total</p>
              </div>
              <Bookmark className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity Score</p>
                <p className="text-2xl font-bold text-gray-900">{data?.timeTracking.productivity.productivityScore}%</p>
                <p className="text-xs text-gray-500">Above average</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">{data?.projectManagement.activeProjects}</p>
                <p className="text-xs text-gray-500">{data?.projectManagement.completedProjects} completed</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Performing Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.bookmarkInsights.topPerformers.slice(0, 3).map((bookmark, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{bookmark.title}</p>
                    <p className="text-xs text-gray-500">{bookmark.visits} visits • {bookmark.timeSpent}h spent</p>
                  </div>
                  <Badge variant={bookmark.productivity === 'high' ? 'default' : 'secondary'}>
                    {bookmark.productivity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cleanup Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recommendations.toDelete.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.daysSinceLastVisit} days since last visit</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTimeTracking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-500" />
              Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Focused Time</span>
                  <span>{data?.timeTracking.productivity.focusedTime}h</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Distracted Time</span>
                  <span>{data?.timeTracking.productivity.distractedTime}h</span>
                </div>
                <Progress value={30} className="h-2 bg-red-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Weekly Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.timeTracking.weeklyPattern.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-8">{day.day}</span>
                  <div className="flex-1 mx-3">
                    <Progress value={(day.hours / 25) * 100} className="h-2" />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{day.hours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.timeTracking.mostActiveHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="font-medium">{hour}</span>
                  <Badge variant="secondary">Peak</Badge>
                </div>
              ))}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Average session: <span className="font-medium">{data?.timeTracking.averageSessionTime} minutes</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderBookmarkInsights = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{data?.bookmarkInsights.activeBookmarks}</p>
            <p className="text-sm text-green-600">Active Bookmarks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Archive className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-800">{data?.bookmarkInsights.unusedBookmarks}</p>
            <p className="text-sm text-yellow-600">Unused Bookmarks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-800">{data?.bookmarkInsights.favoriteBookmarks}</p>
            <p className="text-sm text-red-600">Favorites</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.bookmarkInsights.topPerformers.map((bookmark, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{bookmark.title}</p>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span>{bookmark.visits} visits</span>
                      <span>{bookmark.timeSpent}h spent</span>
                      <span>Last: {bookmark.lastVisited}</span>
                    </div>
                  </div>
                  <Badge variant={bookmark.productivity === 'high' ? 'default' : bookmark.productivity === 'medium' ? 'secondary' : 'outline'}>
                    {bookmark.productivity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Underperformers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.bookmarkInsights.underperformers.map((bookmark, index) => (
                <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bookmark.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{bookmark.recommendation}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        <span>{bookmark.visits} visits</span>
                        <span>{bookmark.daysSinceLastVisit} days ago</span>
                        <span>{bookmark.category}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2">
                      <XCircle className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
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
              <PieChart className="h-5 w-5 text-blue-500" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.categoryAnalysis.categories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category.count} items</Badge>
                      {category.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                      {category.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                      {category.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Visits</p>
                      <p className="font-medium">{category.totalVisits}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Avg Time</p>
                      <p className="font-medium">{category.averageTimeSpent}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Efficiency</p>
                      <p className="font-medium">{category.efficiency}%</p>
                    </div>
                  </div>
                  <Progress value={category.efficiency} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Most Productive</span>
                </div>
                <p className="text-sm text-green-700">
                  <span className="font-medium">{data?.categoryAnalysis.mostProductiveCategory}</span> category shows highest efficiency with focused, long-duration sessions.
                </p>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Needs Attention</span>
                </div>
                <p className="text-sm text-red-700">
                  <span className="font-medium">{data?.categoryAnalysis.leastProductiveCategory}</span> category has low efficiency. Consider reorganizing or removing unused items.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">Quick Tip</span>
                </div>
                <p className="text-sm text-blue-700">
                  Focus on your top-performing categories during peak hours (9 AM, 2 PM, 7 PM) for maximum productivity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderProjectManagement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.projectManagement.activeProjects}</p>
            <p className="text-sm text-gray-600">Active Projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.projectManagement.completedProjects}</p>
            <p className="text-sm text-gray-600">Completed Projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.projectManagement.projectEfficiency}%</p>
            <p className="text-sm text-gray-600">Project Efficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Resource Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.projectManagement.resourceAllocation.map((project, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{project.project}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.priority === 'high' ? 'destructive' : project.priority === 'medium' ? 'default' : 'secondary'}>
                        {project.priority}
                      </Badge>
                      <Badge variant={project.status === 'on-track' ? 'default' : project.status === 'ahead' ? 'secondary' : 'destructive'}>
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500">Time Spent</p>
                      <p className="font-medium">{project.timeSpent}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Progress</p>
                      <p className="font-medium">{project.progress}%</p>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.projectManagement.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className={`p-3 rounded-lg border ${deadline.daysLeft <= 14 ? 'bg-red-50 border-red-200' : deadline.daysLeft <= 30 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{deadline.project}</span>
                    <Badge variant={deadline.daysLeft <= 14 ? 'destructive' : deadline.daysLeft <= 30 ? 'default' : 'secondary'}>
                      {deadline.daysLeft} days left
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Due: {deadline.deadline}
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={deadline.completion} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{deadline.completion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Cleanup Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recommendations.toDelete.map((item, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-red-600 mt-1">{item.reason}</p>
                      <Badge variant="outline" className="mt-2 text-xs">{item.category}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="ml-2 text-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.recommendations.toOptimize.map((item, index) => (
                <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-blue-700 mt-1">{item.suggestion}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Save {item.potentialTimeSaving}min/week
                    </Badge>
                    <Button size="sm" variant="outline">
                      Apply
                    </Button>
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
              {data?.recommendations.trending.map((item, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-sm">{item.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                    <div className="flex items-center gap-1 text-green-600">
                      <ArrowUp className="h-3 w-3" />
                      <span className="text-xs font-medium">+{item.growthRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview()
      case 'time-tracking': return renderTimeTracking()
      case 'bookmark-insights': return renderBookmarkInsights()
      case 'category-analysis': return renderCategoryAnalysis()
      case 'project-management': return renderProjectManagement()
      case 'recommendations': return renderRecommendations()
      default: return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Analytics</h2>
              <p className="text-xs text-gray-500">Comprehensive insights</p>
            </div>
          </div>

          <div className="space-y-1">
            {sidebarSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sidebarSections.find(s => s.id === activeSection)?.label}
              </h1>
              <p className="text-gray-600">
                {activeSection === 'overview' && 'Get a complete overview of your bookmark usage and productivity'}
                {activeSection === 'time-tracking' && 'Track how you spend time across different bookmarks and projects'}
                {activeSection === 'bookmark-insights' && 'Analyze bookmark performance and identify optimization opportunities'}
                {activeSection === 'category-analysis' && 'Understand category-wise productivity and efficiency patterns'}
                {activeSection === 'project-management' && 'Monitor project progress and resource allocation'}
                {activeSection === 'recommendations' && 'Get AI-powered suggestions to optimize your workflow'}
              </p>
            </div>

            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          {/* Content */}
          {renderSection()}
        </div>
      </div>
    </div>
  )
} 