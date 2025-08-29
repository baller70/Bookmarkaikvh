import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';
import { UserMediaFile, CreateUserMediaFileInput, ApiResponse } from '@/types/database';

// GET /api/user-data/media - Get user's media files
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // Filter by media type
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('user_media_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: mediaFiles, error, count } = await query
      .range(offset, offset + limit - 1)
      .returns<UserMediaFile[]>();

    if (error) {
      console.error('Error fetching media files:', error);
      return NextResponse.json({ error: 'Failed to fetch media files', success: false }, { status: 500 });
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      data: mediaFiles || [],
      count: count || 0,
      page,
      limit,
      total_pages: totalPages,
      success: true
    });
  } catch (error) {
    console.error('Error in GET /api/user-data/media:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

// POST /api/user-data/media - Create new media file record
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const body: CreateUserMediaFileInput = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type || !body.url || !body.size || !body.mime_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, type, url, size, mime_type', 
        success: false 
      }, { status: 400 });
    }

    const mediaFileData = {
      user_id: user.id,
      name: body.name,
      type: body.type,
      url: body.url,
      size: body.size,
      mime_type: body.mime_type,
      tags: body.tags || [],
      metadata: body.metadata || {}
    };

    const { data: mediaFile, error } = await supabase
      .from('user_media_files')
      .insert(mediaFileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating media file:', error);
      return NextResponse.json({ error: 'Failed to create media file', success: false }, { status: 500 });
    }

    return NextResponse.json({ data: mediaFile, success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/user-data/media:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

// PUT /api/user-data/media - Update media file
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required', success: false }, { status: 400 });
    }

    const body = await request.json();
    
    const { data: mediaFile, error } = await supabase
      .from('user_media_files')
      .update(body)
      .eq('id', mediaId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating media file:', error);
      return NextResponse.json({ error: 'Failed to update media file', success: false }, { status: 500 });
    }

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found', success: false }, { status: 404 });
    }

    return NextResponse.json({ data: mediaFile, success: true });
  } catch (error) {
    console.error('Error in PUT /api/user-data/media:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

// DELETE /api/user-data/media - Delete media file
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required', success: false }, { status: 400 });
    }

    // First get the media file to get the storage path
    const { data: mediaFile, error: fetchError } = await supabase
      .from('user_media_files')
      .select('*')
      .eq('id', mediaId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !mediaFile) {
      return NextResponse.json({ error: 'Media file not found', success: false }, { status: 404 });
    }

    // Delete from storage if it's a Supabase storage URL
    if (mediaFile.url.includes('supabase')) {
      const urlParts = mediaFile.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const bucketName = 'user-media'; // You'll need to create this bucket in Supabase
      
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([`${user.id}/${fileName}`]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('user_media_files')
      .delete()
      .eq('id', mediaId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting media file:', deleteError);
      return NextResponse.json({ error: 'Failed to delete media file', success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/user-data/media:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
} 