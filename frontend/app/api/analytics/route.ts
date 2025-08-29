import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AnalyticsQuery {
  timeRange?: '7d' | '30d' | '90d' | '1y'
  section?: 'overview' | 'time-tracking' | 'insights' | 'categories' | 'projects' | 'recommendations'
}

// GET /api/analytics - Get comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get('timeRange') as AnalyticsQuery['timeRange']) || '30d'
    const section = searchParams.get('section') as AnalyticsQuery['section']

    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get bookmarks data
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('user_bookmarks')
      .select(`
        *,
        folder:user_bookmark_folders(name, color)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError)
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }

    // Get pomodoro sessions
    const { data: pomodoroSessions, error: pomodoroError } = await supabase
      .from('user_pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (pomodoroError) {
      console.error('Error fetching pomodoro sessions:', pomodoroError)
    }

    // Get tasks data
    const { data: tasks, error: tasksError } = await supabase
      .from('user_tasks')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError)
    }

    // Calculate analytics based on section or return all
    const analytics = calculateAnalytics(bookmarks || [], pomodoroSessions || [], tasks || [], timeRange)

    if (section) {
      return NextResponse.json({
        success: true,
        data: analytics[section] || null,
        timeRange,
        lastUpdated: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

function calculateAnalytics(bookmarks: any[], pomodoroSessions: any[], tasks: any[], timeRange: string) {
  const now = new Date()
  const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365

  // Overview Analytics
  const totalBookmarks = bookmarks.length
  const totalVisits = bookmarks.reduce((sum, b) => sum + (b.visit_count || 0), 0)
  const avgVisitsPerBookmark = totalBookmarks > 0 ? Math.round(totalVisits / totalBookmarks) : 0
  
  const favoriteBookmarks = bookmarks.filter(b => b.is_favorite).length
  const recentBookmarks = bookmarks.filter(b => {
    const createdAt = new Date(b.created_at)
    const daysAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysAgo <= daysBack
  }).length

  // Time Tracking Analytics
  const totalPomodoroSessions = pomodoroSessions.length
  const completedSessions = pomodoroSessions.filter(s => s.is_completed).length
  const totalFocusTime = pomodoroSessions
    .filter(s => s.type === 'work' && s.is_completed)
    .reduce((sum, s) => sum + s.duration, 0)
  
  const dailyFocusAverage = daysBack > 0 ? totalFocusTime / daysBack / 60 : 0 // hours

  // Weekly pattern
  const weeklyPattern = Array.from({ length: 7 }, (_, i) => {
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]
    const sessionsOnDay = pomodoroSessions.filter(s => {
      const sessionDay = new Date(s.created_at).getDay()
      return sessionDay === i && s.type === 'work' && s.is_completed
    })
    const hoursOnDay = sessionsOnDay.reduce((sum, s) => sum + s.duration, 0) / 60
    return { day: dayName, hours: Math.round(hoursOnDay * 10) / 10 }
  })

  // Peak hours analysis
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
    const sessionsAtHour = pomodoroSessions.filter(s => {
      const sessionHour = new Date(s.created_at).getHours()
      return sessionHour === hour && s.type === 'work'
    })
    return { hour, sessions: sessionsAtHour.length }
  })

  const topHours = hourlyActivity
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 3)
    .map(h => ({
      hour: h.hour === 0 ? '12 AM' : h.hour < 12 ? `${h.hour} AM` : h.hour === 12 ? '12 PM' : `${h.hour - 12} PM`,
      productivity: Math.min(Math.round((h.sessions / Math.max(1, totalPomodoroSessions)) * 100), 100)
    }))

  // Bookmark Insights
  const bookmarksWithVisits = bookmarks.filter(b => (b.visit_count || 0) > 0)
  const topPerformers = bookmarksWithVisits
    .sort((a, b) => (b.visit_count || 0) - (a.visit_count || 0))
    .slice(0, 5)
    .map(b => ({
      name: b.title,
      visits: b.visit_count || 0,
      timeSpent: (b.reading_time_minutes || 0) / 60,
      productivity: Math.min(Math.round(((b.visit_count || 0) / Math.max(1, totalVisits)) * 100), 100)
    }))

  const unusedBookmarks = bookmarks
    .filter(b => {
      if (!b.last_visited_at) return true
      const lastVisited = new Date(b.last_visited_at)
      const daysUnused = (now.getTime() - lastVisited.getTime()) / (1000 * 60 * 60 * 24)
      return daysUnused > 30
    })
    .slice(0, 5)
    .map(b => ({
      name: b.title,
      daysUnused: b.last_visited_at ? 
        Math.round((now.getTime() - new Date(b.last_visited_at).getTime()) / (1000 * 60 * 60 * 24)) : 
        Math.round((now.getTime() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      category: b.category || 'Uncategorized'
    }))

  // Category Analysis
  const categoryStats = bookmarks.reduce((acc, bookmark) => {
    const category = bookmark.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = { 
        name: category, 
        bookmarkCount: 0, 
        totalVisits: 0, 
        totalTimeSpent: 0 
      }
    }
    acc[category].bookmarkCount++
    acc[category].totalVisits += bookmark.visit_count || 0
    acc[category].totalTimeSpent += bookmark.reading_time_minutes || 0
    return acc
  }, {} as Record<string, any>)

  const categories = Object.values(categoryStats).map((cat: any) => ({
    name: cat.name,
    efficiency: cat.totalVisits > 0 ? Math.min(Math.round((cat.totalVisits / cat.bookmarkCount) * 10), 100) : 0,
    timeSpent: Math.round(cat.totalTimeSpent / 60 * 10) / 10, // hours
    bookmarkCount: cat.bookmarkCount
  }))

  // Project Management (based on tasks)
  const completedTasks = tasks.filter(t => t.is_completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const tasksByPriority = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Smart Recommendations
  const recommendations = {
    cleanup: [
      { 
        type: 'Unused Bookmarks', 
        count: unusedBookmarks.length, 
        impact: unusedBookmarks.length > 10 ? 'High - Reduce clutter' : 'Medium - Minor cleanup' 
      },
      { 
        type: 'Uncategorized Bookmarks', 
        count: bookmarks.filter(b => !b.category).length, 
        impact: 'Medium - Improve organization' 
      }
    ],
    optimization: [
      { 
        suggestion: 'Focus on high-visit bookmarks', 
        benefit: 'Improve productivity', 
        effort: 'Low' 
      },
      { 
        suggestion: 'Create folders for top categories', 
        benefit: 'Better organization', 
        effort: 'Medium' 
      }
    ],
    trending: categories
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 3)
      .map(cat => ({
        item: cat.name,
        growth: cat.efficiency,
        category: 'Category Performance'
      }))
  }

  return {
    overview: {
      totalBookmarks,
      totalVisits,
      engagementScore: Math.min(Math.round((totalVisits / Math.max(1, totalBookmarks)) * 5), 100),
      growthRate: Math.round((recentBookmarks / Math.max(1, totalBookmarks)) * 100),
      timeSpent: Math.round(totalFocusTime / 60 * 10) / 10, // hours
      productivityScore: Math.round((completedSessions / Math.max(1, totalPomodoroSessions)) * 100)
    },
    timeTracking: {
      dailyAverage: Math.round(dailyFocusAverage * 10) / 10,
      weeklyPattern,
      peakHours: topHours,
      totalHours: Math.round(totalFocusTime / 60 * 10) / 10,
      sessionsCompleted: completedSessions,
      focusScore: Math.round((completedSessions / Math.max(1, totalPomodoroSessions)) * 100)
    },
    bookmarkInsights: {
      topPerformers,
      underperformers: unusedBookmarks.slice(0, 2).map(u => ({
        name: u.name,
        visits: 0,
        lastVisited: `${u.daysUnused} days ago`,
        category: u.category
      })),
      unusedBookmarks
    },
    categoryAnalysis: {
      categories,
      productivityByCategory: categories.map(cat => ({
        category: cat.name,
        score: cat.efficiency
      }))
    },
    projectManagement: {
      activeProjects: [
        { 
          name: 'Task Completion', 
          progress: completionRate, 
          deadline: 'Ongoing', 
          status: completionRate > 80 ? 'Excellent' : completionRate > 60 ? 'Good' : 'Needs Attention' 
        }
      ],
      resourceAllocation: [
        { resource: 'Focus Time', utilization: Math.min(Math.round((totalFocusTime / (daysBack * 8 * 60)) * 100), 100) },
        { resource: 'Task Management', utilization: completionRate }
      ]
    },
    smartRecommendations: recommendations
  }
} 