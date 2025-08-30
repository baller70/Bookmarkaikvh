import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { authenticateUser } from '@/lib/auth-utils';
import { contentAnalysisService } from '@/lib/ai/content-analysis';
import { createClient } from '@supabase/supabase-js';

// Storage configuration - Supabase first, file fallback for development/testing
const BOOKMARKS_FILE = join(process.cwd(), 'data', 'bookmarks.json');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const USE_SUPABASE = !!(
  supabaseUrl && 
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder')
);
const USE_FILES_FALLBACK = !USE_SUPABASE;

// Initialize Supabase client
const supabase = USE_SUPABASE ? createClient(
  supabaseUrl!,
  supabaseKey!
) : null;

console.log('🔧 Storage Configuration:');
console.log('📊 USE_SUPABASE:', USE_SUPABASE);
console.log('📁 USE_FILES_FALLBACK:', USE_FILES_FALLBACK);
console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

interface Bookmark {
  id: number;
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
  site_health?: 'excellent' | 'working' | 'fair' | 'poor' | 'broken';
  last_health_check?: string;
  healthCheckCount?: number;
  customBackground?: string;
  visits?: number;
  time_spent?: number;
  relatedBookmarks?: number[];
}

// Ensure data directory exists (fallback only)
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

// Save bookmarks to file (development fallback only)
async function saveBookmarksToFile(bookmarks: Bookmark[]): Promise<void> {
  if (USE_FILES_FALLBACK) {
    try {
      await ensureDataDirectory();
      await writeFile(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2));
      console.log('✅ Bookmarks file updated (development fallback)');
    } catch (error) {
      console.error('❌ Error saving bookmarks to file:', error);
      throw error;
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📖 Fetching bookmarks...');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const allCategories = searchParams.get('all_categories') === 'true';
    
    // Per user instruction, always use the bypass ID for testing.
    const userId = '00000000-0000-0000-0000-000000000001';
    console.log(`[API OVERRIDE] Forcing userId to dev bypass: ${userId}`);
    
    // Load bookmarks directly from Supabase for the hardcoded dev user
    if (USE_SUPABASE && supabase) {
      const { data: userBookmarks, error } = await supabase
        .from('bookmarks')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase error fetching user bookmarks:', error);
        throw error;
      }
      
      console.log(`🎯 Found ${userBookmarks.length} bookmarks for user ${userId}`);
      
      // If requesting all categories, we need to adjust the logic
      if (allCategories) {
        const { data: allBookmarksForCategories, error: catError } = await supabase
          .from('bookmarks')
          .select('category');
        
        if(catError) {
          console.error('❌ Supabase error fetching categories:', catError);
        }

        const uniqueCategories = [...new Set(allBookmarksForCategories?.map(b => b.category).filter(Boolean))].sort();
        return NextResponse.json({
          success: true,
          categories: uniqueCategories,
          total: uniqueCategories.length
        });
      }

      const transformedBookmarks = userBookmarks.map((bookmark: any) => ({
        id: bookmark.id,
        title: bookmark.title?.toUpperCase() || 'UNTITLED',
        url: bookmark.url,
        description: bookmark.description || bookmark.ai_summary || 'No description available',
        category: bookmark.category || bookmark.ai_category || 'General',
        tags: bookmark.tags || bookmark.ai_tags || [],
        priority: 'medium',
        isFavorite: false,
        visits: bookmark.visits || 0,
        lastVisited: bookmark.visits > 0 ? new Date(bookmark.created_at).toLocaleDateString() : 'Never',
        dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
        favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
        screenshot: "/placeholder.svg",
        circularImage: "/placeholder.svg",
        logo: "",
        notes: bookmark.notes || 'No notes',
        timeSpent: bookmark.time_spent ? `${bookmark.time_spent}m` : '0m',
        weeklyVisits: 0,
        siteHealth: bookmark.site_health || 'unknown',
        site_health: bookmark.site_health || 'unknown',
        healthCheckCount: bookmark.healthCheckCount || 0,
        last_health_check: bookmark.last_health_check,
        customBackground: bookmark.customBackground,
        project: {
          name: bookmark.ai_category || bookmark.category || "GENERAL",
          progress: 0,
          status: "Active"
        },
        relatedBookmarks: bookmark.relatedBookmarks || [],
        ai_summary: bookmark.ai_summary || null,
        ai_tags: bookmark.ai_tags || [],
        ai_category: bookmark.ai_category || null,
      }));

      return NextResponse.json({
        success: true,
        bookmarks: transformedBookmarks,
        total: transformedBookmarks.length
      });

    } else if (USE_FILES_FALLBACK) {
      // Keep file fallback logic for local development
      const allBookmarks = await loadBookmarks();
      const userBookmarks = allBookmarks.filter(bookmark => bookmark.user_id === userId);
      
      // If requesting all categories, return unique categories from all users
      if (allCategories) {
        const uniqueCategories = [...new Set(allBookmarks.map(b => b.category).filter(Boolean))].sort();
        console.log(`📁 Found ${uniqueCategories.length} unique categories:`, uniqueCategories);
        
        return NextResponse.json({
          success: true,
          categories: uniqueCategories,
          total: uniqueCategories.length
        });
      }
      
      // Transform bookmarks to match frontend format
      const transformedBookmarks = userBookmarks.map((bookmark) => ({
        id: bookmark.id,
        title: bookmark.title?.toUpperCase() || 'UNTITLED',
        url: bookmark.url,
        description: (bookmark as any).description || (bookmark as any).ai_summary || 'No description available',
        category: (bookmark as any).category || (bookmark as any).ai_category || 'General',
        tags: (bookmark as any).tags || (bookmark as any).ai_tags || [],
        priority: 'medium',
        isFavorite: false,
        visits: (bookmark as any).visits || 0,
        lastVisited: (bookmark as any).visits > 0 ? new Date(bookmark.created_at).toLocaleDateString() : 'Never',
        dateAdded: new Date(bookmark.created_at).toLocaleDateString(),
        favicon: bookmark.title?.charAt(0)?.toUpperCase() || 'B',
        screenshot: "/placeholder.svg",
        circularImage: "/placeholder.svg",
        logo: "",
        notes: (bookmark as any).notes || 'No notes',
        timeSpent: (bookmark as any).time_spent ? `${(bookmark as any).time_spent}m` : '0m',
        weeklyVisits: 0,
        siteHealth: (bookmark as any).site_health || 'unknown',
        site_health: (bookmark as any).site_health || 'unknown',
        healthCheckCount: (bookmark as any).healthCheckCount || 0,
        last_health_check: (bookmark as any).last_health_check,
        customBackground: (bookmark as any).customBackground,
        project: {
          name: (bookmark as any).ai_category || (bookmark as any).category || "GENERAL",
          progress: 0,
          status: "Active"
        },
        relatedBookmarks: (bookmark as any).relatedBookmarks || []
      })).map((b) => ({
        ...b,
        ai_summary: (userBookmarks.find((ub:any)=>String(ub.id)===String(b.id)) as any)?.ai_summary || null,
        ai_tags: (userBookmarks.find((ub:any)=>String(ub.id)===String(b.id)) as any)?.ai_tags || [],
        ai_category: (userBookmarks.find((ub:any)=>String(ub.id)===String(b.id)) as any)?.ai_category || null,
      }));
      
      return NextResponse.json({
        success: true,
        bookmarks: transformedBookmarks,
        total: transformedBookmarks.length
      });
    }

    // This part should not be reached if Supabase or file fallback is used
    return NextResponse.json({ error: 'No storage method configured' }, { status: 500 });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/bookmarks - Starting request processing');
    
    // Per user instruction, always use the bypass ID for testing (same as GET).
    const userId = '00000000-0000-0000-0000-000000000001';
    console.log(`[API OVERRIDE] Forcing userId to dev bypass: ${userId}`);
    
    console.log('📦 Parsing request body...');
    const body = await request.json();
    console.log('📦 Request body parsed successfully:', JSON.stringify(body, null, 2));
    let { id, title, url, description, category, tags, ai_summary, ai_tags, ai_category, notes, customBackground, relatedBookmarks, enableAI = true } = body;
    
    // AI WORKAROUND for broken UI: If title is missing but AI is on, generate title from content.
    if (enableAI && url && !title) {
      console.log('🤖 UI Workaround: Title is missing. Generating title from URL content via AI analysis.');
      try {
        const result = await contentAnalysisService.analyzeContent({ url, title, description, userId });
        ai_summary = result.aiSummary;
        ai_tags = result.aiTags;
        ai_category = result.aiCategory;
        
        // Use the summary as the title, truncated to a reasonable length
        title = ai_summary?.substring(0, 100) || 'Untitled Bookmark';
        console.log(`🤖 Generated Title: ${title}`);
      } catch (e) {
        console.warn('AI analysis for title generation failed:', (e as Error).message);
        // Fallback title if AI fails
        try {
          const urlObject = new URL(url);
          title = urlObject.hostname.replace('www.', '');
        } catch {
          title = 'Untitled Bookmark';
        }
      }
    }

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Storage check - USE_SUPABASE:', USE_SUPABASE, 'supabase client:', !!supabase);
    
    if (USE_SUPABASE && supabase) {
      console.log('✅ Using Supabase for bookmark operations');
      // Use Supabase for all operations
      if (id) {
        // UPDATE existing bookmark
        console.log('📝 Updating bookmark in Supabase for user:', userId, 'ID:', id);

        const { data, error } = await supabase
          .from('bookmarks')
          .update({
            title,
            url,
            description: description || ai_summary || '',
            category: ai_category || category || 'General',
            tags: tags || ai_tags || [],
            ai_summary,
            ai_tags: ai_tags || [],
            ai_category,
            notes: notes || '',
            customBackground,
            relatedBookmarks: relatedBookmarks || [],
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', userId)
          .select('*')
          .single();

        if (error) {
          console.error('❌ Supabase update error:', error);
          return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
        }

        console.log('✅ Successfully updated bookmark (Supabase):', data);
        return NextResponse.json({ success: true, bookmark: data, message: 'Bookmark updated successfully' });
      } else {
        // CREATE new bookmark
        console.log('📝 Creating bookmark in Supabase for user:', userId);

        // For production testing, we'll insert bookmarks without user_id to avoid foreign key constraint
        // This allows testing without requiring full Supabase auth setup
        console.log('⚠️ Note: Creating bookmark without user_id to avoid foreign key constraint (test mode)');

        // Optional AI analysis
        let ai = { summary: ai_summary, tags: ai_tags, category: ai_category } as { summary?: string; tags?: string[]; category?: string };
        if (enableAI && (!ai_summary || !ai_tags || ai_tags?.length === 0)) {
          try {
            const result = await contentAnalysisService.analyzeContent({ url, title, description, userId });
            ai = { summary: result.aiSummary, tags: result.aiTags, category: result.aiCategory };
          } catch (e) {
            console.warn('AI analysis failed, falling back:', (e as Error).message);
            ai = { summary: description || '', tags: tags || [], category: category || 'General' };
          }
        }

        // Only use columns that actually exist in the Supabase bookmarks table
        // Store under the dev/testing user so reads include it
        const insertPayload = {
          user_id: userId,
          title,
          url,
          description: description || ai.summary || '',
          ai_summary: ai.summary || null,
          ai_tags: ai.tags || [],
          ai_category: ai.category || null,
          category: category || ai.category || 'General',
          // folder_id can be null for now since it's optional
          folder_id: null
        };

        let insertResult = await supabase
          .from('bookmarks')
          .insert(insertPayload)
          .select('*')
          .single();

        if (insertResult.error) {
          console.error('❌ Supabase insert error:', insertResult.error);

          // If foreign key error due to missing profile, try to seed the dev profile and retry once
          if (insertResult.error.code === '23503' && insertResult.error.message?.includes('bookmarks_user_id_fkey')) {
            console.log('🧩 Seeding dev profile row to satisfy FK, then retrying insert...');
            try {
              const seed = await supabase
                .from('profiles')
                .insert({ id: userId })
                .select('id')
                .single();
              if (seed.error && seed.error.code !== '23505') {
                console.warn('⚠️ Profile seed failed:', seed.error.message);
              } else {
                console.log('✅ Profile seed ensured for user:', userId);
              }
            } catch (e) {
              console.warn('⚠️ Profile seed threw exception:', (e as Error).message);
            }

            // Retry bookmark insert once
            insertResult = await supabase
              .from('bookmarks')
              .insert(insertPayload)
              .select('*')
              .single();
          }
        }

        if (insertResult.error) {
          // As a last-resort dev fallback, insert without user_id to avoid FK (local only)
          if (insertResult.error.code === '23503') {
            const fallbackPayload = { ...insertPayload, user_id: null as any }
            const retryNoUser = await supabase
              .from('bookmarks')
              .insert(fallbackPayload)
              .select('*')
              .single()
            if (!retryNoUser.error) {
              console.log('✅ Created bookmark with null user_id (dev fallback):', retryNoUser.data)
              return NextResponse.json({ success: true, bookmark: retryNoUser.data, message: 'Bookmark created successfully' })
            }
          }
          return NextResponse.json({ error: 'Failed to create bookmark', details: insertResult.error.message }, { status: 500 });
        }

        console.log('✅ Successfully created bookmark (Supabase):', insertResult.data);
        return NextResponse.json({ success: true, bookmark: insertResult.data, message: 'Bookmark created successfully' });
      }
    } else if (USE_FILES_FALLBACK) {
      // File fallback for development only
      const allBookmarks = await loadBookmarks();
      
      if (id) {
        // UPDATE existing bookmark
        const existingBookmark = allBookmarks.find(b => b.id === id && b.user_id === userId);
        if (!existingBookmark) {
          return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
        }
        
        const updatedBookmark: Bookmark = {
          ...existingBookmark,
          title,
          url,
          description: description || '',
          category: category || 'General',
          tags: tags || [],
          ai_summary,
          ai_tags: ai_tags || [],
          ai_category,
          notes: notes || '',
          customBackground,
          relatedBookmarks: relatedBookmarks || [],
          updated_at: new Date().toISOString()
        };

        const bookmarkIndex = allBookmarks.findIndex(b => b.id === updatedBookmark.id);
        if (bookmarkIndex > -1) {
          allBookmarks[bookmarkIndex] = updatedBookmark;
        }
        await saveBookmarksToFile(allBookmarks);
        return NextResponse.json({ success: true, bookmark: updatedBookmark, message: 'Bookmark updated successfully' });
      } else {
        // CREATE new bookmark
        const newId = Math.max(0, ...allBookmarks.map(b => b.id)) + 1;
        const newBookmark: Bookmark = {
          id: newId,
          user_id: userId,
          title,
          url,
          description: description || '',
          category: category || 'General',
          tags: tags || [],
          ai_summary,
          ai_tags: ai_tags || [],
          ai_category,
          notes: notes || '',
          relatedBookmarks: relatedBookmarks || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visits: 0,
          time_spent: 0,
          site_health: 'working' as const,
          healthCheckCount: 0,
          last_health_check: null,
          customBackground
        };

        allBookmarks.push(newBookmark);
        await saveBookmarksToFile(allBookmarks);
        return NextResponse.json({ success: true, bookmark: newBookmark, message: 'Bookmark created successfully' });
      }
    } else {
      console.error('❌ No storage method available - USE_SUPABASE:', USE_SUPABASE, 'USE_FILES_FALLBACK:', USE_FILES_FALLBACK);
      return NextResponse.json({ error: 'No storage method available' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ POST /api/bookmarks - Unexpected error occurred:', error);
    console.error('❌ Error stack:', (error as Error).stack);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
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
    
    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }
    
    // Per user instruction, always use the bypass ID for testing (same as GET).
    const userId = '00000000-0000-0000-0000-000000000001';
    console.log(`[API OVERRIDE] Forcing userId to dev bypass: ${userId}`);
    
    console.log(`🗑️ Deleting bookmark ${bookmarkId} for user ${userId}`);
    
    if (USE_SUPABASE && supabase) {
      // Handle both UUID strings and integer IDs
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        return NextResponse.json({ error: 'Failed to delete bookmark', details: error.message }, { status: 500 });
      }

      console.log(`✅ Successfully deleted bookmark (Supabase): ${bookmarkId}`);
      return NextResponse.json({ success: true, message: 'Bookmark deleted successfully' });
    } else if (USE_FILES_FALLBACK) {
      const allBookmarks = await loadBookmarks();
      
      // Handle both string and number IDs, and include null user_id for testing
      const bookmarkToDelete = allBookmarks.find(b => {
        const idMatch = String(b.id) === String(bookmarkId);
        const userMatch = b.user_id === userId || b.user_id === null;
        return idMatch && userMatch;
      });
      
      if (!bookmarkToDelete) {
        console.log(`❌ Bookmark not found: ID=${bookmarkId}, User=${userId}`);
        return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
      }
      
      const updatedBookmarks = allBookmarks.filter(b => {
        const idMatch = String(b.id) === String(bookmarkId);
        const userMatch = b.user_id === userId || b.user_id === null;
        return !(idMatch && userMatch);
      });
      
      await saveBookmarksToFile(updatedBookmarks);
      console.log(`✅ Successfully deleted bookmark (file): ${bookmarkToDelete.title}`);
      return NextResponse.json({ success: true, message: 'Bookmark deleted successfully' });
    } else {
      return NextResponse.json({ error: 'No storage method available' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}