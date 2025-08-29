'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie,
  Treemap
} from 'recharts'
import { 
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Target,
  Zap,
  Users,
  BookOpen,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Globe,
  Search,
  Filter,
  Download,
  Share,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Lightbulb,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Flame
} from 'lucide-react'
import { UsagePattern, UserBehaviorMetrics } from '@/features/analytics/types'

interface UsagePatternInsightsProps {
  userId: string
  timeRange?: { start: Date; end: Date }
  onInsightClick?: (insight: any) => void
  className?: string
}

interface PatternInsight {
  id: string
  type: 'peak' | 'low' | 'trend' | 'anomaly' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionable: boolean
  recommendation?: string
  data?: any
}

export function UsagePatternInsights({
  userId,
  timeRange,
  onInsightClick,
  className
}: UsagePatternInsightsProps) {
  const [patterns, setPatterns] = useState<UsagePattern[]>([])
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [userBehavior, setUserBehavior] = useState<UserBehaviorMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPattern, setSelectedPattern] = useState<string>('daily')
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all')

  // Mock data generation
  const generateMockData = useMemo(() => {
    // Daily pattern
    const dailyPattern = Array.from({ length: 24 }, (_, hour) => {
      let activity = 0
      if (hour >= 9 && hour <= 11) activity = 80 + Math.random() * 20 // Morning peak
      else if (hour >= 14 && hour <= 16) activity = 70 + Math.random() * 20 // Afternoon peak
      else if (hour >= 20 && hour <= 22) activity = 60 + Math.random() * 20 // Evening peak
      else if (hour >= 7 && hour <= 23) activity = 20 + Math.random() * 30 // Normal hours
      else activity = Math.random() * 15 // Night hours
      
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        value: Math.floor(activity),
        normalized: activity / 100
      }
    })

    // Weekly pattern
    const weeklyPattern = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
      let activity = 50
      if (index < 5) activity = 60 + Math.random() * 30 // Weekdays
      else activity = 30 + Math.random() * 40 // Weekends
      
      return {
        time: day,
        value: Math.floor(activity),
        normalized: activity / 100
      }
    })

    // Monthly pattern
    const monthlyPattern = Array.from({ length: 30 }, (_, day) => ({
      time: `Day ${day + 1}`,
      value: Math.floor(40 + Math.random() * 60),
      normalized: (40 + Math.random() * 60) / 100
    }))

    const patterns: UsagePattern[] = [
      {
        id: 'daily-pattern',
        userId,
        type: 'daily',
        pattern: dailyPattern,
        strength: 0.85,
        confidence: 0.92,
        description: 'Peak usage during morning (9-11 AM), afternoon (2-4 PM), and evening (8-10 PM)',
        insights: [
          'You are most productive during morning hours',
          'Consider scheduling important research during peak times',
          'Evening sessions are typically for lighter browsing'
        ],
        recommendations: [
          'Schedule deep work during 9-11 AM peak',
          'Use afternoon sessions for collaborative content',
          'Save casual reading for evening hours'
        ],
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      {
        id: 'weekly-pattern',
        userId,
        type: 'weekly',
        pattern: weeklyPattern,
        strength: 0.78,
        confidence: 0.89,
        description: 'Higher activity on weekdays with Tuesday and Wednesday peaks',
        insights: [
          'Weekdays show 40% higher engagement than weekends',
          'Tuesday is your most productive day',
          'Weekend usage focuses on personal interests'
        ],
        recommendations: [
          'Plan major research projects for Tuesday-Wednesday',
          'Use weekends for personal development content',
          'Schedule content reviews on Monday mornings'
        ],
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      },
      {
        id: 'monthly-pattern',
        userId,
        type: 'monthly',
        pattern: monthlyPattern,
        strength: 0.65,
        confidence: 0.76,
        description: 'Consistent usage with slight increase mid-month',
        insights: [
          'Usage peaks around the 15th of each month',
          'End-of-month shows decreased activity',
          'Beginning of month shows planning-focused behavior'
        ],
        recommendations: [
          'Schedule monthly reviews mid-month during peak activity',
          'Use end-of-month for content cleanup',
          'Start new projects at the beginning of the month'
        ],
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      }
    ]

    const insights: PatternInsight[] = [
      {
        id: 'morning-peak',
        type: 'peak',
        title: 'Morning Productivity Peak',
        description: 'Your highest engagement occurs between 9-11 AM with 85% above average activity',
        impact: 'high',
        confidence: 0.92,
        actionable: true,
        recommendation: 'Schedule important research and learning during morning hours for maximum effectiveness'
      },
      {
        id: 'weekend-drop',
        type: 'low',
        title: 'Weekend Activity Decrease',
        description: 'Weekend usage drops by 40% compared to weekdays, indicating work-focused browsing habits',
        impact: 'medium',
        confidence: 0.87,
        actionable: true,
        recommendation: 'Consider adding personal development or hobby-related bookmarks for weekend engagement'
      },
      {
        id: 'evening-trend',
        type: 'trend',
        title: 'Increasing Evening Usage',
        description: 'Evening sessions have increased by 25% over the past month, showing growing after-work engagement',
        impact: 'medium',
        confidence: 0.79,
        actionable: true,
        recommendation: 'Curate evening-friendly content like tutorials, articles, and light reading material'
      },
      {
        id: 'category-shift',
        type: 'anomaly',
        title: 'Technology Category Surge',
        description: 'Technology bookmarks have increased 150% this week, significantly above normal patterns',
        impact: 'high',
        confidence: 0.94,
        actionable: false,
        recommendation: 'This surge aligns with your current project focus - consider organizing tech content into sub-categories'
      },
      {
        id: 'search-efficiency',
        type: 'recommendation',
        title: 'Search Optimization Opportunity',
        description: 'Your search success rate is 78% - adding better tags could improve discoverability',
        impact: 'medium',
        confidence: 0.83,
        actionable: true,
        recommendation: 'Spend 10 minutes weekly improving tags on your most-visited bookmarks'
      }
    ]

    const userBehavior: UserBehaviorMetrics = {
      userId,
      totalBookmarks: 1247,
      totalVisits: 3456,
      totalTimeSpent: 2847,
      averageTimePerBookmark: 2.3,
      mostActiveHours: [9, 10, 14, 15, 20],
      mostActiveDays: ['Tuesday', 'Wednesday', 'Thursday'],
      topCategories: [
        { category: 'Technology', count: 425, visits: 1200, timeSpent: 980, percentage: 34, growth: 15.2, color: '#3b82f6' },
        { category: 'Design', count: 312, visits: 890, timeSpent: 720, percentage: 25, growth: 8.7, color: '#10b981' },
        { category: 'Business', count: 248, visits: 670, timeSpent: 580, percentage: 20, growth: -2.1, color: '#f59e0b' },
        { category: 'Education', count: 187, visits: 450, timeSpent: 420, percentage: 15, growth: 12.3, color: '#ef4444' },
        { category: 'Other', count: 75, visits: 246, timeSpent: 147, percentage: 6, growth: 3.2, color: '#8b5cf6' }
      ],
      topTags: [
        { tag: 'react', count: 156, frequency: 0.125, coOccurrence: ['javascript', 'frontend'], sentiment: 'positive', trending: true },
        { tag: 'design', count: 134, frequency: 0.107, coOccurrence: ['ui', 'ux'], sentiment: 'positive', trending: true },
        { tag: 'typescript', count: 98, frequency: 0.079, coOccurrence: ['javascript', 'react'], sentiment: 'positive', trending: false },
        { tag: 'api', count: 87, frequency: 0.070, coOccurrence: ['backend', 'rest'], sentiment: 'neutral', trending: true },
        { tag: 'tutorial', count: 76, frequency: 0.061, coOccurrence: ['learning', 'guide'], sentiment: 'positive', trending: false }
      ],
      searchQueries: [
        { query: 'react hooks', count: 45, resultsFound: 23, clickThroughRate: 0.85, timestamp: new Date(), success: true },
        { query: 'css grid', count: 32, resultsFound: 18, clickThroughRate: 0.78, timestamp: new Date(), success: true },
        { query: 'typescript types', count: 28, resultsFound: 15, clickThroughRate: 0.82, timestamp: new Date(), success: true }
      ],
      organizationPatterns: [
        { type: 'by_category', usage: 0.65, efficiency: 0.82, preference: 0.75 },
        { type: 'by_tag', usage: 0.45, efficiency: 0.78, preference: 0.68 },
        { type: 'by_date', usage: 0.25, efficiency: 0.65, preference: 0.45 },
        { type: 'by_domain', usage: 0.35, efficiency: 0.72, preference: 0.58 }
      ],
      engagementScore: 8.5,
      retentionRate: 0.85,
      lastActiveDate: new Date(),
      streakDays: 12
    }

    return { patterns, insights, userBehavior }
  }, [userId])

  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const { patterns, insights, userBehavior } = generateMockData
      setPatterns(patterns)
      setInsights(insights)
      setUserBehavior(userBehavior)
      setIsLoading(false)
    }, 1000)
  }, [generateMockData])

  const filteredInsights = useMemo(() => {
    if (selectedInsightType === 'all') return insights
    return insights.filter(insight => insight.type === selectedInsightType)
  }, [insights, selectedInsightType])

  const selectedPatternData = useMemo(() => {
    return patterns.find(p => p.type === selectedPattern)
  }, [patterns, selectedPattern])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'peak': return TrendingUp
      case 'low': return TrendingDown
      case 'trend': return Activity
      case 'anomaly': return AlertCircle
      case 'recommendation': return Lightbulb
      default: return Info
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'peak': return 'text-green-600'
      case 'low': return 'text-orange-600'
      case 'trend': return 'text-blue-600'
      case 'anomaly': return 'text-red-600'
      case 'recommendation': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
          <Brain className="h-6 w-6 animate-pulse text-purple-500" />
          <span className="text-lg">Analyzing usage patterns...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage Pattern Insights</h2>
          <p className="text-gray-600">Discover your bookmark usage patterns and behavioral insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share Insights
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBehavior?.engagementScore}/10</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.5 from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBehavior?.streakDays} days</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Personal best!
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time per Bookmark</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBehavior?.averageTimePerBookmark.toFixed(1)}m</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.3m from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((userBehavior?.retentionRate || 0) * 100).toFixed(0)}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pattern Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage Patterns</CardTitle>
                  <CardDescription>Your bookmark usage patterns over time</CardDescription>
                </div>
                <Tabs value={selectedPattern} onValueChange={setSelectedPattern}>
                  <TabsList>
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {selectedPatternData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Pattern Strength</p>
                      <Progress value={selectedPatternData.strength * 100} className="w-32" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Confidence</p>
                      <Badge variant="secondary">
                        {(selectedPatternData.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={selectedPatternData.pattern}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{selectedPatternData.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Insights</h4>
                        <ul className="text-xs space-y-1">
                          {selectedPatternData.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                        <ul className="text-xs space-y-1">
                          {selectedPatternData.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Preferences</CardTitle>
              <CardDescription>How you prefer to organize your bookmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBehavior?.organizationPatterns.map((pattern, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {pattern.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {(pattern.preference * 100).toFixed(0)}% preference
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Usage</div>
                        <Progress value={pattern.usage * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Efficiency</div>
                        <Progress value={pattern.efficiency * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Preference</div>
                        <Progress value={pattern.preference * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Smart Insights</CardTitle>
                <select 
                  value={selectedInsightType}
                  onChange={(e) => setSelectedInsightType(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="peak">Peaks</option>
                  <option value="trend">Trends</option>
                  <option value="recommendation">Recommendations</option>
                  <option value="anomaly">Anomalies</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredInsights.map((insight) => {
                const Icon = getInsightIcon(insight.type)
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onInsightClick?.(insight)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${getInsightColor(insight.type)}`} />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={getImpactColor(insight.impact)}
                          >
                            {insight.impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs">
                              Actionable
                            </Badge>
                          )}
                        </div>
                        {insight.recommendation && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <strong>Recommendation:</strong> {insight.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </CardContent>
          </Card>

          {/* Most Active Times */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Activity Times</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Most Active Hours</h4>
                  <div className="flex flex-wrap gap-1">
                    {userBehavior?.mostActiveHours.map(hour => (
                      <Badge key={hour} variant="secondary">
                        {hour.toString().padStart(2, '0')}:00
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Most Active Days</h4>
                  <div className="flex flex-wrap gap-1">
                    {userBehavior?.mostActiveDays.map(day => (
                      <Badge key={day} variant="secondary">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Bookmarks</span>
                <span className="font-medium">{userBehavior?.totalBookmarks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Visits</span>
                <span className="font-medium">{userBehavior?.totalVisits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time Spent</span>
                <span className="font-medium">
                  {Math.floor((userBehavior?.totalTimeSpent || 0) / 60)}h {(userBehavior?.totalTimeSpent || 0) % 60}m
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Top Category</span>
                <span className="font-medium">{userBehavior?.topCategories[0]?.category}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 