import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// In-memory analytics store for file fallback mode
const analyticsStore = new Map<string, {
  bookmark_id: string;
  visits: number;
  sessionCount: number;
  weeklyVisits: number;
  monthlyVisits: number;
  lastVisited: string;
  timeSpent: number;
}>();

const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
);
const USE_FILES_FALLBACK = !USE_SUPABASE;

const supabase = USE_SUPABASE ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) : null;

console.log('🔧 Analytics Storage Configuration:');
console.log('📊 USE_SUPABASE:', USE_SUPABASE);
console.log('📁 USE_FILES_FALLBACK:', USE_FILES_FALLBACK);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookmarkId, action, timeSpent } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
    }

    // If using file fallback, store analytics in memory
    if (USE_FILES_FALLBACK) {
      console.log('📊 Analytics tracking (file fallback):', { bookmarkId, action, timeSpent });
      
      // Ensure bookmarkId is always a string for consistent storage
      const bookmarkKey = String(bookmarkId);
      
      // Get or create analytics record
      let analytics = analyticsStore.get(bookmarkKey);
      if (!analytics) {
        analytics = {
          bookmark_id: bookmarkId,
          visits: 0,
          sessionCount: 0,
          weeklyVisits: 0,
          monthlyVisits: 0,
          lastVisited: new Date().toISOString(),
          timeSpent: 0
        };
      }
      
      // Update analytics based on action
      if (action === 'visit') {
        analytics.visits += 1;
        analytics.sessionCount += 1;
        analytics.weeklyVisits += 1;
        analytics.monthlyVisits += 1;
        analytics.lastVisited = new Date().toISOString();
      } else if (action === 'timeUpdate' && timeSpent !== undefined) {
        // Set the total time spent (not additive)
        analytics.timeSpent = timeSpent;
      }
      
      // Store updated analytics
      analyticsStore.set(bookmarkKey, analytics);
      
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

    // Check if bookmark exists
    const { data: bookmark, error: bookmarkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('id', bookmarkId)
      .single();

    if (bookmarkError || !bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
    }

    // Upsert analytics record
    const { data: analytics, error: analyticsError } = await supabase
      .from('bookmark_analytics')
      .select('*')
      .eq('bookmark_id', bookmarkId)
      .single();

    let updatedAnalytics;

    const updateData: any = {};
    if (action === 'visit') {
        updateData.visits = (analytics?.visits || 0) + 1;
        updateData.sessionCount = (analytics?.sessionCount || 0) + 1;
        updateData.weeklyVisits = (analytics?.weeklyVisits || 0) + 1;
        updateData.monthlyVisits = (analytics?.monthlyVisits || 0) + 1;
        updateData.lastVisited = new Date().toISOString();
    } else if (action === 'timeUpdate') {
        updateData.timeSpent = (analytics?.timeSpent || 0) + (timeSpent || 0);
        updateData.lastVisited = new Date().toISOString();
    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (analytics) {
        // Update existing analytics
        const { data, error } = await supabase
            .from('bookmark_analytics')
            .update(updateData)
            .eq('bookmark_id', bookmarkId)
            .select()
            .single();
        if (error) throw error;
        updatedAnalytics = data;
    } else {
        // Create new analytics
        const { data, error } = await supabase
            .from('bookmark_analytics')
            .insert({ bookmark_id: bookmarkId, ...updateData })
            .select()
            .single();
        if (error) throw error;
        updatedAnalytics = data;
    }

    return NextResponse.json({ 
      success: true, 
      analytics: updatedAnalytics,
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
      if (bookmarkId && bookmarkId.trim() !== '') {
        // Return analytics for specific bookmark
        const bookmarkKey = String(bookmarkId);
        const analytics = analyticsStore.get(bookmarkKey);
        if (analytics) {
          return NextResponse.json({ success: true, data: analytics })
        } else {
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
      } else {
        // Return global analytics data
        const allAnalytics = Array.from(analyticsStore.values());
        const totalVisits = allAnalytics.reduce((sum, a) => sum + a.visits, 0);
        const totalBookmarks = allAnalytics.length;
        
        return NextResponse.json({ 
          success: true, 
          data: { 
            analytics: allAnalytics, 
            globalStats: {
              totalVisits: totalVisits,
              totalBookmarks: totalBookmarks,
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
        return NextResponse.json({ error: 'Analytics not found for this bookmark' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: analytics })
    } else {
        // Return fallback data when no bookmarkId or when Supabase not available
        return NextResponse.json({ 
          success: true, 
          data: { 
            analytics: [], 
            globalStats: {
              totalVisits: 0,
              totalBookmarks: 247,
              activeBookmarks: 0,
              avgUsage: 0,
              topPerformer: null,
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