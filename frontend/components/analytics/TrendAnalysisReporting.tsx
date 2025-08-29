'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-picker'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  ReferenceLine,
  ReferenceArea,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Calendar,
  Download,
  Share,
  RefreshCw,
  Filter,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  Target,
  Zap,
  Brain,
  Eye,
  Clock,
  Globe,
  FileText,
  Mail,
  Printer,
  Settings,
  Info,
  CheckCircle,
  XCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  Equal
} from 'lucide-react'
import { TrendAnalysis, TrendDataPoint, TrendForecast, TrendInsight, TrendAnomaly, AnalyticsReport } from '@/features/analytics/types'

interface TrendAnalysisReportingProps {
  userId: string
  onExport?: (format: string, data: any) => void
  onShare?: (reportId: string) => void
  className?: string
}

interface TrendFilter {
  type: 'category' | 'tag' | 'domain' | 'content_type' | 'user_behavior'
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  dateRange: { start: Date; end: Date }
  subjects: string[]
}

export function TrendAnalysisReporting({
  userId,
  onExport,
  onShare,
  className
}: TrendAnalysisReportingProps) {
  const [trends, setTrends] = useState<TrendAnalysis[]>([])
  const [selectedTrend, setSelectedTrend] = useState<TrendAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showForecast, setShowForecast] = useState(true)
  const [showAnomalies, setShowAnomalies] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [filters, setFilters] = useState<TrendFilter>({
    type: 'category',
    timeframe: 'weekly',
    dateRange: {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    subjects: []
  })

  // Mock data generation
  const generateMockTrends = useMemo(() => {
    const generateTrendData = (baseValue: number, volatility: number, trend: number, days: number): TrendDataPoint[] => {
      const data: TrendDataPoint[] = []
      let currentValue = baseValue
      
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
        const randomChange = (Math.random() - 0.5) * volatility
        const trendChange = trend * (i / days)
        currentValue = Math.max(0, currentValue + randomChange + trendChange)
        
        data.push({
          timestamp: date,
          value: Math.round(currentValue),
          normalized: currentValue / baseValue,
          confidence: 0.8 + Math.random() * 0.2,
          metadata: { day: i }
        })
      }
      return data
    }

    const generateForecast = (lastValue: number, trend: number, days: number): TrendForecast[] => {
      const forecast: TrendForecast[] = []
      let currentValue = lastValue
      
      for (let i = 1; i <= days; i++) {
        const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
        currentValue += trend + (Math.random() - 0.5) * 5
        const confidence = Math.max(0.3, 0.9 - (i / days) * 0.6)
        const margin = currentValue * (1 - confidence) * 0.5
        
        forecast.push({
          timestamp: date,
          predicted: Math.round(currentValue),
          confidence,
          lower: Math.round(currentValue - margin),
          upper: Math.round(currentValue + margin)
        })
      }
      return forecast
    }

    const trends: TrendAnalysis[] = [
      {
        id: 'tech-category-trend',
        type: 'category',
        subject: 'Technology',
        timeframe: 'weekly',
        data: generateTrendData(150, 20, 15, 30),
        direction: 'increasing',
        velocity: 0.75,
        acceleration: 0.12,
        significance: 0.89,
        forecast: generateForecast(165, 2.5, 14),
        insights: [
          {
            type: 'trend_change',
            description: 'Technology bookmarks have increased 45% in the last month',
            impact: 'high',
            actionable: true,
            recommendation: 'Consider creating sub-categories for better organization'
          },
          {
            type: 'peak',
            description: 'Peak usage occurs on Tuesday and Wednesday',
            impact: 'medium',
            actionable: true,
            recommendation: 'Schedule tech content reviews on these days'
          }
        ],
        anomalies: [
          {
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            value: 220,
            expected: 160,
            deviation: 37.5,
            severity: 'high',
            explanation: 'Spike likely due to new project research'
          }
        ]
      },
      {
        id: 'design-tag-trend',
        type: 'tag',
        subject: 'design',
        timeframe: 'daily',
        data: generateTrendData(80, 15, -5, 30),
        direction: 'decreasing',
        velocity: -0.25,
        acceleration: -0.05,
        significance: 0.67,
        forecast: generateForecast(75, -1, 14),
        insights: [
          {
            type: 'valley',
            description: 'Design-related bookmarks have decreased 15% recently',
            impact: 'medium',
            actionable: true,
            recommendation: 'Consider exploring new design resources to maintain engagement'
          }
        ],
        anomalies: []
      },
      {
        id: 'user-behavior-trend',
        type: 'user_behavior',
        subject: 'daily_visits',
        timeframe: 'daily',
        data: generateTrendData(45, 10, 8, 30),
        direction: 'increasing',
        velocity: 0.45,
        acceleration: 0.08,
        significance: 0.92,
        forecast: generateForecast(53, 1.2, 14),
        insights: [
          {
            type: 'seasonal',
            description: 'Daily visit patterns show consistent growth with weekend dips',
            impact: 'high',
            actionable: true,
            recommendation: 'Optimize weekend content to maintain engagement'
          }
        ],
        anomalies: [
          {
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            value: 25,
            expected: 47,
            deviation: -46.8,
            severity: 'medium',
            explanation: 'Weekend with lower activity than expected'
          }
        ]
      }
    ]

    return trends
  }, [])

  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setTrends(generateMockTrends)
      setSelectedTrend(generateMockTrends[0])
      setIsLoading(false)
    }, 1000)
  }, [generateMockTrends])

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return ArrowUp
      case 'decreasing': return ArrowDown
      case 'stable': return Equal
      case 'volatile': return Activity
      default: return Minus
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-green-600'
      case 'decreasing': return 'text-red-600'
      case 'stable': return 'text-blue-600'
      case 'volatile': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const getSignificanceLevel = (significance: number) => {
    if (significance >= 0.8) return { label: 'High', color: 'bg-green-100 text-green-800' }
    if (significance >= 0.6) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Low', color: 'bg-red-100 text-red-800' }
  }

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-orange-600'
      case 'low': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const handleExportReport = (format: string) => {
    const reportData = {
      trends,
      selectedTrend,
      filters,
      generatedAt: new Date(),
      summary: {
        totalTrends: trends.length,
        significantTrends: trends.filter(t => t.significance >= 0.8).length,
        anomalies: trends.reduce((acc, t) => acc + t.anomalies.length, 0)
      }
    }
    onExport?.(format, reportData)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.payload.confidence && (
                <span className="text-xs text-gray-500 ml-2">
                  ({(entry.payload.confidence * 100).toFixed(0)}% confidence)
                </span>
              )}
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
          <BarChart3 className="h-6 w-6 animate-pulse text-blue-500" />
          <span className="text-lg">Analyzing trends...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trend Analysis & Reporting</h2>
          <p className="text-gray-600">Advanced analytics with forecasting and anomaly detection</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => handleExportReport('pdf')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={() => handleExportReport('excel')} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => onShare?.('report-123')} variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Trend Type</Label>
              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters({...filters, type: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="tag">Tag</SelectItem>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="content_type">Content Type</SelectItem>
                  <SelectItem value="user_behavior">User Behavior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select 
                value={filters.timeframe} 
                onValueChange={(value) => setFilters({...filters, timeframe: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Show Forecast</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showForecast}
                  onCheckedChange={setShowForecast}
                />
                <Label>Enable</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Show Anomalies</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showAnomalies}
                  onCheckedChange={setShowAnomalies}
                />
                <Label>Enable</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trends.map((trend) => {
          const TrendIcon = getTrendIcon(trend.direction)
          const significance = getSignificanceLevel(trend.significance)
          
          return (
            <Card 
              key={trend.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTrend?.id === trend.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTrend(trend)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">{trend.subject}</CardTitle>
                  <TrendIcon className={`h-5 w-5 ${getTrendColor(trend.direction)}`} />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{trend.type}</Badge>
                  <Badge className={significance.color}>{significance.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Direction</span>
                    <span className={`font-medium ${getTrendColor(trend.direction)}`}>
                      {trend.direction}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Velocity</span>
                    <span className="font-medium">
                      {trend.velocity > 0 ? '+' : ''}{(trend.velocity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Significance</span>
                    <span className="font-medium">{(trend.significance * 100).toFixed(0)}%</span>
                  </div>
                  {trend.anomalies.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{trend.anomalies.length} anomalies detected</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detailed Analysis */}
      {selectedTrend && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl capitalize">{selectedTrend.subject} Trend Analysis</CardTitle>
                <CardDescription>
                  {selectedTrend.timeframe} analysis from {selectedTrend.data[0]?.timestamp.toLocaleDateString()} 
                  to {selectedTrend.data[selectedTrend.data.length - 1]?.timestamp.toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedTrend.type}</Badge>
                <Badge className={getSignificanceLevel(selectedTrend.significance).color}>
                  {getSignificanceLevel(selectedTrend.significance).label} Significance
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={selectedTrend.data.map(d => ({
                      ...d,
                      timestamp: d.timestamp.toLocaleDateString()
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        fill="#3b82f6" 
                        fillOpacity={0.3} 
                        stroke="#3b82f6"
                        name="Actual Values"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke="#10b981" 
                        strokeDasharray="5 5"
                        name="Confidence"
                        yAxisId="confidence"
                      />
                      {showAnomalies && selectedTrend.anomalies.map((anomaly, index) => (
                        <ReferenceLine
                          key={index}
                          x={anomaly.timestamp.toLocaleDateString()}
                          stroke="#ef4444"
                          strokeDasharray="3 3"
                          label={{ value: "Anomaly", position: "top" }}
                        />
                      ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTrend.direction === 'increasing' ? '+' : selectedTrend.direction === 'decreasing' ? '-' : ''}
                      {(Math.abs(selectedTrend.velocity) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Velocity</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(selectedTrend.acceleration * 100).toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">Acceleration</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {(selectedTrend.significance * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Significance</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedTrend.anomalies.length}
                    </div>
                    <div className="text-sm text-gray-600">Anomalies</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="forecast" className="space-y-6">
                {showForecast && selectedTrend.forecast.length > 0 && (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={[
                        ...selectedTrend.data.slice(-14).map(d => ({
                          timestamp: d.timestamp.toLocaleDateString(),
                          actual: d.value,
                          type: 'historical'
                        })),
                        ...selectedTrend.forecast.map(f => ({
                          timestamp: f.timestamp.toLocaleDateString(),
                          predicted: f.predicted,
                          lower: f.lower,
                          upper: f.upper,
                          confidence: f.confidence,
                          type: 'forecast'
                        }))
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="upper" 
                          fill="#93c5fd" 
                          fillOpacity={0.3}
                          stroke="none"
                          name="Confidence Band"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lower" 
                          fill="#ffffff" 
                          fillOpacity={1}
                          stroke="none"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Historical Data"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          name="Forecast"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedTrend.forecast.slice(0, 3).map((forecast, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">
                        {forecast.timestamp.toLocaleDateString()}
                      </div>
                      <div className="text-xl font-bold">{forecast.predicted}</div>
                      <div className="text-sm text-gray-500">
                        Range: {forecast.lower} - {forecast.upper}
                      </div>
                      <div className="text-xs text-blue-600">
                        {(forecast.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {selectedTrend.insights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100' :
                        insight.impact === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                      }`}>
                        <Info className={`h-4 w-4 ${
                          insight.impact === 'high' ? 'text-red-600' :
                          insight.impact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="capitalize">
                            {insight.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={
                            insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }>
                            {insight.impact} impact
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline">Actionable</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{insight.description}</p>
                        {insight.recommendation && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Recommendation:</strong> {insight.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="anomalies" className="space-y-4">
                {selectedTrend.anomalies.length > 0 ? (
                  selectedTrend.anomalies.map((anomaly, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${getAnomalySeverityColor(anomaly.severity)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {anomaly.timestamp.toLocaleDateString()}
                            </span>
                            <Badge className={
                              anomaly.severity === 'high' ? 'bg-red-100 text-red-800' :
                              anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-green-100 text-green-800'
                            }>
                              {anomaly.severity} severity
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-600">Actual:</span>
                              <span className="font-medium ml-2">{anomaly.value}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Expected:</span>
                              <span className="font-medium ml-2">{anomaly.expected}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Deviation:</span>
                              <span className={`font-medium ml-2 ${
                                anomaly.deviation > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          {anomaly.explanation && (
                            <p className="text-gray-700 text-sm">{anomaly.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>No anomalies detected in this trend</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 