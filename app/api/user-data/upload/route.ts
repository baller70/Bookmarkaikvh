import { NextRequest, NextResponse } from 'next/server';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// POST /api/user-data/upload - Upload file to Supabase storage and save metadata
export async function POST(request: NextRequest) {
  try {
    // If Supabase is not configured, return error
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        error: 'File upload not configured - Supabase not available', 
        success: false 
      }, { status: 503 });
    }

    // Import Supabase client only if configured
    const { createClient } = await import('@/utils/supabase-server');
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'document'; // 'image', 'video', 'document', 'logo'
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided', success: false }, { status: 400 });
    }

    // Validate file type and size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large (max 50MB)', success: false }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${user.id}/${type}/${uniqueFileName}`;

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(fileBuffer);

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file', success: false }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-media')
      .getPublicUrl(filePath);

    // Save metadata to database
    const mediaFileData = {
      user_id: user.id,
      name: file.name,
      type: type as 'image' | 'video' | 'document' | 'logo',
      url: publicUrl,
      size: file.size,
      mime_type: file.type,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      metadata: {
        original_name: file.name,
        upload_path: filePath,
        file_extension: fileExtension
      }
    };

    const { data: mediaFile, error: dbError } = await supabase
      .from('user_media_files')
      .insert(mediaFileData)
      .select()
      .single();

    if (dbError) {
      console.error('Error saving media file metadata:', dbError);
      
      // Clean up uploaded file if database save fails
      await supabase.storage
        .from('user-media')
        .remove([filePath]);
        
      return NextResponse.json({ error: 'Failed to save file metadata', success: false }, { status: 500 });
    }

    return NextResponse.json({ 
      data: mediaFile, 
      success: true,
      message: 'File uploaded successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/user-data/upload:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

// GET /api/user-data/upload - Get upload status or signed URL for large files
export async function GET(request: NextRequest) {
  try {
    // If Supabase is not configured, return error
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        error: 'File upload not configured - Supabase not available', 
        success: false 
      }, { status: 503 });
    }

    // Import Supabase client only if configured
    const { createClient } = await import('@/utils/supabase-server');
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const fileType = searchParams.get('fileType');
    const type = searchParams.get('type') || 'document';

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required', success: false }, { status: 400 });
    }

    // Generate signed URL for direct upload (useful for large files)
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${user.id}/${type}/${uniqueFileName}`;

    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from('user-media')
      .createSignedUploadUrl(filePath);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json({ error: 'Failed to create upload URL', success: false }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        signedUrl: signedUrl.signedUrl,
        token: signedUrl.token,
        path: filePath,
        fileName: uniqueFileName
      },
      success: true
    });

  } catch (error) {
    console.error('Error in GET /api/user-data/upload:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
} 