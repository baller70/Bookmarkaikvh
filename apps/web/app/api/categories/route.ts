import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { authenticateUser } from '@/lib/auth-utils';

// Resolve writable data directory (Vercel allows writes only to /tmp)
const DATA_BASE_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/data' : join(process.cwd(), 'data'))
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
    
    // Load categories and bookmarks
    const allCategories = await loadCategories();
    const allBookmarks = await loadBookmarks();
    
    // Filter categories by user
    const userCategories = allCategories.filter(cat => cat.user_id === userId);
    
    // Get bookmark counts for each category
    const categoriesWithCounts = userCategories.map(category => {
      const bookmarkCount = allBookmarks.filter(
        bookmark => bookmark.user_id === userId && bookmark.category === category.name
      ).length;
      
      return {
        ...category,
        bookmarkCount
      };
    });
    
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
    
    // Load existing categories
    const allCategories = await loadCategories();
    
    // Check if category already exists for this user
    const existingCategory = allCategories.find(
      cat => cat.user_id === user_id && cat.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }
    
    // Create new category
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
    
    // Add to categories array
    allCategories.push(newCategory);
    
    // Save to file
    await saveCategories(allCategories);
    
    return NextResponse.json({
      success: true,
      category: newCategory,
      message: 'Category created successfully'
    });
    
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
    
    // Load existing categories
    const allCategories = await loadCategories();
    
    // Find category to update
    const categoryIndex = allCategories.findIndex(
      cat => cat.id === id && cat.user_id === user_id
    );
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Update category
    allCategories[categoryIndex] = {
      ...allCategories[categoryIndex],
      name,
      description: description || '',
      color: color || '#3B82F6',
      updatedAt: new Date().toISOString()
    };
    
    // Save to file
    await saveCategories(allCategories);
    
    return NextResponse.json({
      success: true,
      category: allCategories[categoryIndex],
      message: 'Category updated successfully'
    });
    
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
    
    // Load categories and bookmarks
    const allCategories = await loadCategories();
    const allBookmarks = await loadBookmarks();
    
    // Find category to delete
    const categoryIndex = allCategories.findIndex(
      cat => cat.id === id && cat.user_id === user_id
    );
    
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const categoryToDelete = allCategories[categoryIndex];
    
    // Check if category has bookmarks
    const bookmarksInCategory = allBookmarks.filter(
      bookmark => bookmark.user_id === user_id && bookmark.category === categoryToDelete.name
    );
    
    if (bookmarksInCategory.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete category. It contains ${bookmarksInCategory.length} bookmarks. Please move or delete the bookmarks first.` },
        { status: 400 }
      );
    }
    
    // Remove category
    allCategories.splice(categoryIndex, 1);
    
    // Save to file
    await saveCategories(allCategories);
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}  