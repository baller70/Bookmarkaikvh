import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
const USE_SUPABASE = !!(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder') &&
  !supabaseKey.includes('dev-placeholder-service-key')
)
const supabase = USE_SUPABASE ? createClient(supabaseUrl!, supabaseKey!) : null

export async function GET(_request: NextRequest) {
  try {
    const userId = '00000000-0000-0000-0000-000000000001'

    if (USE_SUPABASE && supabase) {
      const { count: totalBookmarks, error: bookmarksError } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
      if (bookmarksError) throw bookmarksError

      const { data: analyticsRows, error: analyticsError } = await supabase
        .from('bookmark_analytics')
        .select('visits, time_spent')
      if (analyticsError) throw analyticsError

      const totalVisits = (analyticsRows || []).reduce((sum, r: any) => sum + (r?.visits || 0), 0)
      const totalTimeSpentMinutes = (analyticsRows || []).reduce((sum, r: any) => sum + (r?.time_spent || 0), 0)
      const engagementScore = totalBookmarks && totalBookmarks > 0
        ? Number(((totalVisits / totalBookmarks) * 10).toFixed(1))
        : 0

      // Compute extra metrics based on week starting Monday (UTC)
      const now = new Date()
      const mondayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const day = mondayStart.getUTCDay()
      const diff = (day === 0 ? -6 : 1 - day)
      mondayStart.setUTCDate(mondayStart.getUTCDate() + diff)
      mondayStart.setUTCHours(0,0,0,0)
      const mondayISO = mondayStart.toISOString()

      const { data: weekRows, error: weekErr } = await supabase
        .from('bookmark_analytics')
        .select('weeklyVisits, week_start')
      if (weekErr) throw weekErr
      const thisWeekVisits = (weekRows || []).reduce((sum: number, r: any) => {
        // Compare dates properly (handle different string formats)
        const isThisWeek = r.week_start && 
          new Date(r.week_start).getTime() === new Date(mondayISO).getTime();
        return sum + (isThisWeek ? (r.weeklyVisits || 0) : 0);
      }, 0)

      // Broken count from bookmarks table
      const { count: brokenCount, error: brokenErr } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('site_health', 'broken')
      if (brokenErr) throw brokenErr

      return NextResponse.json({
        totalBookmarks: totalBookmarks || 0,
        totalCategories: 0,
        totalVisits,
        totalTimeSpentMinutes,
        engagementScore,
        activeStreak: 0,
        thisWeekVisits,
        brokenCount,
      })
    }

    // Local fallback
    return NextResponse.json({
      totalBookmarks: 247,
      totalCategories: 12,
      totalVisits: 0,
      totalTimeSpentMinutes: 0,
      engagementScore: 0,
      activeStreak: 0,
    })
  } catch (err) {
    console.error('Summary API error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics summary' }, { status: 200 })
  }
}
