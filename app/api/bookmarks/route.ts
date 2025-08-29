import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Import AI analysis service
import { contentAnalysisService, performAIAnalysis } from '../../../apps/web/lib/ai/content-analysis';

// Hybrid storage configuration - Supabase for lightweight data, file storage for heavy assets
const BOOKMARKS_FILE = join(process.cwd(), 'data', 'bookmarks.json');
const USE_SUPABASE = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')
);
const USE_FILES_FALLBACK = !USE_SUPABASE;

// Initialize Supabase client with service role (bypasses RLS)
const supabase = USE_SUPABASE ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

console.log('🔧 Hybrid Storage Configuration:');
console.log('📊 USE_SUPABASE:', USE_SUPABASE);
console.log('📁 USE_FILES_FALLBACK:', USE_FILES_FALLBACK);
console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags?: string[];
  ai_summary?: string;
  ai_tags?: string[];
  ai_category?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

function isValidUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Load bookmarks from Supabase (preferred) or file fallback
async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    if (USE_SUPABASE && supabase) {
      console.log('📊 Loading bookmarks from Supabase...');
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        // If table doesn't exist, create it
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('📋 Table does not exist, will be created on first insert');
          return [];
        }
        throw error;
      }

      console.log('📋 Loaded', data?.length || 0, 'bookmarks from Supabase');
      return (data as Bookmark[]) || [];
    } else if (USE_FILES_FALLBACK) {
      console.log('📁 Loading bookmarks from file (development fallback):', BOOKMARKS_FILE);
      await ensureDataDirectory();
      if (!existsSync(BOOKMARKS_FILE)) {
        console.log('❌ Bookmarks file does not exist:', BOOKMARKS_FILE);
        return [];
      }
      const data = await readFile(BOOKMARKS_FILE, 'utf-8');
      const parsed = JSON.parse(data) as Bookmark[];
      console.log('📋 Parsed bookmarks count:', parsed.length);
      return parsed;
    } else {
      console.error('❌ No storage method available');
      return [];
    }
  } catch (error) {
    console.error('❌ Error loading bookmarks:', error);
    return [];
  }
}

// Save bookmarks to Supabase (preferred) or file fallback
async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  try {
    if (USE_FILES_FALLBACK) {
      console.log('📁 Saving bookmarks to file (development fallback):', BOOKMARKS_FILE);
      await ensureDataDirectory();
      await writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
      console.log('✅ Bookmarks saved to file:', BOOKMARKS_FILE);
    }
    // Note: Individual bookmark operations are handled by saveBookmark/deleteBookmark for Supabase
  } catch (error) {
    console.error('❌ Error saving bookmarks:', error);
    throw error;
  }
}

// Save individual bookmark to Supabase
async function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'created_at' | 'updated_at'>): Promise<Bookmark> {
  if (USE_SUPABASE && supabase) {
    console.log('📊 Saving bookmark to Supabase:', bookmark.title);
    const { data, error } = await supabase
      .from('bookmarks')
      .insert([{
        ...bookmark,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase save error:', error);
      throw error;
    }

    console.log('✅ Bookmark saved to Supabase:', data.id);
    return data as Bookmark;
  } else {
    throw new Error('Supabase not available for saving individual bookmarks');
  }
}

// Update bookmark in Supabase
async function updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark> {
  if (USE_SUPABASE && supabase) {
    console.log('📊 Updating bookmark in Supabase:', id);
    const { data, error } = await supabase
      .from('bookmarks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase update error:', error);
      throw error;
    }

    console.log('✅ Bookmark updated in Supabase:', data.id);
    return data as Bookmark;
  } else {
    throw new Error('Supabase not available for updating bookmarks');
  }
}

// Delete bookmark from Supabase
async function deleteBookmarkById(id: string, userId: string): Promise<boolean> {
  if (USE_SUPABASE && supabase) {
    console.log('📊 Deleting bookmark from Supabase:', id);
    const { error, data } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('❌ Supabase delete error:', error);
      throw error;
    }

    const deletedCount = Array.isArray(data) ? data.length : 0;
    const success = deletedCount > 0;
    console.log(success ? '✅ Bookmark deleted from Supabase:' : '⚠️ Bookmark not found in Supabase:', id);
    return success;
  } else {
    throw new Error('Supabase not available for deleting bookmarks');
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user_id from query params
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('user_id') || 'dev-user-123';
    if (USE_SUPABASE && !isValidUuid(userId)) {
      const fallback = process.env.DEFAULT_SUPABASE_USER_ID;
      if (fallback && isValidUuid(fallback)) {
        userId = fallback;
      } else {
        return NextResponse.json(
          { error: 'Invalid user_id. Provide a valid UUID in query or set DEFAULT_SUPABASE_USER_ID.' },
          { status: 400 }
        );
      }
    }

    if (USE_SUPABASE && supabase) {
      console.log('📖 Fetching bookmarks from Supabase...');
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to load bookmarks', details: error.message },
          { status: 500 }
        );
      }

      const transformedBookmarks = (data || []).map((bookmark: any) => ({
        id: bookmark.id,
        title: bookmark.title || 'UNTITLED',
        url: bookmark.url,
        description: bookmark.description || 'No description available',
        category: bookmark.category || 'General',
        tags: bookmark.tags || [],
        priority: 'medium',
        isFavorite: false,
        visits: 0,
        lastVisited: bookmark.updated_at ? new Date(bookmark.updated_at).toLocaleDateString() : '',
        dateAdded: bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : '',
        favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
        screenshot: "/placeholder.svg",
        circularImage: "/placeholder.svg",
        logo: "",
        notes: bookmark.notes || 'No notes',
        timeSpent: '0m',
        weeklyVisits: 0,
        siteHealth: 'good',
        project: {
          name: bookmark.ai_category || 'GENERAL',
          progress: 0,
          status: 'Active'
        }
      }));

      return NextResponse.json({
        success: true,
        bookmarks: transformedBookmarks,
        total: transformedBookmarks.length
      });
    }

    console.log('📖 Fetching bookmarks from file storage (fallback)...');
    // Load bookmarks from file
    const allBookmarks = await loadBookmarks();
    // Filter bookmarks by user ID
    const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);

    const transformedBookmarks = userBookmarks.map((bookmark) => ({
      id: bookmark.id,
      title: bookmark.title || 'UNTITLED',
      url: bookmark.url,
      description: bookmark.description || 'No description available',
      category: bookmark.category || 'General',
      tags: bookmark.tags || [],
      priority: 'medium',
      isFavorite: false,
      visits: 0,
      lastVisited: new Date(bookmark.created_at).toLocaleDateString(),
      dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
      favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
      screenshot: "/placeholder.svg",
      circularImage: "/placeholder.svg",
      logo: "",
      notes: bookmark.notes || 'No notes',
      timeSpent: '0m',
      weeklyVisits: 0,
      siteHealth: 'good',
      project: {
        name: bookmark.ai_category || 'GENERAL',
        progress: 0,
        status: 'Active'
      }
    }));

    return NextResponse.json({
      success: true,
      bookmarks: transformedBookmarks,
      total: transformedBookmarks.length
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to perform AI analysis - REMOVED

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, 
      title, 
      url, 
      description, 
      category, 
      tags, 
      ai_summary, 
      ai_tags, 
      ai_category, 
      notes,
      user_id: bodyUserId,
      enableAI = true  // New flag to enable/disable AI analysis
    } = body;
    
    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }
    
    // Determine userId
    let userId = bodyUserId || process.env.DEFAULT_SUPABASE_USER_ID || process.env.DEV_USER_ID || 'dev-user-123';
    if (USE_SUPABASE && !isValidUuid(userId)) {
      return NextResponse.json(
        { error: 'Invalid user_id. Provide a valid UUID in body.user_id or set DEFAULT_SUPABASE_USER_ID.' },
        { status: 400 }
      );
    }
    
    // Perform AI analysis if enabled
    let aiAnalysis = {
      ai_summary: ai_summary || '',
      ai_tags: ai_tags || [],
      ai_category: ai_category || category || 'General',
      ai_notes: notes || '',
      description: description || ''
    };
    
    if (enableAI && (!ai_summary || !ai_tags || ai_tags.length === 0)) {
      console.log('🤖 Performing AI analysis for bookmark...');
      aiAnalysis = await performAIAnalysis(url, title, description);
    }
    
    if (USE_SUPABASE && supabase) {
      // SUPABASE STORAGE - preferred for production
      if (id) {
        // UPDATE existing bookmark in Supabase
        console.log('📝 Updating bookmark in Supabase for user:', userId);
        
        const updatedBookmark = await updateBookmark(id, {
          title,
          url,
          description: aiAnalysis.description,
          category: aiAnalysis.ai_category,
          tags: aiAnalysis.ai_tags,
          ai_summary: aiAnalysis.ai_summary,
          ai_tags: aiAnalysis.ai_tags,
          ai_category: aiAnalysis.ai_category,
          notes: aiAnalysis.ai_notes
        });
        
        console.log('✅ Successfully updated bookmark in Supabase:', updatedBookmark.id);
        
        return NextResponse.json({
          success: true,
          bookmark: updatedBookmark,
          message: 'Bookmark updated successfully',
          aiAnalysis: enableAI ? {
            category: updatedBookmark.ai_category,
            tags: updatedBookmark.ai_tags,
            summary: updatedBookmark.ai_summary,
            notes: updatedBookmark.notes
          } : undefined
        });
        
      } else {
        // CREATE new bookmark in Supabase
        console.log('📝 Creating bookmark in Supabase for user:', userId);
        
        const newBookmark = await saveBookmark({
          user_id: userId,
          title,
          url,
          description: aiAnalysis.description,
          category: aiAnalysis.ai_category,
          tags: aiAnalysis.ai_tags,
          ai_summary: aiAnalysis.ai_summary,
          ai_tags: aiAnalysis.ai_tags,
          ai_category: aiAnalysis.ai_category,
          notes: aiAnalysis.ai_notes
        });
        
        console.log('✅ Successfully created bookmark in Supabase:', newBookmark.id);
        
        return NextResponse.json({
          success: true,
          bookmark: newBookmark,
          message: 'Bookmark created successfully',
          aiAnalysis: enableAI ? {
            category: newBookmark.ai_category,
            tags: newBookmark.ai_tags,
            summary: newBookmark.ai_summary,
            notes: newBookmark.notes
          } : undefined
        });
      }
      
    } else if (USE_FILES_FALLBACK) {
      // FILE STORAGE FALLBACK - for development
      console.log('📁 Using file storage fallback for development...');
      
      // Load existing bookmarks
      const allBookmarks = await loadBookmarks();
      
      if (id) {
        // UPDATE existing bookmark in file
        console.log('📝 Updating bookmark in file storage for user:', userId);
        
        const bookmarkIndex = allBookmarks.findIndex(b => b.id === id && b.user_id === userId);
        
        if (bookmarkIndex === -1) {
          return NextResponse.json(
            { error: 'Bookmark not found' },
            { status: 404 }
          );
        }
        
        // Update existing bookmark
        allBookmarks[bookmarkIndex] = {
          ...allBookmarks[bookmarkIndex],
          title,
          url,
          description: aiAnalysis.description,
          category: aiAnalysis.ai_category,
          tags: aiAnalysis.ai_tags,
          ai_summary: aiAnalysis.ai_summary,
          ai_tags: aiAnalysis.ai_tags,
          ai_category: aiAnalysis.ai_category,
          notes: aiAnalysis.ai_notes,
          updated_at: new Date().toISOString()
        };
        
        // Save to file
        await saveBookmarks(allBookmarks);
        
        console.log('✅ Successfully updated bookmark in file:', allBookmarks[bookmarkIndex].id);
        
        return NextResponse.json({
          success: true,
          bookmark: allBookmarks[bookmarkIndex],
          message: 'Bookmark updated successfully',
          aiAnalysis: enableAI ? {
            category: allBookmarks[bookmarkIndex].ai_category,
            tags: allBookmarks[bookmarkIndex].ai_tags,
            summary: allBookmarks[bookmarkIndex].ai_summary,
            notes: allBookmarks[bookmarkIndex].notes
          } : undefined
        });
        
      } else {
        // CREATE new bookmark in file
        console.log('📝 Creating bookmark in file storage for user:', userId);
        
        // Generate new ID (UUID for consistency with Supabase)
        const newId = crypto.randomUUID();
        
        // Create new bookmark with AI analysis
        const newBookmark: Bookmark = {
          id: newId,
          user_id: userId,
          title,
          url,
          description: aiAnalysis.description,
          category: aiAnalysis.ai_category,
          tags: aiAnalysis.ai_tags,
          ai_summary: aiAnalysis.ai_summary,
          ai_tags: aiAnalysis.ai_tags,
          ai_category: aiAnalysis.ai_category,
          notes: aiAnalysis.ai_notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to bookmarks array
        allBookmarks.push(newBookmark);
        
        // Save to file
        await saveBookmarks(allBookmarks);
        
        console.log('✅ Successfully created bookmark in file:', newBookmark.id);
        
        return NextResponse.json({
          success: true,
          bookmark: newBookmark,
          message: 'Bookmark created successfully',
          aiAnalysis: enableAI ? {
            category: newBookmark.ai_category,
            tags: newBookmark.ai_tags,
            summary: newBookmark.ai_summary,
            notes: newBookmark.notes
          } : undefined
        });
      }
      
    } else {
      // NO STORAGE METHOD AVAILABLE
      return NextResponse.json(
        { error: 'No storage method available' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('id');
    const userId = searchParams.get('user_id') || 'dev-user-123';
    
    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`🗑️ Deleting bookmark ${bookmarkId} for user ${userId}`);
    
    if (USE_SUPABASE && supabase) {
      // DELETE from Supabase - preferred for production
      console.log('📊 Deleting bookmark from Supabase...');
      
      const success = await deleteBookmarkById(bookmarkId, userId);
      
      if (success) {
        console.log('✅ Successfully deleted bookmark from Supabase:', bookmarkId);
        
        return NextResponse.json({
          success: true,
          message: 'Bookmark deleted successfully'
        });
      } else {
        return NextResponse.json(
          { error: 'Bookmark not found or already deleted' },
          { status: 404 }
        );
      }
      
    } else if (USE_FILES_FALLBACK) {
      // DELETE from file storage - fallback for development
      console.log('📁 Deleting bookmark from file storage...');
      
      // Load existing bookmarks
      const allBookmarks = await loadBookmarks();
      
      // Find bookmark to delete
      const bookmarkToDelete = allBookmarks.find(b => b.id === bookmarkId && b.user_id === userId);
      
      if (!bookmarkToDelete) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }
      
      // Remove bookmark from array
      const updatedBookmarks = allBookmarks.filter(b => !(b.id === bookmarkId && b.user_id === userId));
      
      // Save updated bookmarks to file
      await saveBookmarks(updatedBookmarks);
      
      console.log(`✅ Successfully deleted bookmark from file: ${bookmarkToDelete.title}`);
      
      return NextResponse.json({
        success: true,
        message: 'Bookmark deleted successfully'
      });
      
    } else {
      // NO STORAGE METHOD AVAILABLE
      return NextResponse.json(
        { error: 'No storage method available' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 