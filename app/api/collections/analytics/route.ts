import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Collection {
  id: string;
  name: string;
  description: string;
  bookmarks: string[];
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
  template?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    views: number;
    likes: number;
    bookmarkCount: number;
    lastActivity: string;
  };
}

interface AnalyticsData {
  totalCollections: number;
  totalBookmarks: number;
  totalViews: number;
  totalLikes: number;
  averageBookmarksPerCollection: number;
  mostPopularCollection: Collection | null;
  recentActivity: Array<{
    type: 'created' | 'updated' | 'shared' | 'liked';
    collectionId: string;
    collectionName: string;
    timestamp: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
    likes: number;
    collections: number;
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topCollections: Array<{
    id: string;
    name: string;
    views: number;
    likes: number;
    bookmarks: number;
    growth: number;
  }>;
  engagementMetrics: {
    averageViewsPerCollection: number;
    averageLikesPerCollection: number;
    engagementRate: number;
    publicCollectionPercentage: number;
  };
}

const COLLECTIONS_FILE = path.join(process.cwd(), 'data', 'collections.json');
const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'collection-analytics.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(COLLECTIONS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read collections from file
async function readCollections(): Promise<Collection[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(COLLECTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Generate mock time series data
function generateTimeSeriesData(days: number = 7): Array<{
  date: string;
  views: number;
  likes: number;
  collections: number;
}> {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 100) + 50,
      likes: Math.floor(Math.random() * 30) + 10,
      collections: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return data;
}

// Calculate analytics from collections data
async function calculateAnalytics(userId?: string): Promise<AnalyticsData> {
  const collections = await readCollections();
  
  // Filter collections by user if specified
  const userCollections = userId 
    ? collections.filter(c => c.owner.id === userId || c.collaborators.includes(userId))
    : collections;

  const totalCollections = userCollections.length;
  const totalBookmarks = userCollections.reduce((sum, c) => sum + c.stats.bookmarkCount, 0);
  const totalViews = userCollections.reduce((sum, c) => sum + c.stats.views, 0);
  const totalLikes = userCollections.reduce((sum, c) => sum + c.stats.likes, 0);
  
  const averageBookmarksPerCollection = totalCollections > 0 
    ? Math.round(totalBookmarks / totalCollections * 10) / 10 
    : 0;

  // Find most popular collection
  const mostPopularCollection = userCollections.length > 0
    ? userCollections.reduce((prev, current) => 
        (prev.stats.views > current.stats.views) ? prev : current
      )
    : null;

  // Generate recent activity
  const recentActivity = userCollections
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
    .map(collection => ({
      type: 'updated' as const,
      collectionId: collection.id,
      collectionName: collection.name,
      timestamp: collection.updatedAt
    }));

  // Add some mock created activities
  const createdActivities = userCollections
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map(collection => ({
      type: 'created' as const,
      collectionId: collection.id,
      collectionName: collection.name,
      timestamp: collection.createdAt
    }));

  const allActivity = [...recentActivity, ...createdActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Calculate category distribution
  const categoryCount: Record<string, number> = {};
  userCollections.forEach(collection => {
    collection.tags.forEach(tag => {
      const category = tag.charAt(0).toUpperCase() + tag.slice(1);
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top performing collections
  const topCollections = userCollections
    .sort((a, b) => b.stats.views - a.stats.views)
    .slice(0, 5)
    .map(collection => ({
      id: collection.id,
      name: collection.name,
      views: collection.stats.views,
      likes: collection.stats.likes,
      bookmarks: collection.stats.bookmarkCount,
      growth: Math.floor(Math.random() * 50) - 10 // Mock growth percentage
    }));

  // Engagement metrics
  const averageViewsPerCollection = totalCollections > 0 ? Math.round(totalViews / totalCollections) : 0;
  const averageLikesPerCollection = totalCollections > 0 ? Math.round(totalLikes / totalCollections * 10) / 10 : 0;
  const engagementRate = totalViews > 0 ? Math.round((totalLikes / totalViews) * 100 * 10) / 10 : 0;
  const publicCollectionPercentage = totalCollections > 0 
    ? Math.round((userCollections.filter(c => c.isPublic).length / totalCollections) * 100) 
    : 0;

  return {
    totalCollections,
    totalBookmarks,
    totalViews,
    totalLikes,
    averageBookmarksPerCollection,
    mostPopularCollection,
    recentActivity: allActivity,
    viewsOverTime: generateTimeSeriesData(7),
    topCategories,
    topCollections,
    engagementMetrics: {
      averageViewsPerCollection,
      averageLikesPerCollection,
      engagementRate,
      publicCollectionPercentage
    }
  };
}

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const collectionId = searchParams.get('collection_id');
    const timeRange = searchParams.get('time_range') || '7d';

    console.log('Fetching analytics:', { userId, collectionId, timeRange });

    if (collectionId) {
      // Get analytics for specific collection
      const collections = await readCollections();
      const collection = collections.find(c => c.id === collectionId);

      if (!collection) {
        return NextResponse.json(
          { error: 'Collection not found', success: false },
          { status: 404 }
        );
      }

      // Generate detailed analytics for the specific collection
      const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
      const detailedAnalytics = {
        collection,
        viewsOverTime: generateTimeSeriesData(days),
        likesOverTime: generateTimeSeriesData(days).map(d => ({ 
          ...d, 
          likes: Math.floor(d.views * 0.1) 
        })),
        topBookmarks: collection.bookmarks.slice(0, 5).map((id, index) => ({
          id,
          title: `Bookmark ${index + 1}`,
          views: Math.floor(Math.random() * 100) + 10,
          clicks: Math.floor(Math.random() * 50) + 5,
          url: `https://example.com/bookmark-${index + 1}`
        })),
        demographics: {
          topCountries: [
            { country: 'United States', views: Math.floor(collection.stats.views * 0.4) },
            { country: 'United Kingdom', views: Math.floor(collection.stats.views * 0.2) },
            { country: 'Canada', views: Math.floor(collection.stats.views * 0.15) },
            { country: 'Germany', views: Math.floor(collection.stats.views * 0.1) },
            { country: 'France', views: Math.floor(collection.stats.views * 0.1) }
          ]
        },
        referrers: [
          { source: 'Direct', views: Math.floor(collection.stats.views * 0.5) },
          { source: 'Google', views: Math.floor(collection.stats.views * 0.3) },
          { source: 'Twitter', views: Math.floor(collection.stats.views * 0.1) },
          { source: 'LinkedIn', views: Math.floor(collection.stats.views * 0.1) }
        ]
      };

      return NextResponse.json({
        analytics: detailedAnalytics,
        success: true
      });
    }

    // Get overall analytics
    const analytics = await calculateAnalytics(userId || undefined);

    console.log('Analytics calculated successfully');

    return NextResponse.json({
      analytics,
      success: true
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', success: false },
      { status: 500 }
    );
  }
}

// POST - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      collectionId,
      eventType, // 'view', 'like', 'share', 'bookmark_click'
      userId,
      metadata = {}
    } = body;

    console.log('Tracking analytics event:', { collectionId, eventType, userId });

    if (!collectionId || !eventType) {
      return NextResponse.json(
        { error: 'Collection ID and event type are required', success: false },
        { status: 400 }
      );
    }

    // Read collections and update stats
    const collections = await readCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      return NextResponse.json(
        { error: 'Collection not found', success: false },
        { status: 404 }
      );
    }

    const collection = collections[collectionIndex];

    // Update stats based on event type
    switch (eventType) {
      case 'view':
        collection.stats.views += 1;
        break;
      case 'like':
        collection.stats.likes += 1;
        break;
      case 'unlike':
        collection.stats.likes = Math.max(0, collection.stats.likes - 1);
        break;
    }

    collection.stats.lastActivity = new Date().toISOString();
    collections[collectionIndex] = collection;

    await fs.writeFile(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));

    // Store detailed analytics event (in a real app, this might go to a separate analytics service)
    const analyticsEvent = {
      id: `event-${Date.now()}`,
      collectionId,
      eventType,
      userId,
      timestamp: new Date().toISOString(),
      metadata
    };

    console.log('Analytics event tracked:', analyticsEvent.id);

    return NextResponse.json({
      event: analyticsEvent,
      updatedStats: collection.stats,
      success: true
    });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics event', success: false },
      { status: 500 }
    );
  }
}

// PUT - Update analytics settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, settings } = body;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('Updating analytics settings for collection:', collectionId, settings);

    // In a real app, this would update analytics configuration
    // For now, we'll just acknowledge the request

    return NextResponse.json({
      message: 'Analytics settings updated successfully',
      settings,
      success: true
    });
  } catch (error) {
    console.error('Error updating analytics settings:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics settings', success: false },
      { status: 500 }
    );
  }
} 