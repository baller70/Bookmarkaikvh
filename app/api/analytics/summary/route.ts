import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // For now, we use the dev user ID as per testing requirements
    const userId = '00000000-0000-0000-0000-000000000001';

    // Get total bookmarks
    const { count: totalBookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (bookmarksError) throw bookmarksError;

    // Get total visits from the analytics table (sum all rows)
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('bookmark_analytics')
      .select('visits');

    if (analyticsError) throw analyticsError;

    const totalVisits = analyticsData?.reduce((acc, row) => acc + (row as any).visits, 0) || 0;
    
    // Placeholder calculations for other metrics
    const engagementScore = totalBookmarks && totalBookmarks > 0 ? (totalVisits / totalBookmarks) * 10 : 0;

    const summary = {
      totalBookmarks: totalBookmarks || 0,
      totalCategories: 0, // TODO: compute distinct categories
      totalVisits,
      totalTimeSpentMinutes: 0,
      engagementScore: parseFloat(engagementScore.toFixed(1)),
      activeStreak: 0,
    };

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics summary', details: (error as Error).message },
      { status: 500 }
    );
  }
}
