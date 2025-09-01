import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { authenticateUser } from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001';

// Resolve writable data directory (Vercel allows writes only to /tmp)
const DATA_BASE_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/data' : join(process.cwd(), 'data'))
// Supabase init (if configured)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
const USE_SUPABASE = !!(supabaseUrl && supabaseKey && !supabaseKey.includes('dev-placeholder'))
// Disable file fallback per user request
const DISABLE_FILE_FALLBACK = true
const supabase = USE_SUPABASE ? createClient(supabaseUrl, supabaseKey) : null

// File-based storage for persistent categories
const CATEGORIES_FILE = join(DATA_BASE_DIR, 'categories.json');

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  user_id: string;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = DATA_BASE_DIR
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Load categories from file
async function loadCategories(): Promise<Category[]> {
  try {
    await ensureDataDirectory();
    if (!existsSync(CATEGORIES_FILE)) {
      return [];
    }
    const data = await readFile(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data) as Category[];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

// Save categories to file
async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
}

// Load bookmarks to get actual bookmark counts per category
async function loadBookmarks(): Promise<any[]> {
  try {
    const BOOKMARKS_FILE = join(DATA_BASE_DIR, 'bookmarks.json');
    if (!existsSync(BOOKMARKS_FILE)) {
      return [];
    }
    const data = await readFile(BOOKMARKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    const userId = authResult.success && authResult.userId ? authResult.userId : DEV_USER_ID;
    
    let categoriesWithCounts: any[] = []

    if (USE_SUPABASE && supabase) {
      // Supabase path: categories table + count bookmarks per category
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('id,name,description,color,created_at,updated_at,user_id')
        .or(`user_id.eq.${userId},user_id.is.null`)

      if (catErr) throw new Error(catErr.message)

      // Get bookmarks to count by category manually
      const { data: bookmarks, error: cntErr } = await supabase
        .from('bookmarks')
        .select('category')
        .or(`user_id.eq.${userId},user_id.is.null`)

      if (cntErr) throw new Error(cntErr.message)
      
      // Count bookmarks by category manually
      const countMap = new Map<string, number>()
      if (bookmarks) {
        bookmarks.forEach((bookmark: any) => {
          const category = bookmark.category || 'General'
          countMap.set(category, (countMap.get(category) || 0) + 1)
        })
      }

      // Deduplicate categories by name, preferring user-specific rows over null user_id
      const dedupByName = new Map<string, any>()
      ;(cats || []).forEach((c: any) => {
        const existing = dedupByName.get(c.name)
        if (!existing) {
          dedupByName.set(c.name, c)
        } else {
          // Prefer the entry that has a non-null user_id
          const prefer = existing.user_id ? existing : (c.user_id ? c : existing)
          dedupByName.set(c.name, prefer)
        }
      })

      categoriesWithCounts = Array.from(dedupByName.values()).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        color: c.color || '#3B82F6',
        bookmarkCount: countMap.get(c.name) || 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }))
    } else {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, user_id } = body;

    // Prefer authenticated user; fallback to dev user if missing
    let uid = user_id as string | undefined
    try {
      const auth = await authenticateUser(request)
      if (auth?.success && auth.userId) uid = auth.userId
    } catch {}
    if (!uid) uid = DEV_USER_ID

    // Validate required fields
    if (!name || !uid) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Try Supabase first, then fallback to file storage
    if (USE_SUPABASE && supabase) {
      try {
        const { data: existing, error: existErr } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', uid)
          .ilike('name', name)
          .limit(1)
        if (existErr) throw existErr
        if (existing && existing.length > 0) {
          return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
        }
        // Try insert with user_id, fallback to null if FK constraint fails
        let insertResult = await supabase
          .from('categories')
          .insert([{ user_id: uid, name, description: description || '', color: color || '#3B82F6' }])
          .select('id,name,description,color,created_at,updated_at')
          .single()
          
        if (insertResult.error && insertResult.error.code === '23503') {
          // FK constraint failed, try with null user_id for dev
          console.log('🔄 FK constraint failed, retrying with null user_id for dev')
          insertResult = await supabase
            .from('categories')
            .insert([{ user_id: null, name, description: description || '', color: color || '#3B82F6' }])
            .select('id,name,description,color,created_at,updated_at')
            .single()
        }
        
        const { data: inserted, error: insErr } = insertResult
        if (insErr) {
          console.error('❌ Supabase categories insert error:', insErr)
          throw insErr
        }
        return NextResponse.json({ success: true, category: {
          id: inserted.id,
          name: inserted.name,
          description: inserted.description || '',
          color: inserted.color || '#3B82F6',
          bookmarkCount: 0,
          createdAt: inserted.created_at,
          updatedAt: inserted.updated_at
        }, message: 'Category created successfully' })
      } catch (e) {
        console.error('Supabase categories insert failed:', (e as any)?.message)
        return NextResponse.json({ error: 'Supabase insert failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, color, user_id } = body;
    
    // Prefer authenticated user; fallback to dev user if missing
    let uid = user_id as string | undefined
    try {
      const auth = await authenticateUser(request)
      if (auth?.success && auth.userId) uid = auth.userId
    } catch {}
    if (!uid) uid = DEV_USER_ID

    // Validate required fields
    if (!id || !name || !uid) {
      return NextResponse.json(
        { error: 'ID, name, and user_id are required' },
        { status: 400 }
      );
    }
    
    if (USE_SUPABASE && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, description: description || '', color: color || '#3B82F6' })
        .eq('id', id)
        .eq('user_id', uid)
        .select('id,name,description,color,created_at,updated_at')
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, category: {
        id: data.id,
        name: data.name,
        description: data.description || '',
        color: data.color || '#3B82F6',
        bookmarkCount: 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }, message: 'Category updated successfully' })
    } else {
      const allCategories = await loadCategories();
      const categoryIndex = allCategories.findIndex(
        cat => cat.id === id && cat.user_id === user_id
      );
      if (categoryIndex === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      allCategories[categoryIndex] = {
        ...allCategories[categoryIndex],
        name,
        description: description || '',
        color: color || '#3B82F6',
        updatedAt: new Date().toISOString()
      };
      await saveCategories(allCategories);
      return NextResponse.json({ success: true, category: allCategories[categoryIndex], message: 'Category updated successfully' })
    }
    
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Prefer authenticated user; fallback to dev user if missing
    let uid: string | null = null
    try {
      const auth = await authenticateUser(request as any)
      if (auth?.success && auth.userId) uid = auth.userId
    } catch {}
    if (!uid) uid = DEV_USER_ID
    
    if (!id || !uid) {
      return NextResponse.json(
        { error: 'ID and user_id are required' },
        { status: 400 }
      );
    }
    
    if (USE_SUPABASE && supabase) {
      // Count bookmarks in this category
      const { data: countData, error: cntErr } = await supabase
        .from('bookmarks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('category', id) // if your bookmarks.category stores name, change to name check below
      if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 500 })
      // If category reference is by name, refetch name first
      let categoryName = id
      const { data: catRow } = await supabase.from('categories').select('id,name').eq('id', id).single()
      if (catRow?.name) {
        const { count, error: cntErr2 } = await supabase
          .from('bookmarks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('category', catRow.name)
        if (cntErr2) return NextResponse.json({ error: cntErr2.message }, { status: 500 })
        if ((count as number) > 0) {
          return NextResponse.json({ error: `Cannot delete category. It contains ${count} bookmarks. Please move or delete the bookmarks first.` }, { status: 400 })
        }
      }
      const { error: delErr } = await supabase.from('categories').delete().eq('id', id)
      if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })
      return NextResponse.json({ success: true, message: 'Category deleted successfully' })
    } else {
      const allCategories = await loadCategories();
      const allBookmarks = await loadBookmarks();
      const categoryIndex = allCategories.findIndex(
        cat => cat.id === id && cat.user_id === user_id
      );
      if (categoryIndex === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      const categoryToDelete = allCategories[categoryIndex];
      const bookmarksInCategory = allBookmarks.filter(
        bookmark => bookmark.user_id === user_id && bookmark.category === categoryToDelete.name
      );
      if (bookmarksInCategory.length > 0) {
        return NextResponse.json({ error: `Cannot delete category. It contains ${bookmarksInCategory.length} bookmarks. Please move or delete the bookmarks first.` }, { status: 400 });
      }
      allCategories.splice(categoryIndex, 1);
      await saveCategories(allCategories);
      return NextResponse.json({ success: true, message: 'Category deleted successfully' })
    }
    
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}  