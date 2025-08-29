'use client'

import React, { useState, useEffect } from 'react'
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  TrendingUp, 
  BarChart3, 
  Brain, 
  Target, 
  Award, 
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  Lightbulb,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useAIProcessing } from '@/hooks/use-ai-processing'

interface FeedbackMetrics {
  totalFeedback: number
  averageRating: number
  accuracyTrend: number
  categoryAccuracy: Record<string, number>
  typeAccuracy: Record<string, number>
  recentFeedback: FeedbackEntry[]
  improvementSuggestions: string[]
}

interface FeedbackEntry {
  id: string
  suggestionId: string
  suggestionType: string
  rating: number
  comment?: string
  timestamp: string
  helpful: boolean
  category: string
  confidence: number
}

interface FeedbackFormData {
  rating: number
  comment: string
  helpful: boolean
  specificIssues: string[]
  improvementSuggestions: string
}

interface AIAccuracyFeedbackProps {
  className?: string
  suggestionId?: string
  suggestionType?: string
  onFeedbackSubmit?: (feedback: any) => void
}

const defaultFeedbackForm: FeedbackFormData = {
  rating: 5,
  comment: '',
  helpful: true,
  specificIssues: [],
  improvementSuggestions: ''
}

const issueCategories = [
  'Incorrect categorization',
  'Poor tag suggestions',
  'Wrong content analysis',
  'Low confidence accuracy',
  'Missing context',
  'Irrelevant suggestions',
  'Technical errors',
  'Language issues'
]

export function AIAccuracyFeedback({ 
  className = '',
  suggestionId,
  suggestionType,
  onFeedbackSubmit 
}: AIAccuracyFeedbackProps) {
  const {
    suggestions,
    submitFeedback,
    loading
  } = useAIProcessing()

  // State
  const [selectedTab, setSelectedTab] = useState('overview')
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>(defaultFeedbackForm)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<string>('30d')
  const [submitting, setSubmitting] = useState(false)

  // Mock metrics data (in production, this would come from the API)
  const [metrics, setMetrics] = useState<FeedbackMetrics>({
    totalFeedback: 1247,
    averageRating: 4.2,
    accuracyTrend: 8.5,
    categoryAccuracy: {
      'Development': 0.89,
      'Design': 0.92,
      'Business': 0.78,
      'Technology': 0.85,
      'Education': 0.91
    },
    typeAccuracy: {
      'category': 0.87,
      'tags': 0.91,
      'title': 0.83,
      'description': 0.79,
      'priority': 0.88
    },
    recentFeedback: [
      {
        id: 'fb_001',
        suggestionId: 'sugg_001',
        suggestionType: 'category',
        rating: 5,
        comment: 'Perfect categorization! Very accurate.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        helpful: true,
        category: 'Development',
        confidence: 0.92
      },
      {
        id: 'fb_002',
        suggestionId: 'sugg_002',
        suggestionType: 'tags',
        rating: 3,
        comment: 'Tags are relevant but missing some important ones.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        helpful: true,
        category: 'Design',
        confidence: 0.78
      },
      {
        id: 'fb_003',
        suggestionId: 'sugg_003',
        suggestionType: 'category',
        rating: 2,
        comment: 'Completely wrong category assignment.',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        helpful: false,
        category: 'Business',
        confidence: 0.65
      }
    ],
    improvementSuggestions: [
      'Improve context understanding for technical content',
      'Better handling of multi-category content',
      'Enhanced tag relationship detection',
      'More accurate confidence scoring'
    ]
  })

  // Event handlers
  const handleFeedbackFormChange = (key: keyof FeedbackFormData, value: any) => {
    setFeedbackForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleIssueToggle = (issue: string) => {
    setFeedbackForm(prev => ({
      ...prev,
      specificIssues: prev.specificIssues.includes(issue)
        ? prev.specificIssues.filter(i => i !== issue)
        : [...prev.specificIssues, issue]
    }))
  }

  const handleSubmitFeedback = async () => {
    if (!selectedSuggestion) return

    setSubmitting(true)
    try {
      const feedbackData = {
        ...feedbackForm,
        timestamp: new Date().toISOString(),
        suggestionId: selectedSuggestion
      }

      const success = await submitFeedback(selectedSuggestion, feedbackData)
      
      if (success) {
        toast.success('Feedback submitted successfully')
        setShowFeedbackDialog(false)
        setFeedbackForm(defaultFeedbackForm)
        setSelectedSuggestion(null)
        onFeedbackSubmit?.(feedbackData)
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const openFeedbackDialog = (suggestionId: string) => {
    setSelectedSuggestion(suggestionId)
    setShowFeedbackDialog(true)
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-600'
    if (accuracy >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.9) return 'bg-green-100 text-green-700 border-green-200'
    if (accuracy >= 0.8) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredSuggestions = suggestions.filter(suggestion => 
    filterType === 'all' || suggestion.type === filterType
  )

  return (
    <div className={className}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Submit Feedback</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                    <p className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="flex">
                    {getRatingStars(Math.round(metrics.averageRating))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                    <p className="text-2xl font-bold">{metrics.totalFeedback.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Accuracy Trend</p>
                    <p className="text-2xl font-bold text-green-600">+{metrics.accuracyTrend}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Health</p>
                    <p className="text-2xl font-bold text-green-600">Excellent</p>
                  </div>
                  <Brain className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Accuracy by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Accuracy by Suggestion Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.typeAccuracy).map(([type, accuracy]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 text-sm font-medium capitalize">{type}</div>
                      <Progress value={accuracy * 100} className="w-48 h-2" />
                    </div>
                    <Badge variant="outline" className={getAccuracyBadge(accuracy)}>
                      {(accuracy * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recentFeedback.slice(0, 5).map((feedback) => (
                  <div key={feedback.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {feedback.suggestionType}
                        </Badge>
                        <Badge variant="outline" className={getAccuracyBadge(feedback.confidence)}>
                          {(feedback.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getRatingStars(feedback.rating)}
                      </div>
                    </div>
                    
                    {feedback.comment && (
                      <p className="text-sm text-muted-foreground mb-2">
                        "{feedback.comment}"
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(feedback.timestamp).toLocaleString()}</span>
                      <div className="flex items-center space-x-2">
                        {feedback.helpful ? (
                          <div className="flex items-center text-green-600">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Helpful
                          </div>
                        ) : (
                          <div className="flex items-center text-red-600">
                            <ThumbsDown className="h-3 w-3 mr-1" />
                            Not Helpful
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Submit AI Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Help improve AI accuracy by rating suggestions and providing feedback
              </p>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="description">Description</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">
                          {suggestion.type}
                        </Badge>
                        <Badge variant="outline" className={getAccuracyBadge(suggestion.confidence)}>
                          {(suggestion.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                        <Badge variant="outline" className={
                          suggestion.status === 'pending' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          suggestion.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }>
                          {suggestion.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Current</Label>
                          <p className="text-sm bg-muted p-2 rounded">
                            {suggestion.currentValue || 'None'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Suggested</Label>
                          <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                            {suggestion.suggestedValue}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {suggestion.reasoning}
                      </p>
                      
                      {suggestion.userFeedback && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium">Previous feedback:</span>
                            <div className="flex">
                              {getRatingStars(suggestion.userFeedback.rating)}
                            </div>
                          </div>
                          {suggestion.userFeedback.comment && (
                            <p className="text-xs text-muted-foreground mt-1">
                              "{suggestion.userFeedback.comment}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFeedbackDialog(suggestion.id)}
                        disabled={suggestion.userFeedback !== undefined}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {suggestion.userFeedback ? 'Feedback Given' : 'Give Feedback'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuggestions.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Suggestions Available</h3>
                <p className="text-sm text-muted-foreground">
                  AI suggestions will appear here when available for feedback
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Feedback Analytics</h3>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Accuracy by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.categoryAccuracy).map(([category, accuracy]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium">{category}</div>
                      <Progress value={accuracy * 100} className="w-48 h-2" />
                    </div>
                    <Badge variant="outline" className={getAccuracyBadge(accuracy)}>
                      {(accuracy * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const percentage = Math.random() * 40 + 10 // Mock data
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm">{rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        </div>
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-sm w-12 text-right">{percentage.toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Helpfulness Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Helpful</span>
                    </div>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Not Helpful</span>
                    </div>
                    <span className="font-medium">22%</span>
                  </div>
                  <Progress value={22} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                AI Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.improvementSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Performance Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">High Accuracy</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Design category suggestions achieve 92% accuracy
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium text-yellow-700">Needs Improvement</span>
                  </div>
                  <p className="text-sm text-yellow-600">
                    Description suggestions need better context understanding
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provide AI Feedback</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-base font-medium">How accurate was this suggestion?</Label>
              <div className="flex items-center space-x-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFeedbackFormChange('rating', rating)}
                    className={`p-1 ${rating <= feedbackForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {feedbackForm.rating} star{feedbackForm.rating !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Helpfulness */}
            <div>
              <Label className="text-base font-medium">Was this suggestion helpful?</Label>
              <div className="flex space-x-4 mt-2">
                <Button
                  variant={feedbackForm.helpful ? "default" : "outline"}
                  onClick={() => handleFeedbackFormChange('helpful', true)}
                  className="flex items-center space-x-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Yes, helpful</span>
                </Button>
                <Button
                  variant={!feedbackForm.helpful ? "default" : "outline"}
                  onClick={() => handleFeedbackFormChange('helpful', false)}
                  className="flex items-center space-x-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Not helpful</span>
                </Button>
              </div>
            </div>

            {/* Specific Issues */}
            {!feedbackForm.helpful && (
              <div>
                <Label className="text-base font-medium">What specific issues did you notice?</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {issueCategories.map((issue) => (
                    <div key={issue} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={issue}
                        checked={feedbackForm.specificIssues.includes(issue)}
                        onChange={() => handleIssueToggle(issue)}
                        className="rounded"
                      />
                      <Label htmlFor={issue} className="text-sm">{issue}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <div>
              <Label htmlFor="feedback-comment" className="text-base font-medium">
                Additional Comments (Optional)
              </Label>
              <Textarea
                id="feedback-comment"
                value={feedbackForm.comment}
                onChange={(e) => handleFeedbackFormChange('comment', e.target.value)}
                placeholder="Share more details about your experience with this suggestion..."
                className="mt-2"
                rows={4}
              />
            </div>

            {/* Improvement Suggestions */}
            <div>
              <Label htmlFor="improvement-suggestions" className="text-base font-medium">
                How could this suggestion be improved? (Optional)
              </Label>
              <Textarea
                id="improvement-suggestions"
                value={feedbackForm.improvementSuggestions}
                onChange={(e) => handleFeedbackFormChange('improvementSuggestions', e.target.value)}
                placeholder="Suggest specific improvements..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AIAccuracyFeedback 