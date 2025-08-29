import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

interface ExtensionAnalytics {
  bookmarksSaved: number;
  suggestionsShown: number;
  suggestionsAccepted: number;
  categoriesUsed: string[];
  lastSync: number;
  timestamp: number;
  userAgent?: string;
  version?: string;
}

interface AnalyticsData {
  daily: Record<string, ExtensionAnalytics>;
  weekly: Record<string, ExtensionAnalytics>;
  monthly: Record<string, ExtensionAnalytics>;
  total: ExtensionAnalytics;
  lastUpdated: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookmarksSaved,
      suggestionsShown,
      suggestionsAccepted,
      categoriesUsed,
      lastSync
    } = body;

    // Get current date for analytics grouping
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const thisWeek = getWeekKey(now);
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Hybrid storage config
    const USE_SUPABASE = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
    );
    const supabase = USE_SUPABASE
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : null;

    if (USE_SUPABASE && supabase) {
      // Ensure table exists (idempotent)
      await supabase.rpc('noop').catch(async () => {});
      // Perform upserts for daily/weekly/monthly/total
      const increments = {
        bookmarks_saved: bookmarksSaved || 0,
        suggestions_shown: suggestionsShown || 0,
        suggestions_accepted: suggestionsAccepted || 0,
        categories_used: categoriesUsed || [],
        last_sync: new Date(lastSync || Date.now()).toISOString(),
        updated_at: new Date().toISOString(),
      } as any;

      const rows = [
        { period_type: 'daily', period_key: today },
        { period_type: 'weekly', period_key: thisWeek },
        { period_type: 'monthly', period_key: thisMonth },
        { period_type: 'total', period_key: 'total' },
      ];

      for (const r of rows) {
        // Upsert pattern using RPC or insert with on conflict
        const { error } = await supabase
          .from('extension_analytics')
          .upsert(
            [{
              period_type: r.period_type,
              period_key: r.period_key,
              bookmarks_saved: increments.bookmarks_saved,
              suggestions_shown: increments.suggestions_shown,
              suggestions_accepted: increments.suggestions_accepted,
              categories_used: increments.categories_used,
              last_sync: increments.last_sync,
              updated_at: increments.updated_at,
              created_at: new Date().toISOString(),
            }],
            { onConflict: 'period_type,period_key' }
          );
        if (error) {
          // If conflict upsert not supported, try update then insert
          const { data: existing } = await supabase
            .from('extension_analytics')
            .select('period_type,period_key,bookmarks_saved,suggestions_shown,suggestions_accepted,categories_used')
            .eq('period_type', r.period_type)
            .eq('period_key', r.period_key)
            .maybeSingle();
          if (existing) {
            const { error: updErr } = await supabase
              .from('extension_analytics')
              .update({
                bookmarks_saved: (existing.bookmarks_saved || 0) + increments.bookmarks_saved,
                suggestions_shown: (existing.suggestions_shown || 0) + increments.suggestions_shown,
                suggestions_accepted: (existing.suggestions_accepted || 0) + increments.suggestions_accepted,
                categories_used: Array.from(new Set([...(existing.categories_used || []), ...increments.categories_used])),
                last_sync: increments.last_sync,
                updated_at: increments.updated_at,
              })
              .eq('period_type', r.period_type)
              .eq('period_key', r.period_key);
            if (updErr) throw updErr;
          } else {
            const { error: insErr } = await supabase
              .from('extension_analytics')
              .insert([{
                period_type: r.period_type,
                period_key: r.period_key,
                bookmarks_saved: increments.bookmarks_saved,
                suggestions_shown: increments.suggestions_shown,
                suggestions_accepted: increments.suggestions_accepted,
                categories_used: increments.categories_used,
                last_sync: increments.last_sync,
                updated_at: increments.updated_at,
                created_at: new Date().toISOString(),
              }]);
            if (insErr) throw insErr;
          }
        }
      }

      // Fetch the updated aggregates to return
      const { data: dailyRows } = await supabase
        .from('extension_analytics')
        .select('*')
        .eq('period_type', 'daily')
        .order('period_key', { ascending: false })
        .limit(1);
      const { data: weeklyRows } = await supabase
        .from('extension_analytics')
        .select('*')
        .eq('period_type', 'weekly')
        .order('period_key', { ascending: false })
        .limit(1);
      const { data: monthlyRows } = await supabase
        .from('extension_analytics')
        .select('*')
        .eq('period_type', 'monthly')
        .order('period_key', { ascending: false })
        .limit(1);
      const { data: totalRows } = await supabase
        .from('extension_analytics')
        .select('*')
        .eq('period_type', 'total')
        .eq('period_key', 'total')
        .limit(1);

      return NextResponse.json({
        success: true,
        analytics: {
          today: dailyRows?.[0] || null,
          thisWeek: weeklyRows?.[0] || null,
          thisMonth: monthlyRows?.[0] || null,
          total: totalRows?.[0] || null,
        }
      });
    }

    // File fallback (development)
    const analyticsPath = path.join(process.cwd(), 'data', 'extension-analytics.json');
    let analytics: AnalyticsData;

    try {
      const analyticsData = await fs.readFile(analyticsPath, 'utf-8');
      analytics = JSON.parse(analyticsData);
    } catch (error) {
      // Initialize new analytics data
      analytics = {
        daily: {},
        weekly: {},
        monthly: {},
        total: {
          bookmarksSaved: 0,
          suggestionsShown: 0,
          suggestionsAccepted: 0,
          categoriesUsed: [],
          lastSync: 0,
          timestamp: Date.now()
        },
        lastUpdated: Date.now()
      };
    }

    // Update daily analytics
    if (!analytics.daily[today]) {
      analytics.daily[today] = {
        bookmarksSaved: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        categoriesUsed: [],
        lastSync: 0,
        timestamp: Date.now()
      };
    }

    // Update weekly analytics
    if (!analytics.weekly[thisWeek]) {
      analytics.weekly[thisWeek] = {
        bookmarksSaved: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        categoriesUsed: [],
        lastSync: 0,
        timestamp: Date.now()
      };
    }

    // Update monthly analytics
    if (!analytics.monthly[thisMonth]) {
      analytics.monthly[thisMonth] = {
        bookmarksSaved: 0,
        suggestionsShown: 0,
        suggestionsAccepted: 0,
        categoriesUsed: [],
        lastSync: 0,
        timestamp: Date.now()
      };
    }

    // Increment counters
    const increment = {
      bookmarksSaved: bookmarksSaved || 0,
      suggestionsShown: suggestionsShown || 0,
      suggestionsAccepted: suggestionsAccepted || 0
    };

    // Update all periods
    [analytics.daily[today], analytics.weekly[thisWeek], analytics.monthly[thisMonth], analytics.total].forEach(period => {
      period.bookmarksSaved += increment.bookmarksSaved;
      period.suggestionsShown += increment.suggestionsShown;
      period.suggestionsAccepted += increment.suggestionsAccepted;
      period.lastSync = lastSync || Date.now();
      period.timestamp = Date.now();

      // Update categories used
      if (categoriesUsed && Array.isArray(categoriesUsed)) {
        const existingCategories = new Set(period.categoriesUsed);
        categoriesUsed.forEach(category => existingCategories.add(category));
        period.categoriesUsed = Array.from(existingCategories);
      }
    });

    // Update last updated timestamp
    analytics.lastUpdated = Date.now();

    // Clean up old daily data (keep only last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    Object.keys(analytics.daily).forEach(date => {
      if (date < cutoffDate) {
        delete analytics.daily[date];
      }
    });

    // Clean up old weekly data (keep only last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
    const cutoffWeek = getWeekKey(twelveWeeksAgo);

    Object.keys(analytics.weekly).forEach(week => {
      if (week < cutoffWeek) {
        delete analytics.weekly[week];
      }
    });

    // Clean up old monthly data (keep only last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoffMonth = `${twelveMonthsAgo.getFullYear()}-${String(twelveMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

    Object.keys(analytics.monthly).forEach(month => {
      if (month < cutoffMonth) {
        delete analytics.monthly[month];
      }
    });

    // Save updated analytics
    await fs.writeFile(analyticsPath, JSON.stringify(analytics, null, 2));

    return NextResponse.json({
      success: true,
      analytics: {
        today: analytics.daily[today],
        thisWeek: analytics.weekly[thisWeek],
        thisMonth: analytics.monthly[thisMonth],
        total: analytics.total
      }
    });

  } catch (error) {
    console.error('Error updating extension analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly, total
    const limit = parseInt(searchParams.get('limit') || '30');

    const USE_SUPABASE = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
    );
    const supabase = USE_SUPABASE
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } }
        )
      : null;

    if (USE_SUPABASE && supabase) {
      // Fetch period rows
      let query = supabase.from('extension_analytics').select('*');
      if (period === 'total') {
        query = query.eq('period_type', 'total').eq('period_key', 'total');
      } else {
        query = query.eq('period_type', period).order('period_key', { ascending: false }).limit(limit);
      }
      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
      }
      // Build summary by aggregating totals
      const { data: totalRow } = await supabase
        .from('extension_analytics')
        .select('*')
        .eq('period_type', 'total')
        .eq('period_key', 'total')
        .limit(1);
      const total = totalRow?.[0] || { bookmarks_saved: 0, suggestions_shown: 0, suggestions_accepted: 0, categories_used: [], last_sync: null };
      const summary = {
        totalBookmarksSaved: total.bookmarks_saved || 0,
        totalSuggestionsShown: total.suggestions_shown || 0,
        totalSuggestionsAccepted: total.suggestions_accepted || 0,
        acceptanceRate: total.suggestions_shown ? Math.round((total.suggestions_accepted / total.suggestions_shown) * 10000) / 100 : 0,
        topCategories: (total.categories_used || []).slice(0, 5).map((c: string) => ({ category: c, count: 1 })),
        lastSync: total.last_sync,
      };

      // Map rows to keyed object for client compatibility
      const keyed = (data || []).reduce((acc: Record<string, any>, row: any) => {
        acc[row.period_key] = {
          bookmarksSaved: row.bookmarks_saved,
          suggestionsShown: row.suggestions_shown,
          suggestionsAccepted: row.suggestions_accepted,
          categoriesUsed: row.categories_used || [],
          lastSync: row.last_sync ? new Date(row.last_sync).getTime() : 0,
          timestamp: new Date(row.updated_at || row.created_at).getTime(),
        } as ExtensionAnalytics;
        return acc;
      }, {});

      return NextResponse.json({
        analytics: keyed,
        summary,
        period,
        limit,
        lastUpdated: Date.now(),
      });
    }

    // File fallback: Load analytics data
    const analyticsPath = path.join(process.cwd(), 'data', 'extension-analytics.json');
    
    let analytics: AnalyticsData;
    try {
      const analyticsData = await fs.readFile(analyticsPath, 'utf-8');
      analytics = JSON.parse(analyticsData);
    } catch (error) {
      return NextResponse.json({
        analytics: {},
        summary: {
          totalBookmarksSaved: 0,
          totalSuggestionsShown: 0,
          totalSuggestionsAccepted: 0,
          acceptanceRate: 0,
          topCategories: [],
          lastSync: null
        },
        period,
        limit
      });
    }

    let periodData: Record<string, ExtensionAnalytics> = {};
    
    switch (period) {
      case 'daily':
        periodData = analytics.daily;
        break;
      case 'weekly':
        periodData = analytics.weekly;
        break;
      case 'monthly':
        periodData = analytics.monthly;
        break;
      case 'total':
        periodData = { total: analytics.total };
        break;
    }

    // Sort by date and limit results
    const sortedData = Object.entries(periodData)
      .sort(([a], [b]) => b.localeCompare(a)) // Most recent first
      .slice(0, limit)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, ExtensionAnalytics>);

    // Calculate summary statistics
    const summary = calculateSummary(analytics);

    return NextResponse.json({
      analytics: sortedData,
      summary,
      period,
      limit,
      lastUpdated: analytics.lastUpdated
    });

  } catch (error) {
    console.error('Error fetching extension analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getWeekKey(date: Date): string {
  // Get Monday of the week
  const monday = new Date(date);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  monday.setDate(diff);
  
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD of Monday
}

function calculateSummary(analytics: AnalyticsData) {
  const total = analytics.total;
  
  // Calculate acceptance rate
  const acceptanceRate = total.suggestionsShown > 0 
    ? (total.suggestionsAccepted / total.suggestionsShown) * 100 
    : 0;

  // Get top categories
  const categoryCount: Record<string, number> = {};
  
  // Count categories across all periods
  Object.values(analytics.daily).forEach(day => {
    day.categoriesUsed.forEach(category => {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  let recentBookmarks = 0;
  let recentSuggestions = 0;
  
  Object.entries(analytics.daily).forEach(([date, data]) => {
    if (new Date(date) >= sevenDaysAgo) {
      recentBookmarks += data.bookmarksSaved;
      recentSuggestions += data.suggestionsShown;
    }
  });

  return {
    totalBookmarksSaved: total.bookmarksSaved,
    totalSuggestionsShown: total.suggestionsShown,
    totalSuggestionsAccepted: total.suggestionsAccepted,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    topCategories,
    recentActivity: {
      bookmarksLast7Days: recentBookmarks,
      suggestionsLast7Days: recentSuggestions
    },
    lastSync: total.lastSync
  };
} 