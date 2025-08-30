import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// In-memory analytics store for file fallback mode (persisted to data/analytics.json in dev)
const ANALYTICS_FILE = join(process.cwd(), 'data', 'analytics.json')
const analyticsStore = new Map<string, {
  bookmark_id: string;
  visits: number;
  sessionCount: number;
  weeklyVisits: number;
  monthlyVisits: number;
  lastVisited: string;
  timeSpent: number;
}>();

async function ensureDataDirectory() {
  const dir = join(process.cwd(), 'data')
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

async function loadAnalyticsFromFile() {
  try {
    await ensureDataDirectory()
    if (!existsSync(ANALYTICS_FILE)) return
    const data = await readFile(ANALYTICS_FILE, 'utf-8')
    const parsed: Array<{ bookmark_id: string; visits: number; sessionCount: number; weeklyVisits: number; monthlyVisits: number; lastVisited: string; timeSpent: number; }> = JSON.parse(data)
    analyticsStore.clear()
    for (const a of parsed) analyticsStore.set(String(a.bookmark_id), a)
  } catch (e) {
    console.warn('Failed to load analytics file:', (e as Error).message)
  }
}

async function saveAnalyticsToFile() {
  try {
    await ensureDataDirectory()
    const arr = Array.from(analyticsStore.values())
    await writeFile(ANALYTICS_FILE, JSON.stringify(arr, null, 2))
  } catch (e) {
    console.warn('Failed to save analytics file:', (e as Error).message)
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

const USE_SUPABASE = !!(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder') &&
  !supabaseKey.includes('dev-placeholder-service-key')
)
// Never use file fallback in production – Vercel functions are ephemeral
const USE_FILES_FALLBACK = !USE_SUPABASE && process.env.NODE_ENV !== 'production'

const supabase = USE_SUPABASE ? createClient(
  supabaseUrl!,
  supabaseKey!
) : null;

console.log('🔧 Analytics Storage Configuration:');
console.log('📊 USE_SUPABASE:', USE_SUPABASE);
console.log('📁 USE_FILES_FALLBACK:', USE_FILES_FALLBACK);

function getUtcMondayStartISO(d: Date) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = date.getUTCDay() // 0 Sun ... 1 Mon
  const diff = (day === 0 ? -6 : 1 - day) // shift back to Monday
  date.setUTCDate(date.getUTCDate() + diff)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

function getUtcMondayStart(): Date {
  const d = new Date()
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = monday.getUTCDay()
  const diff = (day === 0 ? -6 : 1 - day)
  monday.setUTCDate(monday.getUTCDate() + diff)
  monday.setUTCHours(0,0,0,0)
  return monday
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookmarkId, action, timeSpent } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    // If using file fallback, store analytics in memory and persist to file
    if (USE_FILES_FALLBACK) {
      await loadAnalyticsFromFile()
      console.log('📊 Analytics tracking (file fallback):', { bookmarkId, action, timeSpent });
      
      const bookmarkKey = String(bookmarkId);
      
      let analytics = analyticsStore.get(bookmarkKey);
      if (!analytics) {
        analytics = {
          bookmark_id: bookmarkKey,
          visits: 0,
          sessionCount: 0,
          weeklyVisits: 0,
          monthlyVisits: 0,
          lastVisited: new Date().toISOString(),
          timeSpent: 0
        };
      }
      
      if (action === 'visit') {
        analytics.visits += 1;
        analytics.sessionCount += 1;
        analytics.weeklyVisits += 1;
        analytics.monthlyVisits += 1;
        analytics.lastVisited = new Date().toISOString();
      } else if (action === 'timeUpdate' && timeSpent !== undefined) {
        analytics.timeSpent = timeSpent;
      }
      
      analyticsStore.set(bookmarkKey, analytics);
      await saveAnalyticsToFile()
      
      console.log('💾 Updated analytics for bookmark', bookmarkKey, ':', analytics);
      
      return NextResponse.json({ 
        success: true, 
        analytics: {
          ...analytics,
          action: action,
          tracked_at: new Date().toISOString()
        } 
      })
    }

    // Proceed even if the bookmark record is not present. We allow analytics to track
    // arbitrary bookmark IDs to support pre-seeding and client-first events.

    // Upsert analytics record
    // Load latest analytics for this bookmark
    const { data: analytics, error: analyticsError } = await supabase
      .from('bookmark_analytics')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .single();

    let updatedAnalytics;

    const updateData: any = {};
    if (action === 'visit') {
        updateData.visits = (analytics?.visits || 0) + 1;
        // sessionCount removed - causing DB errors
        // if new week started (Monday UTC), reset weeklyVisits baseline
        const now = new Date();
        const weekStartISO = getUtcMondayStartISO(now);
        const storedWeekStart = (analytics as any)?.week_start || null;
        const currentWeekly = (analytics as any)?.weeklyVisits ?? (analytics as any)?.weeklyvisits ?? 0
        // Normalize both dates to compare properly (handle timezone differences)
        const isNewWeek = !storedWeekStart || 
          new Date(storedWeekStart).getTime() !== new Date(weekStartISO).getTime();
        
        if (isNewWeek) {
          updateData.week_start = weekStartISO;
          updateData.weeklyVisits = 1;
        } else {
          updateData.weeklyVisits = currentWeekly + 1;
        }

        updateData.lastVisited = new Date().toISOString();
        updateData.last_visited_at = updateData.lastVisited;
    } else if (action === 'timeUpdate') {
        updateData.time_spent = (analytics?.time_spent || analytics?.timeSpent || 0) + (timeSpent || 0);
        updateData.lastVisited = new Date().toISOString();
        updateData.last_visited_at = updateData.lastVisited;
    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Send both snake_case and camelCase keys to be robust against casing
    const buildPayload = () => {
      const payload: any = { ...updateData }
      if (updateData.weeklyVisits !== undefined) payload.weeklyvisits = updateData.weeklyVisits
      if (updateData.week_start !== undefined) payload.week_start = updateData.week_start

      // sessionCount removed - was causing DB errors
      // if (updateData.sessionCount !== undefined) payload.sessioncount = updateData.sessionCount
      if ((updateData as any).lastVisited && !(updateData as any).last_visited_at) payload.last_visited_at = (updateData as any).lastVisited
      return payload
    }

    const tryPersist = async () => {
      const payload = buildPayload()
      if (analytics) {
        return await supabase
          .from('bookmark_analytics')
          .update(payload)
          .eq('bookmark_id', bookmarkId)
          .select('*')
          .single();
      } else {
        return await supabase
          .from('bookmark_analytics')
          .insert({ bookmark_id: bookmarkId, ...payload })
          .select('*')
          .single();
      }
    }

    let first = await tryPersist()
    if (first.error && (first.error.code === '42703' || /column .* does not exist/i.test(first.error.message || ''))) {
      // DB columns not migrated yet; retry without weekly/timestamp fields
      const { week_start, last_visited_at, ...fallbackUpdate } = updateData
      Object.assign(updateData, fallbackUpdate)
      first = await tryPersist()
    }
    if (first.error) throw first.error
    updatedAnalytics = first.data;

    const normalized = updatedAnalytics ? {
      bookmark_id: String(updatedAnalytics.bookmark_id),
      visits: updatedAnalytics.visits ?? 0,
      sessionCount: updatedAnalytics.sessioncount ?? updatedAnalytics.sessionCount ?? 0,
      weeklyVisits: updatedAnalytics.weeklyvisits ?? updatedAnalytics.weeklyVisits ?? 0,
      monthlyVisits: 0, // Not stored in DB, computed client-side if needed
      lastVisited: updatedAnalytics.last_visited_at ?? updatedAnalytics.lastVisited ?? null,
      timeSpent: updatedAnalytics.time_spent ?? updatedAnalytics.timeSpent ?? 0,
    } : null

    return NextResponse.json({ 
      success: true, 
      analytics: normalized,
      message: 'Analytics updated successfully'
    })

  } catch (error) {
    console.error('Analytics API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update analytics', details: errorMessage }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('bookmarkId')

    if (USE_FILES_FALLBACK) {
      await loadAnalyticsFromFile()
      if (bookmarkId && bookmarkId.trim() !== '') {
        const bookmarkKey = String(bookmarkId);
        const analytics = analyticsStore.get(bookmarkKey);
        if (analytics) {
          return NextResponse.json({ success: true, data: analytics })
        } else {
          return NextResponse.json({ 
            success: true, 
            data: { 
              bookmark_id: bookmarkKey,
              visits: 0, 
              sessionCount: 0, 
              weeklyVisits: 0,
              monthlyVisits: 0,
              lastVisited: null,
              timeSpent: 0
            } 
          })
        }
      } else {
        const allAnalytics = Array.from(analyticsStore.values());
        const totalVisits = allAnalytics.reduce((sum, a) => sum + a.visits, 0);
        const totalBookmarks = allAnalytics.length;
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            analytics: allAnalytics, 
            globalStats: {
              totalVisits,
              totalBookmarks,
              activeBookmarks: allAnalytics.filter(a => a.visits > 0).length,
              avgUsage: totalBookmarks > 0 ? Math.round(totalVisits / totalBookmarks) : 0,
              topPerformer: allAnalytics.length > 0 ? 
                allAnalytics.reduce((top, current) => current.visits > top.visits ? current : top) : null,
              lastUpdated: new Date().toISOString()
            }
          } 
        })
      }
    }

    if (bookmarkId && bookmarkId.trim() !== '') {
      const { data: analytics, error } = await supabase
        .from('bookmark_analytics')
        .select('*')
        .eq('bookmark_id', bookmarkId)
        .single();

      if (error || !analytics) {
        return NextResponse.json({ 
          success: true, 
          data: { 
            bookmark_id: bookmarkId,
            visits: 0, 
            sessionCount: 0, 
            weeklyVisits: 0,
            monthlyVisits: 0,
            lastVisited: null,
            timeSpent: 0
          } 
        })
      }
      
      // Normalize the response to include monthlyVisits
      const normalized = {
        bookmark_id: String(analytics.bookmark_id),
        visits: analytics.visits || 0,
        sessionCount: analytics.sessioncount ?? analytics.sessionCount ?? 0,
        weeklyVisits: analytics.weeklyvisits ?? analytics.weeklyVisits ?? 0,
        monthlyVisits: 0, // Not stored in DB, computed client-side if needed
        lastVisited: analytics.last_visited_at ?? analytics.lastVisited ?? null,
        timeSpent: analytics.time_spent ?? analytics.timeSpent ?? 0,
      };
      
      return NextResponse.json({ success: true, data: normalized })
    } else {
        // Aggregate analytics across all bookmarks from Supabase
        const { data: analyticsRows, error: analyticsError } = await supabase
          .from('bookmark_analytics')
          .select('*')
        if (analyticsError) throw analyticsError

        const mapped = (analyticsRows || []).map((r: any) => ({
          bookmark_id: String(r.bookmark_id),
          visits: r?.visits || 0,
          sessionCount: r?.sessioncount ?? r?.sessionCount ?? 0,
          weeklyVisits: r?.weeklyVisits ?? r?.weeklyvisits ?? 0,
          monthlyVisits: 0, // Not stored in DB, computed client-side if needed
          lastVisited: r?.last_visited_at ?? r?.lastVisited ?? '',
          timeSpent: r?.time_spent ?? r?.timeSpent ?? 0,
        }))

        const totalVisits = mapped.reduce((sum: number, a: any) => sum + (a.visits || 0), 0)
        const { count: totalBookmarks, error: countError } = await supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true })
        if (countError) throw countError

        return NextResponse.json({ 
          success: true, 
          data: { 
            analytics: mapped, 
            globalStats: {
              totalVisits,
              totalBookmarks: totalBookmarks || 0,
              activeBookmarks: mapped.filter((a: any) => a.visits > 0).length,
              avgUsage: (totalBookmarks || 0) > 0 ? Math.round(totalVisits / (totalBookmarks as number)) : 0,
              topPerformer: mapped.length > 0 ? mapped.reduce((top: any, cur: any) => (cur.visits > top.visits ? cur : top)) : null,
              lastUpdated: new Date().toISOString()
            }
          } 
        })
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch analytics', details: errorMessage }, { status: 500 })
  }
}    