import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// File-based storage types and helper functions
interface Bookmark {
  id: number;
  user_id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  priority?: 'low' | 'medium' | 'high';
  ai_summary: string;
  ai_tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  visits?: number;
  visit_count?: number;
  time_spent?: number;
  reading_time_minutes?: number;
  session_count?: number;
  last_visited_at?: string;
  site_health?: 'healthy' | 'warning' | 'broken';
  last_health_check?: string;
  healthCheckCount?: number;
  customBackground?: string;
  relatedBookmarks?: number[];
}

const BOOKMARKS_FILE = path.join(process.cwd(), 'data', 'bookmarks.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(BOOKMARKS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load bookmarks from file
async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    console.log('📁 Bookmarks file path:', BOOKMARKS_FILE);
    await ensureDataDirectory();
    const data = await fs.readFile(BOOKMARKS_FILE, 'utf-8');
    console.log('📄 Raw file data length:', data.length);
    const parsed = JSON.parse(data) as Bookmark[];
    console.log('📋 Parsed bookmarks count:', parsed.length);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading bookmarks:', error);
    return [];
  }
}

// Save bookmarks to file
async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
    console.log('✅ Successfully saved bookmarks to file');
  } catch (error) {
    console.error('❌ Error saving bookmarks:', error);
    throw error;
  }
}

// POST /api/bookmarks/bulk - Bulk operations on bookmarks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, bookmarkIds, userId } = body;

    // Validate input
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    if (!bookmarkIds || !Array.isArray(bookmarkIds) || bookmarkIds.length === 0) {
      return NextResponse.json(
        { error: 'Bookmark IDs array is required' },
        { status: 400 }
      );
    }

    const userIdToUse = userId || 'dev-user-123';

    console.log(`🔄 Bulk ${action} operation for user ${userIdToUse} on ${bookmarkIds.length} bookmarks`);

    // Load existing bookmarks
    const allBookmarks = await loadBookmarks();

    switch (action) {
      case 'delete':
        return await handleBulkDelete(allBookmarks, bookmarkIds, userIdToUse);
      
      case 'move':
        const { category } = body;
        return await handleBulkMove(allBookmarks, bookmarkIds, userIdToUse, category);
      
      case 'tag':
        const { tags, tagAction } = body; // tagAction: 'add' | 'remove' | 'replace'
        return await handleBulkTag(allBookmarks, bookmarkIds, userIdToUse, tags, tagAction);
      
      default:
        return NextResponse.json(
          { error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Handle bulk delete operation
async function handleBulkDelete(allBookmarks: Bookmark[], bookmarkIds: number[], userId: string) {
  console.log(`🗑️ Bulk deleting ${bookmarkIds.length} bookmarks for user ${userId}`);

  // Find bookmarks to delete (ensure they belong to the user)
  const bookmarksToDelete = allBookmarks.filter(bookmark => 
    bookmarkIds.includes(bookmark.id) && bookmark.user_id === userId
  );

  if (bookmarksToDelete.length === 0) {
    return NextResponse.json(
      { error: 'No bookmarks found to delete' },
      { status: 404 }
    );
  }

  // Remove bookmarks from array
  const updatedBookmarks = allBookmarks.filter(bookmark => 
    !(bookmarkIds.includes(bookmark.id) && bookmark.user_id === userId)
  );

  // Save updated bookmarks
  await saveBookmarks(updatedBookmarks);

  const deletedTitles = bookmarksToDelete.map(b => b.title);
  console.log(`✅ Successfully deleted ${bookmarksToDelete.length} bookmarks:`, deletedTitles);

  return NextResponse.json({
    success: true,
    message: `Successfully deleted ${bookmarksToDelete.length} bookmarks`,
    deletedCount: bookmarksToDelete.length,
    deletedBookmarks: deletedTitles
  });
}

// Handle bulk move operation (change category)
async function handleBulkMove(allBookmarks: Bookmark[], bookmarkIds: number[], userId: string, newCategory: string) {
  if (!newCategory) {
    return NextResponse.json(
      { error: 'Category is required for move operation' },
      { status: 400 }
    );
  }

  console.log(`📁 Bulk moving ${bookmarkIds.length} bookmarks to category "${newCategory}" for user ${userId}`);

  let updatedCount = 0;
  const updatedBookmarks = allBookmarks.map(bookmark => {
    if (bookmarkIds.includes(bookmark.id) && bookmark.user_id === userId) {
      updatedCount++;
      return {
        ...bookmark,
        category: newCategory,
        updated_at: new Date().toISOString()
      };
    }
    return bookmark;
  });

  if (updatedCount === 0) {
    return NextResponse.json(
      { error: 'No bookmarks found to move' },
      { status: 404 }
    );
  }

  await saveBookmarks(updatedBookmarks);

  console.log(`✅ Successfully moved ${updatedCount} bookmarks to category "${newCategory}"`);

  return NextResponse.json({
    success: true,
    message: `Successfully moved ${updatedCount} bookmarks to "${newCategory}"`,
    updatedCount,
    newCategory
  });
}

// Handle bulk tag operation
async function handleBulkTag(allBookmarks: Bookmark[], bookmarkIds: number[], userId: string, tags: string[], tagAction: 'add' | 'remove' | 'replace') {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return NextResponse.json(
      { error: 'Tags array is required for tag operation' },
      { status: 400 }
    );
  }

  if (!['add', 'remove', 'replace'].includes(tagAction)) {
    return NextResponse.json(
      { error: 'Tag action must be "add", "remove", or "replace"' },
      { status: 400 }
    );
  }

  console.log(`🏷️ Bulk ${tagAction} tags ${JSON.stringify(tags)} for ${bookmarkIds.length} bookmarks for user ${userId}`);

  let updatedCount = 0;
  const updatedBookmarks = allBookmarks.map(bookmark => {
    if (bookmarkIds.includes(bookmark.id) && bookmark.user_id === userId) {
      updatedCount++;
      let newTags = [...bookmark.tags];

      switch (tagAction) {
        case 'add':
          // Add new tags, avoiding duplicates
          newTags = [...new Set([...newTags, ...tags])];
          break;
        case 'remove':
          // Remove specified tags
          newTags = newTags.filter(tag => !tags.includes(tag));
          break;
        case 'replace':
          // Replace all tags with new ones
          newTags = [...tags];
          break;
      }

      return {
        ...bookmark,
        tags: newTags,
        updated_at: new Date().toISOString()
      };
    }
    return bookmark;
  });

  if (updatedCount === 0) {
    return NextResponse.json(
      { error: 'No bookmarks found to update tags' },
      { status: 404 }
    );
  }

  await saveBookmarks(updatedBookmarks);

  console.log(`✅ Successfully ${tagAction}ed tags for ${updatedCount} bookmarks`);

  return NextResponse.json({
    success: true,
    message: `Successfully ${tagAction}ed tags for ${updatedCount} bookmarks`,
    updatedCount,
    tagAction,
    tags
  });
} 