'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  Brain, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Zap, 
  TrendingUp,
  Pause,
  Play,
  Square
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAIProcessing } from '@/hooks/use-ai-processing'

interface ProcessingStatusProps {
  className?: string
  showControls?: boolean
  compact?: boolean
}

export function RealTimeProcessingStatus({ 
  className = '', 
  showControls = true,
  compact = false 
}: ProcessingStatusProps) {
  const {
    jobs,
    stats,
    loading,
    error,
    pauseJob,
    cancelJob,
    isRealTimeConnected,
    lastUpdate
  } = useAIProcessing({
    autoRefresh: true,
    refreshInterval: 2000,
    enableRealtime: true
  })

  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())

  // Get active jobs
  const activeJobs = jobs.filter(job => job.status === 'processing')
  const recentJobs = jobs.filter(job => 
    job.status === 'completed' || job.status === 'failed'
  ).slice(0, 3)

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const getStatusIcon = (status: string, animated = false) => {
    const baseClasses = "h-4 w-4"
    const animatedClasses = animated ? "animate-spin" : ""
    
    switch (status) {
      case 'processing':
        return <Loader2 className={`${baseClasses} ${animatedClasses} text-blue-500`} />
      case 'completed':
        return <CheckCircle className={`${baseClasses} text-green-500`} />
      case 'failed':
        return <XCircle className={`${baseClasses} text-red-500`} />
      case 'paused':
        return <Pause className={`${baseClasses} text-yellow-500`} />
      case 'queued':
        return <Clock className={`${baseClasses} text-gray-500`} />
      default:
        return <AlertCircle className={`${baseClasses} text-gray-500`} />
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
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const calculateETA = (job: any) => {
    if (job.progress.current === 0) return null
    const timePerItem = (Date.now() - new Date(job.metadata.startTime).getTime()) / 1000 / job.progress.current
    const remainingItems = job.progress.total - job.progress.current
    return Math.round(timePerItem * remainingItems)
  }

  if (loading && !stats) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading processing status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load processing status</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {activeJobs.length} Active
                </span>
              </div>
              
              {stats && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{stats.pendingSuggestions} pending</span>
                  <span>{(stats.averageAccuracy * 100).toFixed(0)}% accuracy</span>
                </div>
              )}
            </div>
            
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {activeJobs.length > 0 && (
            <div className="mt-3 space-y-2">
              {activeJobs.slice(0, 2).map((job) => (
                <div key={job.id} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{job.type}</span>
                      <span>{job.progress.percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={job.progress.percentage} className="h-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      {/* Connection Status */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isRealTimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {isRealTimeConnected ? 'Real-time Connected' : 'Offline Mode'}
                </span>
              </div>
              
              {stats && (
                <div className="flex items-center space-x-1">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{stats.activeJobs} active jobs</span>
                </div>
              )}
            </div>
            
            {lastUpdate && (
              <span className="text-sm text-muted-foreground">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Active Processing Jobs ({activeJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeJobs.map((job) => {
              const eta = calculateETA(job)
              const isExpanded = expandedJobs.has(job.id)
              
              return (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(job.status, true)}
                      <div>
                        <div className="font-medium">
                          {job.type.replace('-', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Job ID: {job.id}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      
                      {showControls && (
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => pauseJob(job.id)}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelJob(job.id)}
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{job.progress.current} / {job.progress.total} items</span>
                    </div>
                    <Progress value={job.progress.percentage} className="h-2" />
                    <div className="flex justify-between text-xs mt-1 text-muted-foreground">
                      <span>{job.progress.percentage.toFixed(1)}% complete</span>
                      {eta && <span>ETA: {formatDuration(eta)}</span>}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {job.metadata.itemsSuccessful}
                      </div>
                      <div className="text-xs text-muted-foreground">Successful</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-red-600">
                        {job.metadata.itemsFailed}
                      </div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">
                        {job.metadata.errorCount}
                      </div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatDuration((Date.now() - new Date(job.metadata.startTime).getTime()) / 1000)}
                      </div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                  </div>
                  
                  {/* Expandable Details */}
                  {job.results?.errors && job.results.errors.length > 0 && (
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJobExpansion(job.id)}
                        className="text-xs"
                      >
                        {isExpanded ? 'Hide' : 'Show'} Recent Errors ({job.results.errors.length})
                      </Button>
                      
                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          {job.results.errors.slice(0, 3).map((error) => (
                            <div key={error.id} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-red-700">{error.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {error.severity}
                                </Badge>
                              </div>
                              <p className="text-red-600 mt-1">{error.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Completed Jobs */}
      {recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Recent Completed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <div className="font-medium text-sm">
                      {job.type.replace('-', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {job.metadata.endTime && (
                        <>Completed {new Date(job.metadata.endTime).toLocaleString()}</>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{job.metadata.itemsSuccessful}</div>
                    <div className="text-xs text-muted-foreground">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{job.metadata.itemsFailed}</div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">
                      {job.metadata.processingTime ? formatDuration(job.metadata.processingTime) : '-'}
                    </div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Active Jobs */}
      {activeJobs.length === 0 && recentJobs.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">No Processing Jobs</h3>
            <p className="text-sm text-muted-foreground">
              AI processing jobs will appear here when active
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default RealTimeProcessingStatus 