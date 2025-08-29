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

const COLLECTIONS_FILE = path.join(process.cwd(), 'data', 'collections.json');

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
    console.log('Collections file not found, creating new one');
    return [];
  }
}

// Write collections to file
async function writeCollections(collections: Collection[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
}

// GET - Fetch all collections
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || 'current-user-id';
    const isPublic = searchParams.get('public') === 'true';
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    console.log('Fetching collections for user:', userId);

    let collections = await readCollections();

    // Filter collections based on parameters
    if (isPublic) {
      collections = collections.filter(collection => collection.isPublic);
    } else {
      collections = collections.filter(collection => 
        collection.owner.id === userId || collection.collaborators.includes(userId)
      );
    }

    if (category) {
      collections = collections.filter(collection => 
        collection.tags.includes(category.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      collections = collections.filter(collection =>
        collection.name.toLowerCase().includes(searchLower) ||
        collection.description.toLowerCase().includes(searchLower) ||
        collection.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    console.log(`Found ${collections.length} collections`);

    return NextResponse.json({
      collections,
      total: collections.length,
      success: true
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections', success: false },
      { status: 500 }
    );
  }
}

// POST - Create new collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      bookmarks = [],
      isPublic = false,
      collaborators = [],
      tags = [],
      template,
      owner = {
        id: 'current-user-id',
        name: 'John Doe',
        avatar: '/avatars/john.jpg'
      }
    } = body;

    console.log('Creating new collection:', { name, description, template });

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required', success: false },
        { status: 400 }
      );
    }

    const collections = await readCollections();

    const newCollection: Collection = {
      id: `collection-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      bookmarks: Array.isArray(bookmarks) ? bookmarks : [],
      isPublic,
      collaborators: Array.isArray(collaborators) ? collaborators : [],
      tags: Array.isArray(tags) ? tags : [],
      template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner,
      stats: {
        views: 0,
        likes: 0,
        bookmarkCount: Array.isArray(bookmarks) ? bookmarks.length : 0,
        lastActivity: new Date().toISOString()
      }
    };

    collections.push(newCollection);
    await writeCollections(collections);

    console.log('Collection created successfully:', newCollection.id);

    return NextResponse.json({
      collection: newCollection,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection', success: false },
      { status: 500 }
    );
  }
}

// PUT - Update collection
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('Updating collection:', id, updates);

    const collections = await readCollections();
    const collectionIndex = collections.findIndex(c => c.id === id);

    if (collectionIndex === -1) {
      return NextResponse.json(
        { error: 'Collection not found', success: false },
        { status: 404 }
      );
    }

    // Update collection
    const updatedCollection = {
      ...collections[collectionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
      stats: {
        ...collections[collectionIndex].stats,
        bookmarkCount: updates.bookmarks ? updates.bookmarks.length : collections[collectionIndex].stats.bookmarkCount,
        lastActivity: new Date().toISOString()
      }
    };

    collections[collectionIndex] = updatedCollection;
    await writeCollections(collections);

    console.log('Collection updated successfully:', id);

    return NextResponse.json({
      collection: updatedCollection,
      success: true
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Delete collection
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('Deleting collection:', id);

    const collections = await readCollections();
    const collectionIndex = collections.findIndex(c => c.id === id);

    if (collectionIndex === -1) {
      return NextResponse.json(
        { error: 'Collection not found', success: false },
        { status: 404 }
      );
    }

    // Remove collection
    const deletedCollection = collections.splice(collectionIndex, 1)[0];
    await writeCollections(collections);

    console.log('Collection deleted successfully:', id);

    return NextResponse.json({
      collection: deletedCollection,
      success: true
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection', success: false },
      { status: 500 }
    );
  }
} 