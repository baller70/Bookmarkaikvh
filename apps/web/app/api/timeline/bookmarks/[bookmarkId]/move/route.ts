import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookmarkId: string }> }
) {
  try {
    const { bookmarkId } = await params;
    const { newBoardId, newOrder } = await request.json();
    
    // Mock move operation - return moved bookmark
    const movedBookmark = {
      id: bookmarkId,
      boardId: newBoardId,
      title: 'Moved Bookmark',
      url: 'https://example.com',
      order: newOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json(movedBookmark);
  } catch (error) {
    console.error('Bookmark move error:', error);
    return NextResponse.json(
      { error: 'Failed to move bookmark' },
      { status: 500 }
    );
  }
} 