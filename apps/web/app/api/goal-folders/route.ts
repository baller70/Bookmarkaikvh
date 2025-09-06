import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mockStorage } from '../../../lib/mockStorage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET /api/goal-folders: Starting...')
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    console.log('🎯 GET /api/goal-folders: userId =', userId)

    if (!userId) {
      console.log('❌ GET /api/goal-folders: No user ID provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ GET /api/goal-folders: Supabase not configured, returning mock data')
      const userFolders = mockStorage.getFolders(userId)
      console.log(`📁 GET /api/goal-folders: Returning ${userFolders.length} mock folders`)
      return NextResponse.json({
        success: true,
        data: userFolders
      })
    }

    console.log('🎯 GET /api/goal-folders: Querying database...')
    // Get all goal folders for the user with goal counts
    const { data: folders, error: foldersError } = await supabase
      .from('goal_folders')
      .select(`
        *,
        goals:goals(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (foldersError) {
      console.error('❌ GET /api/goal-folders: Database error:', foldersError)
      // Return mock data instead of error for development
      const userFolders = mockStorage.getFolders(userId)
      console.log(`📁 GET /api/goal-folders: Database error, returning ${userFolders.length} mock folders`)
      return NextResponse.json({
        success: true,
        data: userFolders
      })
    }

    // Transform the data to include goal counts
    const foldersWithCounts = folders?.map(folder => ({
      ...folder,
      goal_count: folder.goals?.[0]?.count || 0
    })) || []

    return NextResponse.json({
      success: true,
      data: foldersWithCounts
    })

  } catch (error) {
    console.error('Goal folders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST /api/goal-folders: Starting...')
    const body = await request.json()
    console.log('🎯 POST /api/goal-folders: Request body =', body)
    const { user_id, name, description, color } = body

    if (!user_id || !name) {
      console.log('❌ POST /api/goal-folders: Missing required fields')
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ POST /api/goal-folders: Supabase not configured, creating mock folder')
      const mockFolder = {
        id: `mock-folder-${Date.now()}`,
        user_id,
        name,
        description: description || null,
        color: color || '#3B82F6',
        goal_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store in mock storage for persistence
      mockStorage.addFolder(mockFolder)

      return NextResponse.json({
        success: true,
        data: mockFolder
      })
    }

    console.log('🎯 POST /api/goal-folders: Creating folder in database...')
    // Create new goal folder
    const { data: folder, error } = await supabase
      .from('goal_folders')
      .insert({
        user_id,
        name,
        description: description || null,
        color: color || '#3B82F6'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ POST /api/goal-folders: Database error:', error)

      // Return mock folder instead of error for development
      const mockFolder = {
        id: `mock-folder-${Date.now()}`,
        user_id,
        name,
        description: description || null,
        color: color || '#3B82F6',
        goal_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store in mock storage for persistence
      mockStorage.addFolder(mockFolder)

      return NextResponse.json({
        success: true,
        data: mockFolder
      })
    }

    console.log('✅ POST /api/goal-folders: Folder created successfully:', folder)
    return NextResponse.json({
      success: true,
      data: { ...folder, goal_count: 0 }
    })

  } catch (error) {
    console.error('❌ POST /api/goal-folders: Exception:', error)
    // Return mock folder instead of error for development
    const mockFolder = {
      id: `mock-folder-${Date.now()}`,
      user_id: user_id || 'dev-user-fixed-id',
      name: name || 'Mock Folder',
      description: description || null,
      color: color || '#3B82F6',
      goal_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    console.log('⚠️ POST /api/goal-folders: Returning mock folder due to exception')
    return NextResponse.json({
      success: true,
      data: mockFolder
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, user_id, name, description, color } = body

    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Folder ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ PUT /api/goal-folders: Supabase not configured, updating mock folder')
      const updatedFolder = mockStorage.updateFolder(id, { name, description, color })

      if (!updatedFolder) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedFolder
      })
    }

    // Update goal folder
    const { data: folder, error } = await supabase
      .from('goal_folders')
      .update({
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        color: color || undefined
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating goal folder:', error)

      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A folder with this name already exists' },
          { status: 409 }
        )
      }

      // Fallback to mock storage on database error
      console.warn('⚠️ PUT /api/goal-folders: Database error, falling back to mock storage')
      const updatedFolder = mockStorage.updateFolder(id, { name, description, color })

      if (!updatedFolder) {
        return NextResponse.json(
          { error: 'Failed to update goal folder' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedFolder
      })
    }

    if (!folder) {
      return NextResponse.json(
        { error: 'Goal folder not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: folder
    })

  } catch (error) {
    console.error('Goal folders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')
    const handleGoals = searchParams.get('handle_goals') || 'unassign' // 'unassign' or 'delete'

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Folder ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ DELETE /api/goal-folders: Supabase not configured, deleting from mock storage')
      const success = mockStorage.deleteFolder(id, userId, handleGoals)

      if (!success) {
        return NextResponse.json(
          { error: 'Folder not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Goal folder deleted successfully'
      })
    }

    // Handle goals in the folder based on the strategy
    if (handleGoals === 'delete') {
      // Delete all goals in the folder
      const { error: goalsError } = await supabase
        .from('goals')
        .delete()
        .eq('folder_id', id)
        .eq('user_id', userId)

      if (goalsError) {
        console.error('Error deleting goals in folder:', goalsError)
        // Fallback to mock storage
        console.warn('⚠️ DELETE /api/goal-folders: Database error, falling back to mock storage')
        const success = mockStorage.deleteFolder(id, userId, handleGoals)

        if (!success) {
          return NextResponse.json(
            { error: 'Failed to delete goals in folder' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Goal folder deleted successfully (fallback)'
        })
      }
    } else {
      // Unassign goals from folder (set folder_id to null)
      const { error: goalsError } = await supabase
        .from('goals')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', userId)

      if (goalsError) {
        console.error('Error unassigning goals from folder:', goalsError)
        // Fallback to mock storage
        console.warn('⚠️ DELETE /api/goal-folders: Database error, falling back to mock storage')
        const success = mockStorage.deleteFolder(id, userId, handleGoals)

        if (!success) {
          return NextResponse.json(
            { error: 'Failed to unassign goals from folder' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Goal folder deleted successfully (fallback)'
        })
      }
    }

    // Delete the folder
    const { error } = await supabase
      .from('goal_folders')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting goal folder:', error)
      // Fallback to mock storage
      console.warn('⚠️ DELETE /api/goal-folders: Database error, falling back to mock storage')
      const success = mockStorage.deleteFolder(id, userId, handleGoals)

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete goal folder' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Goal folder deleted successfully (fallback)'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Goal folder deleted successfully'
    })

  } catch (error) {
    console.error('Goal folders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
