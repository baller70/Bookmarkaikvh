import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { authenticateUser } from '@/lib/auth-utils';
import { createClient } from '@supabase/supabase-js';

// Resolve writable data directory (Vercel allows writes only to /tmp)
const DATA_BASE_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/data' : join(process.cwd(), 'data'))
// Supabase init (if configured)
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
const USE_SUPABASE = !!(supabaseUrl && supabaseKey && !supabaseKey.includes('dev-placeholder'))
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
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const userId = authResult.userId!;
    
    let categoriesWithCounts: any[] = []

    if (USE_SUPABASE && supabase) {
      // Supabase path: categories table + count bookmarks per category
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('id,name,description,color,created_at,updated_at')
        .eq('user_id', userId)

      if (catErr) throw new Error(catErr.message)

      // Aggregate counts
      const { data: counts, error: cntErr } = await supabase
        .from('bookmarks')
        .select('category, count:count()', { head: false, count: 'exact' })
        .eq('user_id', userId)
        .group('category')

      if (cntErr) throw new Error(cntErr.message)
      const countMap = new Map<string, number>((counts || []).map((c: any) => [c.category, c.count]))

      categoriesWithCounts = (cats || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        color: c.color || '#3B82F6',
        bookmarkCount: countMap.get(c.name) || 0,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }))
    } else {
      // File path: load json and compute counts
      const allCategories = await loadCategories();
      const allBookmarks = await loadBookmarks();
      const userCategories = allCategories.filter(cat => cat.user_id === userId);

      categoriesWithCounts = userCategories.map(category => {
        const bookmarkCount = allBookmarks.filter(
          bookmark => bookmark.user_id === userId && bookmark.category === category.name
        ).length;
        return { ...category, bookmarkCount };
      });
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
    
    // Validate required fields
    if (!name || !user_id) {
      return NextResponse.json(
        { error: 'Name and user_id are required' },
        { status: 400 }
      );
    }
    
    if (USE_SUPABASE && supabase) {
      // Supabase insert
      const { data: existing, error: existErr } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user_id)
        .ilike('name', name)
        .limit(1)
      if (existErr) throw new Error(existErr.message)
      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Category already exists' }, { status: 400 })
      }
      const { data: inserted, error: insErr } = await supabase
        .from('categories')
        .insert([{ user_id, name, description: description || '', color: color || '#3B82F6' }])
        .select('id,name,description,color,created_at,updated_at')
        .single()
      if (insErr) throw new Error(insErr.message)
      return NextResponse.json({ success: true, category: {
        id: inserted.id,
        name: inserted.name,
        description: inserted.description || '',
        color: inserted.color || '#3B82F6',
        bookmarkCount: 0,
        createdAt: inserted.created_at,
        updatedAt: inserted.updated_at
      }, message: 'Category created successfully' })
    } else {
      // File storage path
      const allCategories = await loadCategories();
      const existingCategory = allCategories.find(
        cat => cat.user_id === user_id && cat.name.toLowerCase() === name.toLowerCase()
      );
      if (existingCategory) {
        return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
      }
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        description: description || '',
        color: color || '#3B82F6',
        user_id,
        bookmarkCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      allCategories.push(newCategory);
      await saveCategories(allCategories);
      return NextResponse.json({ success: true, category: newCategory, message: 'Category created successfully' })
    }
    
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
    
    // Validate required fields
    if (!id || !name || !user_id) {
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
        .eq('user_id', user_id)
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
    const user_id = searchParams.get('user_id');
    
    if (!id || !user_id) {
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
        .eq('user_id', user_id)
        .eq('category', id) // if your bookmarks.category stores name, change to name check below
      if (cntErr) return NextResponse.json({ error: cntErr.message }, { status: 500 })
      // If category reference is by name, refetch name first
      let categoryName = id
      const { data: catRow } = await supabase.from('categories').select('id,name').eq('id', id).single()
      if (catRow?.name) {
        const { count, error: cntErr2 } = await supabase
          .from('bookmarks')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user_id)
          .eq('category', catRow.name)
        if (cntErr2) return NextResponse.json({ error: cntErr2.message }, { status: 500 })
        if ((count as number) > 0) {
          return NextResponse.json({ error: `Cannot delete category. It contains ${count} bookmarks. Please move or delete the bookmarks first.` }, { status: 400 })
        }
      }
      const { error: delErr } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user_id)
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