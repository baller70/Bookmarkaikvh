import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AnalyticsData {
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
    weeklyPattern: Array<{ day: string; hours: number }>
    peakHours: Array<{ hour: string; productivity: number }>
    totalHours: number
    sessionsCompleted: number
    focusScore: number
  }
  bookmarkInsights: {
    topPerformers: Array<{
      name: string
      visits: number
      timeSpent: number
      productivity: number
    }>
    underperformers: Array<{
      name: string
      visits: number
      lastVisited: string
      category: string
    }>
    unusedBookmarks: Array<{
      name: string
      daysUnused: number
      category: string
    }>
  }
  categoryAnalysis: {
    categories: Array<{
      name: string
      efficiency: number
      timeSpent: number
      bookmarkCount: number
    }>
    productivityByCategory: Array<{
      category: string
      score: number
    }>
  }
  projectManagement: {
    activeProjects: Array<{
      name: string
      progress: number
      deadline: string
      status: string
    }>
    resourceAllocation: Array<{
      resource: string
      utilization: number
    }>
  }
  smartRecommendations: {
    cleanup: Array<{
      type: string
      count: number
      impact: string
    }>
    optimization: Array<{
      suggestion: string
      benefit: string
      effort: string
    }>
    trending: Array<{
      item: string
      growth: number
      category: string
    }>
  }
}

interface UseAnalyticsOptions {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  section?: keyof AnalyticsData
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  lastUpdated: string | null
  refetch: () => Promise<void>
  updateTimeRange: (range: '7d' | '30d' | '90d' | '1y') => void
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    timeRange = '30d',
    section,
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required')
      }

      // Build API URL
      const params = new URLSearchParams({
        timeRange: currentTimeRange,
        ...(section && { section })
      })

      const response = await fetch(`/api/analytics?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch analytics')
      }

      setData(result.data)
      setLastUpdated(result.lastUpdated)
      
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [currentTimeRange, section])

  const updateTimeRange = useCallback((range: '7d' | '30d' | '90d' | '1y') => {
    setCurrentTimeRange(range)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAnalytics])

  // Refetch when time range changes
  useEffect(() => {
    if (currentTimeRange !== timeRange) {
      fetchAnalytics()
    }
  }, [currentTimeRange, timeRange, fetchAnalytics])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchAnalytics,
    updateTimeRange
  }
}

// Hook for tracking bookmark visits
export function useBookmarkTracking() {
  const trackBookmarkVisit = useCallback(async (bookmarkId: string, readingTime?: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      // Update visit count and last visited time
      const updates: any = {
        visit_count: supabase.rpc('increment_visit_count', { bookmark_id: bookmarkId }),
        last_visited_at: new Date().toISOString()
      }

      if (readingTime) {
        updates.reading_time_minutes = readingTime
      }

      await supabase
        .from('user_bookmarks')
        .update(updates)
        .eq('id', bookmarkId)
        .eq('user_id', session.user.id)

    } catch (error) {
      console.error('Failed to track bookmark visit:', error)
    }
  }, [])

  const trackPomodoroSession = useCallback(async (sessionData: {
    taskId?: string
    taskTitle?: string
    duration: number
    type: 'work' | 'shortBreak' | 'longBreak'
    isCompleted: boolean
    wasInterrupted?: boolean
  }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      await supabase
        .from('user_pomodoro_sessions')
        .insert({
          user_id: session.user.id,
          task_id: sessionData.taskId || null,
          task_title: sessionData.taskTitle || null,
          start_time: new Date().toISOString(),
          end_time: sessionData.isCompleted ? new Date().toISOString() : null,
          duration: sessionData.duration,
          type: sessionData.type,
          is_completed: sessionData.isCompleted,
          was_interrupted: sessionData.wasInterrupted || false
        })

    } catch (error) {
      console.error('Failed to track pomodoro session:', error)
    }
  }, [])

  return {
    trackBookmarkVisit,
    trackPomodoroSession
  }
}

// Real-time analytics updates using Supabase subscriptions
export function useRealtimeAnalytics() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('analytics-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_bookmarks' },
        () => setLastUpdate(new Date().toISOString())
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_pomodoro_sessions' },
        () => setLastUpdate(new Date().toISOString())
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_tasks' },
        () => setLastUpdate(new Date().toISOString())
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { lastUpdate }
} 