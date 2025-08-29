import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time environment variable issues
let supabaseClient: any = null

const getSupabaseClient = () => {
  if (!supabaseClient && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  }
  return supabaseClient
};

export interface BookmarkAnalytics {
  id: string;
  bookmark_id: string;
  visits: number;
  timeSpent: number;
  sessionCount: number;
  lastVisited: string | null;
  weeklyVisits: number;
  monthlyVisits: number;
}

export interface GlobalAnalytics {
  totalVisits: number;
  totalBookmarks: number;
  avgUsage: number;
  activeBookmarks: number;
  topPerformer: BookmarkAnalytics | null;
  lastUpdated: string;
}

export function useAnalytics(bookmarkId?: string | any) {
  const [analyticsData, setAnalyticsData] = useState<BookmarkAnalytics[] | BookmarkAnalytics | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Handle case where bookmarkId is an array (bookmarks) - fetch global analytics
      const isBookmarkIdString = typeof bookmarkId === 'string';
      const url = isBookmarkIdString ? `/api/bookmarks/analytics?bookmarkId=${bookmarkId}` : '/api/bookmarks/analytics';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        if (isBookmarkIdString) {
          setAnalyticsData(result.data);
        } else {
          setAnalyticsData(result.data.analytics);
          setGlobalStats(result.data.globalStats);
        }
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [bookmarkId]);

  const trackVisit = useCallback(async (id: string) => {
    try {
      await fetch('/api/bookmarks/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId: id, action: 'visit' }),
      });
      fetchAnalytics();
    } catch (e) {
      console.error('Failed to track visit:', e);
    }
  }, [fetchAnalytics]);

  const trackTimeSpent = useCallback(async (id: string, timeSpent: number) => {
    try {
      await fetch('/api/bookmarks/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId: id, action: 'timeUpdate', timeSpent }),
      });
       fetchAnalytics();
    } catch (e) {
      console.error('Failed to track time spent:', e);
    }
  }, [fetchAnalytics]);

  const getBookmarkAnalytics = useCallback((id: string) => {
    if (!analyticsData) return null;
    
    // If analyticsData is an array, find the specific bookmark
    if (Array.isArray(analyticsData)) {
      return analyticsData.find(item => item.bookmark_id === id) || null;
    }
    
    // If analyticsData is a single object and matches the id
    if (typeof analyticsData === 'object' && analyticsData.bookmark_id === id) {
      return analyticsData;
    }
    
    return null;
  }, [analyticsData]);


  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return {
    analyticsData,
    globalStats,
    isLoading,
    error,
    trackVisit,
    trackTimeSpent,
    getBookmarkAnalytics,
    refreshAnalytics: fetchAnalytics,
  };
}

export function useBookmarkTracking() {
  const trackBookmarkVisit = useCallback(async (bookmarkId: string) => {
    try {
      await fetch('/api/bookmarks/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarkId, action: 'visit' }),
      });
    } catch (error) {
      console.error('Failed to track bookmark visit:', error)
    }
  }, [])

  return {
    trackBookmarkVisit,
  }
} 