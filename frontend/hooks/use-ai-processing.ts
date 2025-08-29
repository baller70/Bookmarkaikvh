import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

// Types
interface ProcessingJob {
  id: string
  type: 'auto-processing' | 'bulk-upload' | 'categorization' | 'tagging' | 'validation' | 'recommendation'
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused'
  progress: {
    current: number
    total: number
    percentage: number
  }
  metadata: {
    userId: string
    startTime: string
    endTime?: string
    processingTime?: number
    itemsProcessed: number
    itemsSuccessful: number
    itemsFailed: number
    errorCount: number
  }
  settings: Record<string, any>
  results?: {
    suggestions: AIProcessingSuggestion[]
    errors: ProcessingError[]
    summary: ProcessingSummary
  }
}

interface AIProcessingSuggestion {
  id: string
  bookmarkId: string
  type: 'category' | 'tags' | 'title' | 'description' | 'priority'
  currentValue: string
  suggestedValue: string
  confidence: number
  reasoning: string
  status: 'pending' | 'approved' | 'rejected' | 'applied'
  userFeedback?: {
    rating: 1 | 2 | 3 | 4 | 5
    comment?: string
    timestamp: string
  }
}

interface ProcessingError {
  id: string
  bookmarkId?: string
  type: 'validation' | 'api' | 'network' | 'parsing' | 'ai'
  message: string
  details?: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ProcessingSummary {
  totalItems: number
  successfulItems: number
  failedItems: number
  averageConfidence: number
  processingTime: number
  suggestionsGenerated: number
  suggestionsApproved: number
  accuracyRate: number
}

interface DashboardStats {
  activeJobs: number
  completedJobs: number
  failedJobs: number
  totalSuggestions: number
  pendingSuggestions: number
  approvedSuggestions: number
  rejectedSuggestions: number
  averageAccuracy: number
  averageProcessingTime: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

interface UseAIProcessingOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  enableRealtime?: boolean
}

interface UseAIProcessingReturn {
  // Data
  jobs: ProcessingJob[]
  stats: DashboardStats | null
  suggestions: AIProcessingSuggestion[]
  
  // Loading states
  loading: boolean
  loadingJobs: boolean
  loadingStats: boolean
  loadingSuggestions: boolean
  
  // Error states
  error: string | null
  
  // Actions
  refreshData: () => Promise<void>
  refreshJobs: () => Promise<void>
  refreshStats: () => Promise<void>
  refreshSuggestions: () => Promise<void>
  
  // Job management
  startJob: (config: any) => Promise<string | null>
  pauseJob: (jobId: string) => Promise<boolean>
  cancelJob: (jobId: string) => Promise<boolean>
  updateJobSettings: (jobId: string, settings: any) => Promise<boolean>
  
  // Suggestion management
  approveSuggestion: (suggestionId: string) => Promise<boolean>
  rejectSuggestion: (suggestionId: string) => Promise<boolean>
  submitFeedback: (suggestionId: string, feedback: any) => Promise<boolean>
  batchApproveSuggestions: (suggestionIds: string[]) => Promise<boolean>
  batchRejectSuggestions: (suggestionIds: string[]) => Promise<boolean>
  
  // Filters
  filterJobsByStatus: (status: string) => ProcessingJob[]
  filterSuggestionsByStatus: (status: string) => AIProcessingSuggestion[]
  filterSuggestionsByType: (type: string) => AIProcessingSuggestion[]
  
  // Real-time status
  isRealTimeConnected: boolean
  lastUpdate: Date | null
}

export function useAIProcessing(options: UseAIProcessingOptions = {}): UseAIProcessingReturn {
  const {
    autoRefresh = true,
    refreshInterval = 5000,
    enableRealtime = true
  } = options

  // State
  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [suggestions, setSuggestions] = useState<AIProcessingSuggestion[]>([])
  
  const [loading, setLoading] = useState(true)
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout>()
  const wsRef = useRef<WebSocket>()

  // API calls
  const fetchJobs = useCallback(async () => {
    try {
      setLoadingJobs(true)
      const response = await fetch('/api/ai/processing-dashboard?type=jobs')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.data || [])
        if (data.stats) {
          setStats(data.stats)
        }
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch jobs')
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
      toast.error('Failed to load processing jobs')
    } finally {
      setLoadingJobs(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true)
      const response = await fetch('/api/ai/processing-dashboard?type=stats')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch stats')
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchSuggestions = useCallback(async (status?: string) => {
    try {
      setLoadingSuggestions(true)
      const url = `/api/ai/processing-dashboard?type=suggestions${status ? `&status=${status}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data || [])
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch suggestions')
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions')
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchJobs(),
        fetchStats(),
        fetchSuggestions()
      ])
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }, [fetchJobs, fetchStats, fetchSuggestions])

  // Job management actions
  const startJob = useCallback(async (config: any): Promise<string | null> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_job', jobConfig: config })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Processing job started successfully')
        await refreshData()
        return data.jobId
      } else {
        throw new Error(data.error || 'Failed to start job')
      }
    } catch (err) {
      console.error('Error starting job:', err)
      toast.error('Failed to start processing job')
      return null
    }
  }, [refreshData])

  const pauseJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause_job', jobId })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Job paused successfully')
        await refreshData()
        return true
      } else {
        throw new Error(data.error || 'Failed to pause job')
      }
    } catch (err) {
      console.error('Error pausing job:', err)
      toast.error('Failed to pause job')
      return false
    }
  }, [refreshData])

  const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_job', jobId })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Job cancelled successfully')
        await refreshData()
        return true
      } else {
        throw new Error(data.error || 'Failed to cancel job')
      }
    } catch (err) {
      console.error('Error cancelling job:', err)
      toast.error('Failed to cancel job')
      return false
    }
  }, [refreshData])

  const updateJobSettings = useCallback(async (jobId: string, settings: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_settings', jobId, settings })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Job settings updated successfully')
        await refreshData()
        return true
      } else {
        throw new Error(data.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error('Error updating job settings:', err)
      toast.error('Failed to update job settings')
      return false
    }
  }, [refreshData])

  // Suggestion management actions
  const approveSuggestion = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_suggestion', suggestionId })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Suggestion approved successfully')
        await fetchSuggestions()
        return true
      } else {
        throw new Error(data.error || 'Failed to approve suggestion')
      }
    } catch (err) {
      console.error('Error approving suggestion:', err)
      toast.error('Failed to approve suggestion')
      return false
    }
  }, [fetchSuggestions])

  const rejectSuggestion = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_suggestion', suggestionId })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Suggestion rejected successfully')
        await fetchSuggestions()
        return true
      } else {
        throw new Error(data.error || 'Failed to reject suggestion')
      }
    } catch (err) {
      console.error('Error rejecting suggestion:', err)
      toast.error('Failed to reject suggestion')
      return false
    }
  }, [fetchSuggestions])

  const submitFeedback = useCallback(async (suggestionId: string, feedback: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_feedback', suggestionId, feedback })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Feedback submitted successfully')
        await fetchSuggestions()
        return true
      } else {
        throw new Error(data.error || 'Failed to submit feedback')
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      toast.error('Failed to submit feedback')
      return false
    }
  }, [fetchSuggestions])

  const batchApproveSuggestions = useCallback(async (suggestionIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_approve', suggestionIds })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`${suggestionIds.length} suggestions approved successfully`)
        await fetchSuggestions()
        return true
      } else {
        throw new Error(data.error || 'Failed to approve suggestions')
      }
    } catch (err) {
      console.error('Error batch approving suggestions:', err)
      toast.error('Failed to approve suggestions')
      return false
    }
  }, [fetchSuggestions])

  const batchRejectSuggestions = useCallback(async (suggestionIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/ai/processing-dashboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_reject', suggestionIds })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`${suggestionIds.length} suggestions rejected successfully`)
        await fetchSuggestions()
        return true
      } else {
        throw new Error(data.error || 'Failed to reject suggestions')
      }
    } catch (err) {
      console.error('Error batch rejecting suggestions:', err)
      toast.error('Failed to reject suggestions')
      return false
    }
  }, [fetchSuggestions])

  // Filter functions
  const filterJobsByStatus = useCallback((status: string) => {
    return jobs.filter(job => job.status === status)
  }, [jobs])

  const filterSuggestionsByStatus = useCallback((status: string) => {
    return suggestions.filter(suggestion => suggestion.status === status)
  }, [suggestions])

  const filterSuggestionsByType = useCallback((type: string) => {
    return suggestions.filter(suggestion => suggestion.type === type)
  }, [suggestions])

  // Real-time WebSocket connection
  useEffect(() => {
    if (!enableRealtime) return

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${protocol}//${window.location.host}/api/ai/processing-dashboard/ws`
        
        wsRef.current = new WebSocket(wsUrl)
        
        wsRef.current.onopen = () => {
          console.log('🔌 AI Processing Dashboard WebSocket connected')
          setIsRealTimeConnected(true)
        }
        
        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            
            switch (message.type) {
              case 'job_update':
                setJobs(prev => prev.map(job => 
                  job.id === message.data.id ? { ...job, ...message.data } : job
                ))
                break
              case 'suggestion_update':
                setSuggestions(prev => prev.map(suggestion => 
                  suggestion.id === message.data.id ? { ...suggestion, ...message.data } : suggestion
                ))
                break
              case 'stats_update':
                setStats(message.data)
                break
              default:
                console.log('Unknown WebSocket message type:', message.type)
            }
            
            setLastUpdate(new Date())
          } catch (err) {
            console.error('Error parsing WebSocket message:', err)
          }
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsRealTimeConnected(false)
        }
        
        wsRef.current.onclose = () => {
          console.log('🔌 AI Processing Dashboard WebSocket disconnected')
          setIsRealTimeConnected(false)
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000)
        }
      } catch (err) {
        console.error('Error connecting to WebSocket:', err)
        setIsRealTimeConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [enableRealtime])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    refreshIntervalRef.current = setInterval(() => {
      if (!isRealTimeConnected) {
        refreshData()
      }
    }, refreshInterval)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, isRealTimeConnected, refreshData])

  // Initial data load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    // Data
    jobs,
    stats,
    suggestions,
    
    // Loading states
    loading,
    loadingJobs,
    loadingStats,
    loadingSuggestions,
    
    // Error states
    error,
    
    // Actions
    refreshData,
    refreshJobs: fetchJobs,
    refreshStats: fetchStats,
    refreshSuggestions: fetchSuggestions,
    
    // Job management
    startJob,
    pauseJob,
    cancelJob,
    updateJobSettings,
    
    // Suggestion management
    approveSuggestion,
    rejectSuggestion,
    submitFeedback,
    batchApproveSuggestions,
    batchRejectSuggestions,
    
    // Filters
    filterJobsByStatus,
    filterSuggestionsByStatus,
    filterSuggestionsByType,
    
    // Real-time status
    isRealTimeConnected,
    lastUpdate
  }
} 