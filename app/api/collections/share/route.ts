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

interface ShareSettings {
  isPublic: boolean;
  collaborators: string[];
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canDelete: boolean;
  };
  expiresAt?: string;
  requiresApproval: boolean;
}

const COLLECTIONS_FILE = path.join(process.cwd(), 'data', 'collections.json');
const SHARES_FILE = path.join(process.cwd(), 'data', 'collection-shares.json');

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

// Write collections to file
async function writeCollections(collections: Collection[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(COLLECTIONS_FILE, JSON.stringify(collections, null, 2));
}

// Read share settings from file
async function readShares(): Promise<Record<string, ShareSettings>> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SHARES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Write share settings to file
async function writeShares(shares: Record<string, ShareSettings>): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(SHARES_FILE, JSON.stringify(shares, null, 2));
}

// POST - Share collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      collectionId,
      isPublic = false,
      collaborators = [],
      permissions = {
        canEdit: false,
        canShare: false,
        canDelete: false
      },
      expiresAt,
      requiresApproval = false
    } = body;

    console.log('Sharing collection:', { collectionId, isPublic, collaborators });

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    // Read collections and find the target collection
    const collections = await readCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      return NextResponse.json(
        { error: 'Collection not found', success: false },
        { status: 404 }
      );
    }

    const collection = collections[collectionIndex];

    // Update collection sharing settings
    const updatedCollection = {
      ...collection,
      isPublic,
      collaborators: Array.isArray(collaborators) ? collaborators : [],
      updatedAt: new Date().toISOString(),
      stats: {
        ...collection.stats,
        lastActivity: new Date().toISOString()
      }
    };

    collections[collectionIndex] = updatedCollection;
    await writeCollections(collections);

    // Store detailed share settings
    const shares = await readShares();
    shares[collectionId] = {
      isPublic,
      collaborators: Array.isArray(collaborators) ? collaborators : [],
      permissions,
      expiresAt,
      requiresApproval
    };
    await writeShares(shares);

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/collections/shared/${collectionId}`;

    console.log('Collection shared successfully:', collectionId);

    return NextResponse.json({
      collection: updatedCollection,
      shareSettings: shares[collectionId],
      shareUrl,
      success: true
    });
  } catch (error) {
    console.error('Error sharing collection:', error);
    return NextResponse.json(
      { error: 'Failed to share collection', success: false },
      { status: 500 }
    );
  }
}

// GET - Get share settings for a collection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('Getting share settings for collection:', collectionId);

    const shares = await readShares();
    const shareSettings = shares[collectionId];

    if (!shareSettings) {
      return NextResponse.json(
        { error: 'Share settings not found', success: false },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (shareSettings.expiresAt && new Date(shareSettings.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired', success: false },
        { status: 410 }
      );
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/collections/shared/${collectionId}`;

    return NextResponse.json({
      shareSettings,
      shareUrl,
      success: true
    });
  } catch (error) {
    console.error('Error getting share settings:', error);
    return NextResponse.json(
      { error: 'Failed to get share settings', success: false },
      { status: 500 }
    );
  }
}

// PUT - Update share settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, ...updates } = body;

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('Updating share settings for collection:', collectionId, updates);

    const shares = await readShares();
    const currentSettings = shares[collectionId];

    if (!currentSettings) {
      return NextResponse.json(
        { error: 'Share settings not found', success: false },
        { status: 404 }
      );
    }

    // Update share settings
    const updatedSettings = {
      ...currentSettings,
      ...updates
    };

    shares[collectionId] = updatedSettings;
    await writeShares(shares);

    // Also update the collection if visibility changed
    if ('isPublic' in updates || 'collaborators' in updates) {
      const collections = await readCollections();
      const collectionIndex = collections.findIndex(c => c.id === collectionId);

      if (collectionIndex !== -1) {
        collections[collectionIndex] = {
          ...collections[collectionIndex],
          isPublic: updatedSettings.isPublic,
          collaborators: updatedSettings.collaborators,
          updatedAt: new Date().toISOString(),
          stats: {
            ...collections[collectionIndex].stats,
            lastActivity: new Date().toISOString()
          }
        };
        await writeCollections(collections);
      }
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/collections/shared/${collectionId}`;

    console.log('Share settings updated successfully:', collectionId);

    return NextResponse.json({
      shareSettings: updatedSettings,
      shareUrl,
      success: true
    });
  } catch (error) {
    console.error('Error updating share settings:', error);
    return NextResponse.json(
      { error: 'Failed to update share settings', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Remove sharing (make private)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID is required', success: false },
        { status: 400 }
      );
    }

    console.log('Removing sharing for collection:', collectionId);

    // Update collection to private
    const collections = await readCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);

    if (collectionIndex !== -1) {
      collections[collectionIndex] = {
        ...collections[collectionIndex],
        isPublic: false,
        collaborators: [],
        updatedAt: new Date().toISOString(),
        stats: {
          ...collections[collectionIndex].stats,
          lastActivity: new Date().toISOString()
        }
      };
      await writeCollections(collections);
    }

    // Remove share settings
    const shares = await readShares();
    delete shares[collectionId];
    await writeShares(shares);

    console.log('Sharing removed successfully:', collectionId);

    return NextResponse.json({
      message: 'Sharing removed successfully',
      success: true
    });
  } catch (error) {
    console.error('Error removing sharing:', error);
    return NextResponse.json(
      { error: 'Failed to remove sharing', success: false },
      { status: 500 }
    );
  }
} 