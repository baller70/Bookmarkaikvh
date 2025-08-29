'use client'

import React, { useState, useMemo } from 'react'
import { 
  Activity, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  Zap, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  BarChart3,
  Users,
  FileText,
  Tags,
  Folder,
  Link,
  Eye,
  EyeOff,
  Download,
  Upload,
  Search,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckSquare,
  Square as SquareIcon,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useAIProcessing } from '@/hooks/use-ai-processing'

interface FeedbackDialogProps {
  suggestionId: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (suggestionId: string, feedback: any) => Promise<boolean>
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ suggestionId, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const success = await onSubmit(suggestionId, {
        rating,
        comment: comment.trim() || undefined,
        timestamp: new Date().toISOString()
      })
      
      if (success) {
        setRating(5)
        setComment('')
        onClose()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>How accurate was this suggestion?</Label>
            <div className="flex space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="feedback-comment">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about this suggestion..."
              className="mt-1"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AIProcessingDashboard() {
  const {
    jobs,
    stats,
    suggestions,
    loading,
    loadingJobs,
    loadingStats,
    loadingSuggestions,
    error,
    refreshData,
    startJob,
    pauseJob,
    cancelJob,
    approveSuggestion,
    rejectSuggestion,
    submitFeedback,
    batchApproveSuggestions,
    batchRejectSuggestions,
    filterJobsByStatus,
    filterSuggestionsByStatus,
    filterSuggestionsByType,
    isRealTimeConnected,
    lastUpdate
  } = useAIProcessing({
    autoRefresh: true,
    refreshInterval: 5000,
    enableRealtime: true
  })

  // Local state
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [suggestionFilter, setSuggestionFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; suggestionId: string }>({
    open: false,
    suggestionId: ''
  })
  const [showJobDetails, setShowJobDetails] = useState<Record<string, boolean>>({})

  // Computed values
  const activeJobs = useMemo(() => filterJobsByStatus('processing'), [filterJobsByStatus])
  const pendingSuggestions = useMemo(() => filterSuggestionsByStatus('pending'), [filterSuggestionsByStatus])
  
  const filteredJobs = useMemo(() => {
    let filtered = jobFilter === 'all' ? jobs : filterJobsByStatus(jobFilter)
    
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [jobs, jobFilter, searchQuery, filterJobsByStatus])

  const filteredSuggestions = useMemo(() => {
    let filtered = suggestionFilter === 'all' ? suggestions : filterSuggestionsByStatus(suggestionFilter)
    
    if (searchQuery) {
      filtered = filtered.filter(suggestion => 
        suggestion.suggestedValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        suggestion.reasoning.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return filtered
  }, [suggestions, suggestionFilter, searchQuery, filterSuggestionsByStatus])

  // Event handlers
  const handleSelectAllSuggestions = () => {
    if (selectedSuggestions.length === filteredSuggestions.length) {
      setSelectedSuggestions([])
    } else {
      setSelectedSuggestions(filteredSuggestions.map(s => s.id))
    }
  }

  const handleSelectSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    )
  }

  const handleBatchApprove = async () => {
    if (selectedSuggestions.length === 0) return
    
    const success = await batchApproveSuggestions(selectedSuggestions)
    if (success) {
      setSelectedSuggestions([])
    }
  }

  const handleBatchReject = async () => {
    if (selectedSuggestions.length === 0) return
    
    const success = await batchRejectSuggestions(selectedSuggestions)
    if (success) {
      setSelectedSuggestions([])
    }
  }

  const handleJobAction = async (jobId: string, action: 'pause' | 'cancel') => {
    if (action === 'pause') {
      await pauseJob(jobId)
    } else if (action === 'cancel') {
      await cancelJob(jobId)
    }
  }

  const toggleJobDetails = (jobId: string) => {
    setShowJobDetails(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      case 'queued':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'queued':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Folder className="h-4 w-4" />
      case 'tags':
        return <Tags className="h-4 w-4" />
      case 'title':
        return <FileText className="h-4 w-4" />
      case 'description':
        return <FileText className="h-4 w-4" />
      case 'priority':
        return <Star className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            
            <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Processing Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor and manage AI processing jobs, review suggestions, and provide feedback
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Real-time status indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                {isRealTimeConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Error loading dashboard data</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                    <p className="text-2xl font-bold">{stats.activeJobs}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Suggestions</p>
                    <p className="text-2xl font-bold">{stats.pendingSuggestions}</p>
                  </div>
                  <Brain className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Accuracy Rate</p>
                    <p className="text-2xl font-bold">{(stats.averageAccuracy * 100).toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Health</p>
                    <p className="text-2xl font-bold capitalize">{stats.systemHealth}</p>
                  </div>
                  <div className={`h-8 w-8 rounded-full ${
                    stats.systemHealth === 'healthy' ? 'bg-green-500' :
                    stats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Active Jobs Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Active Processing Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active processing jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(job.status)}
                          <div>
                            <div className="font-medium">{job.type.replace('-', ' ').toUpperCase()}</div>
                            <div className="text-sm text-muted-foreground">
                              {job.progress.current} / {job.progress.total} items
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{job.progress.percentage.toFixed(1)}%</div>
                            <Progress value={job.progress.percentage} className="w-24 h-2" />
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJobAction(job.id, 'pause')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJobAction(job.id, 'cancel')}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Recent AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending suggestions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingSuggestions.slice(0, 5).map((suggestion) => (
                      <div key={suggestion.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(suggestion.type)}
                          <div>
                            <div className="font-medium">
                              {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Suggestion
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-md">
                              {suggestion.suggestedValue}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {(suggestion.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveSuggestion(suggestion.id)}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectSuggestion(suggestion.id)}
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Processing Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => startJob({ type: 'auto-processing' })}>
                <Play className="h-4 w-4 mr-2" />
                Start New Job
              </Button>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <div className="font-medium text-lg">
                            {job.type.replace('-', ' ').toUpperCase()} - {job.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Started {new Date(job.metadata.startTime).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={getStatusColor(job.status)}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleJobDetails(job.id)}
                        >
                          {showJobDetails[job.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{job.progress.current} / {job.progress.total} ({job.progress.percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={job.progress.percentage} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{job.metadata.itemsSuccessful}</div>
                        <div className="text-xs text-muted-foreground">Successful</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{job.metadata.itemsFailed}</div>
                        <div className="text-xs text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{job.metadata.errorCount}</div>
                        <div className="text-xs text-muted-foreground">Errors</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-600">
                          {job.metadata.processingTime ? Math.round(job.metadata.processingTime / 60) : '-'}m
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>

                    {/* Job Controls */}
                    {job.status === 'processing' && (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'pause')}
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJobAction(job.id, 'cancel')}
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {/* Expandable Details */}
                    {showJobDetails[job.id] && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        {/* Settings */}
                        <div>
                          <h4 className="font-medium mb-2">Job Settings</h4>
                          <div className="bg-muted p-3 rounded text-sm">
                            <pre>{JSON.stringify(job.settings, null, 2)}</pre>
                          </div>
                        </div>

                        {/* Recent Errors */}
                        {job.results?.errors && job.results.errors.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recent Errors</h4>
                            <div className="space-y-2">
                              {job.results.errors.slice(0, 3).map((error) => (
                                <div key={error.id} className="p-3 bg-red-50 border border-red-200 rounded">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-red-700">{error.type}</span>
                                    <Badge variant="outline" className={
                                      error.severity === 'critical' ? 'border-red-500 text-red-700' :
                                      error.severity === 'high' ? 'border-orange-500 text-orange-700' :
                                      'border-yellow-500 text-yellow-700'
                                    }>
                                      {error.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-red-600 mt-1">{error.message}</p>
                                  {error.details && (
                                    <p className="text-xs text-red-500 mt-1">{error.details}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search suggestions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={suggestionFilter} onValueChange={setSuggestionFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suggestions</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSuggestions.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {selectedSuggestions.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchApprove}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Approve All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchReject}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Reject All
                  </Button>
                </div>
              )}
            </div>

            {/* Bulk Selection */}
            {filteredSuggestions.length > 0 && (
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <Checkbox
                  checked={selectedSuggestions.length === filteredSuggestions.length}
                  onCheckedChange={handleSelectAllSuggestions}
                />
                <span className="text-sm">
                  Select all {filteredSuggestions.length} suggestions
                </span>
              </div>
            )}

            <div className="space-y-4">
              {filteredSuggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={selectedSuggestions.includes(suggestion.id)}
                        onCheckedChange={() => handleSelectSuggestion(suggestion.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(suggestion.type)}
                            <span className="font-medium">
                              {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Suggestion
                            </span>
                            <Badge variant="outline" className={getStatusColor(suggestion.status)}>
                              {suggestion.status}
                            </Badge>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {(suggestion.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Current Value</Label>
                            <p className="text-sm bg-muted p-2 rounded">
                              {suggestion.currentValue || 'None'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Suggested Value</Label>
                            <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                              {suggestion.suggestedValue}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <Label className="text-xs text-muted-foreground">AI Reasoning</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {suggestion.reasoning}
                          </p>
                        </div>

                        {suggestion.userFeedback && (
                          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">User Feedback:</span>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < (suggestion.userFeedback?.rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {suggestion.userFeedback.comment && (
                              <p className="text-sm text-muted-foreground">
                                "{suggestion.userFeedback.comment}"
                              </p>
                            )}
                          </div>
                        )}

                        {suggestion.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => approveSuggestion(suggestion.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => rejectSuggestion(suggestion.id)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFeedbackDialog({ open: true, suggestionId: suggestion.id })}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Feedback
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Processing Time</span>
                      <span className="font-medium">{stats?.averageProcessingTime || 0}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Success Rate</span>
                      <span className="font-medium">{((stats?.averageAccuracy || 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Jobs Completed</span>
                      <span className="font-medium">{stats?.completedJobs || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggestion Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Suggestions</span>
                      <span className="font-medium">{stats?.totalSuggestions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Approved</span>
                      <span className="font-medium text-green-600">{stats?.approvedSuggestions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rejected</span>
                      <span className="font-medium text-red-600">{stats?.rejectedSuggestions || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Approval Rate</span>
                      <span className="font-medium">
                        {stats?.totalSuggestions ? 
                          ((stats.approvedSuggestions / stats.totalSuggestions) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">System Health</span>
                      <Badge variant="outline" className={
                        stats?.systemHealth === 'healthy' ? 'bg-green-100 text-green-700 border-green-200' :
                        stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }>
                        {stats?.systemHealth || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Jobs</span>
                      <span className="font-medium">{stats?.activeJobs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Failed Jobs</span>
                      <span className="font-medium text-red-600">{stats?.failedJobs || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Feedback Dialog */}
        <FeedbackDialog
          suggestionId={feedbackDialog.suggestionId}
          isOpen={feedbackDialog.open}
          onClose={() => setFeedbackDialog({ open: false, suggestionId: '' })}
          onSubmit={submitFeedback}
        />
      </div>
    </div>
  )
} 