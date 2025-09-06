import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// POST /api/bookmarks/upload - Upload custom images for bookmark customization
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // For development/testing, use the same bypass user ID as other routes
    const userId = '00000000-0000-0000-0000-000000000001';
    console.log(`[API OVERRIDE] Using dev bypass userId: ${userId}`);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string; // 'favicon', 'logo', 'background'
    const bookmarkId = formData.get('bookmarkId') as string;

    console.log(`🔧 Upload request details:`, { uploadType, bookmarkId, userId, fileName: file?.name });

    if (!file) {
      return NextResponse.json({ error: 'No file provided', success: false }, { status: 400 });
    }

    if (!uploadType || !['favicon', 'logo', 'background'].includes(uploadType)) {
      return NextResponse.json({ error: 'Invalid upload type. Must be favicon, logo, or background', success: false }, { status: 400 });
    }

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required', success: false }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PNG, JPG, SVG, and WebP images are allowed', 
        success: false 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB', 
        success: false 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${userId}/bookmarks/${bookmarkId}/${uploadType}/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-media')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file', success: false }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('user-media')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Update bookmark with the new custom upload URL
    // Map upload types to their corresponding database fields
    let updateField: string;
    let updateData: any;
    let updateError: any;

    // Map upload types to their corresponding database fields
    switch (uploadType) {
      case 'favicon':
        updateField = 'custom_favicon';
        console.log('🔧 About to update bookmark:', {
          table: 'bookmarks',
          updateField,
          publicUrl,
          bookmarkId,
          userId
        });

        // First, let's check if the bookmark exists and what user_id it has
        const { data: existingBookmark, error: checkError } = await supabase
          .from('bookmarks')
          .select('id, user_id, title')
          .eq('id', bookmarkId)
          .single();

        console.log('🔍 Existing bookmark check:', { existingBookmark, checkError });

        if (checkError) {
          console.error('❌ Bookmark not found:', checkError);
          return NextResponse.json(
            { error: 'Bookmark not found' },
            { status: 404 }
          );
        }

        // Update the bookmark with the new favicon URL in bookmarks table
        // Use the correct user_id based on what we found
        let faviconResult;
        if (existingBookmark.user_id === null) {
          console.log('🔧 Updating bookmark with null user_id');
          faviconResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: publicUrl })
            .eq('id', bookmarkId)
            .is('user_id', null)
            .select('*')
            .single();
        } else {
          console.log('🔧 Updating bookmark with specific user_id:', existingBookmark.user_id);
          faviconResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: publicUrl })
            .eq('id', bookmarkId)
            .eq('user_id', existingBookmark.user_id)
            .select('*')
            .single();
        }

        updateData = faviconResult.data;
        updateError = faviconResult.error;

        console.log('🔧 Favicon update result:', { data: faviconResult.data, error: faviconResult.error });
        break;
      case 'logo':
        updateField = 'custom_logo'; // Use correct column name for logo
        console.log('🔧 About to update bookmark:', {
          table: 'bookmarks',
          updateField,
          publicUrl,
          bookmarkId,
          userId
        });

        // First, let's check if the bookmark exists and what user_id it has
        const { data: existingBookmarkLogo, error: checkErrorLogo } = await supabase
          .from('bookmarks')
          .select('id, user_id, title')
          .eq('id', bookmarkId)
          .single();

        console.log('🔍 Existing bookmark check:', { existingBookmark: existingBookmarkLogo, checkError: checkErrorLogo });

        if (checkErrorLogo) {
          console.error('❌ Bookmark not found:', checkErrorLogo);
          return NextResponse.json(
            { error: 'Bookmark not found' },
            { status: 404 }
          );
        }

        // Update the bookmark with the new logo URL in bookmarks table
        // Use the correct user_id based on what we found
        let logoResult;
        if (existingBookmarkLogo.user_id === null) {
          console.log('🔧 Updating bookmark with null user_id');
          logoResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: publicUrl })
            .eq('id', bookmarkId)
            .is('user_id', null)
            .select('*')
            .single();
        } else {
          console.log('🔧 Updating bookmark with specific user_id:', existingBookmarkLogo.user_id);
          logoResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: publicUrl })
            .eq('id', bookmarkId)
            .eq('user_id', existingBookmarkLogo.user_id)
            .select('*')
            .single();
        }

        updateData = logoResult.data;
        updateError = logoResult.error;

        console.log('🔧 Logo update result:', { data: logoResult.data, error: logoResult.error });
        break;
      case 'background':
        updateField = 'custom_background'; // Use correct column name for background
        console.log('🔧 About to update bookmark:', {
          table: 'bookmarks',
          updateField,
          publicUrl,
          bookmarkId,
          userId
        });

        // First, let's check if the bookmark exists and what user_id it has
        const { data: existingBookmarkBg, error: checkErrorBg } = await supabase
          .from('bookmarks')
          .select('id, user_id, title')
          .eq('id', bookmarkId)
          .single();

        console.log('🔍 Existing bookmark check:', { existingBookmark: existingBookmarkBg, checkError: checkErrorBg });

        if (checkErrorBg) {
          console.error('❌ Bookmark not found:', checkErrorBg);
          return NextResponse.json(
            { error: 'Bookmark not found' },
            { status: 404 }
          );
        }

        // Update the bookmark with the new background URL in bookmarks table
        // Use the correct user_id based on what we found
        let bgResult;
        if (existingBookmarkBg.user_id === null) {
          console.log('🔧 Updating bookmark with null user_id');
          bgResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: publicUrl })
            .eq('id', bookmarkId)
            .is('user_id', null)
            .select('*')
            .single();
        } else {
          console.log('🔧 Updating bookmark with specific user_id:', existingBookmarkBg.user_id);
          bgResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: publicUrl })
            .eq('id', bookmarkId)
            .eq('user_id', existingBookmarkBg.user_id)
            .select('*')
            .single();
        }

        updateData = bgResult.data;
        updateError = bgResult.error;

        console.log('🔧 Background update result:', { data: bgResult.data, error: bgResult.error });
        break;
      default:
        return NextResponse.json({ error: 'Invalid upload type', success: false }, { status: 400 });
    }

    if (updateError) {
      console.error('Error updating bookmark:', updateError);
      // Clean up uploaded file if bookmark update fails
      await supabase.storage.from('user-media').remove([filePath]);
      return NextResponse.json({ error: 'Failed to update bookmark', success: false }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        uploadType,
        bookmarkId,
        fileName: uniqueFileName,
        filePath
      },
      bookmark: updateData
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (error as Error).message,
      success: false 
    }, { status: 500 });
  }
}

// DELETE /api/bookmarks/upload - Remove custom upload and revert to default
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // For development/testing, use the same bypass user ID as other routes
    const userId = '00000000-0000-0000-0000-000000000001';
    console.log(`[API OVERRIDE] Using dev bypass userId: ${userId}`);

    const { searchParams } = new URL(request.url);
    const uploadType = searchParams.get('uploadType');
    const bookmarkId = searchParams.get('bookmarkId');

    if (!uploadType || !['favicon', 'logo', 'background'].includes(uploadType)) {
      return NextResponse.json({ error: 'Invalid upload type', success: false }, { status: 400 });
    }

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required', success: false }, { status: 400 });
    }

    // Get current bookmark to find the file path
    // Map upload types to their corresponding database fields
    let selectField: string;
    let result: any;

    switch (uploadType) {
      case 'favicon':
        selectField = 'custom_favicon';
        result = await supabase
          .from('user_bookmarks')
          .select(selectField)
          .eq('id', bookmarkId)
          .eq('user_id', userId)
          .single();
        break;
      case 'logo':
        selectField = 'custom_logo'; // Use correct column name for logo
        // First try with null user_id
        result = await supabase
          .from('bookmarks')
          .select(selectField)
          .eq('id', bookmarkId)
          .is('user_id', null)
          .single();

        // If no record found with null user_id, try with specific user_id
        if (result.error && result.error.code === 'PGRST116') {
          result = await supabase
            .from('bookmarks')
            .select(selectField)
            .eq('id', bookmarkId)
            .eq('user_id', userId)
            .single();
        }
        break;
      case 'background':
        selectField = 'custom_background'; // Use correct column name for background
        // First try with null user_id
        result = await supabase
          .from('bookmarks')
          .select(selectField)
          .eq('id', bookmarkId)
          .is('user_id', null)
          .single();

        // If no record found with null user_id, try with specific user_id
        if (result.error && result.error.code === 'PGRST116') {
          result = await supabase
            .from('bookmarks')
            .select(selectField)
            .eq('id', bookmarkId)
            .eq('user_id', userId)
            .single();
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid upload type', success: false }, { status: 400 });
    }

    const bookmark = result.data;
    const fetchError = result.error;
    const currentUrl = bookmark?.[selectField];

    if (fetchError) {
      return NextResponse.json({ error: 'Bookmark not found', success: false }, { status: 404 });
    }

    // Update bookmark to remove custom upload
    // Use the same field mapping as above
    let updateField: string;
    let updateResult: any;

    switch (uploadType) {
      case 'favicon':
        updateField = 'custom_favicon';
        updateResult = await supabase
          .from('user_bookmarks')
          .update({ [updateField]: null })
          .eq('id', bookmarkId)
          .eq('user_id', userId)
          .select('*')
          .single();
        break;
      case 'logo':
        updateField = 'custom_logo'; // Use correct column name for logo
        try {
          updateResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: null })
            .eq('id', bookmarkId)
            .is('user_id', null)
            .select('*')
            .single();
        } catch (error) {
          // If no record found with null user_id, try with specific user_id
          updateResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: null })
            .eq('id', bookmarkId)
            .eq('user_id', userId)
            .select('*')
            .single();
        }
        break;
      case 'background':
        updateField = 'custom_background'; // Use correct column name for background
        try {
          updateResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: null })
            .eq('id', bookmarkId)
            .is('user_id', null)
            .select('*')
            .single();
        } catch (error) {
          // If no record found with null user_id, try with specific user_id
          updateResult = await supabase
            .from('bookmarks')
            .update({ [updateField]: null })
            .eq('id', bookmarkId)
            .eq('user_id', userId)
            .select('*')
            .single();
        }
        break;
      default:
        return NextResponse.json({ error: 'Invalid upload type', success: false }, { status: 400 });
    }

    const updateData = updateResult.data;
    const updateError = updateResult.error;

    if (updateError) {
      console.error('Error updating bookmark:', updateError);
      return NextResponse.json({ error: 'Failed to update bookmark', success: false }, { status: 500 });
    }

    // Try to delete the file from storage if it exists
    if (currentUrl) {
      try {
        // Extract file path from URL
        const urlParts = currentUrl.split('/');
        const pathIndex = urlParts.findIndex(part => part === 'user-media');
        if (pathIndex !== -1) {
          const filePath = urlParts.slice(pathIndex + 1).join('/');
          await supabase.storage.from('user-media').remove([filePath]);
        }
      } catch (deleteError) {
        console.warn('Could not delete file from storage:', deleteError);
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        uploadType,
        bookmarkId,
        removed: true
      },
      bookmark: updateData
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (error as Error).message,
      success: false 
    }, { status: 500 });
  }
}
