import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(_request: NextRequest) {
  try {
    // Use dev bypass user during testing
    const userId = '00000000-0000-0000-0000-000000000001'

    // Total bookmarks for user
    const { count: totalBookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (bookmarksError) throw bookmarksError

    // Sum visits from analytics table
    const { data: analyticsRows, error: analyticsError } = await supabase
      .from('bookmark_analytics')
      .select('visits')

    if (analyticsError) throw analyticsError

    const totalVisits = (analyticsRows || []).reduce((sum, r: any) => sum + (r?.visits || 0), 0)

    const engagementScore = totalBookmarks && totalBookmarks > 0
      ? Number(((totalVisits / totalBookmarks) * 10).toFixed(1))
      : 0

    return NextResponse.json({
      totalBookmarks: totalBookmarks || 0,
      totalCategories: 0,
      totalVisits,
      totalTimeSpentMinutes: 0,
      engagementScore,
      activeStreak: 0,
    })
  } catch (err) {
    console.error('Summary API error:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics summary' }, { status: 500 })
  }
}
