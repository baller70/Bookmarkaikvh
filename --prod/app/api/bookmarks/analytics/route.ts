import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookmarkId, action, timeSpent } = body

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 })
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

    if (bookmarkId) {
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
        const { data: allAnalytics, error: analyticsError } = await supabase.from('bookmark_analytics').select('*');
        const { count: totalBookmarks, error: bookmarksError } = await supabase.from('bookmarks').select('*', { count: 'exact', head: true });

        if(analyticsError || bookmarksError) {
            throw analyticsError || bookmarksError;
        }

        const totalVisits = allAnalytics.reduce((sum, a) => sum + a.visits, 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const activeBookmarks = allAnalytics.filter(a => a.lastVisited && a.lastVisited > weekAgo).length;

        const globalStats = {
            totalVisits,
            totalBookmarks: totalBookmarks || 0,
            activeBookmarks,
            avgUsage: (totalBookmarks || 0) > 0 ? totalVisits / (totalBookmarks || 0) : 0,
            topPerformer: allAnalytics.reduce((max, a) => (a.visits > (max?.visits || 0) ? a : max), allAnalytics[0] || null),
            lastUpdated: new Date().toISOString()
        };

        return NextResponse.json({
            success: true,
            data: {
                analytics: allAnalytics,
                globalStats
            }
        });
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch analytics', details: errorMessage }, { status: 500 })
  }
}    