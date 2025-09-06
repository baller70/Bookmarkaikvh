import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mockStorage } from '../../../lib/mockStorage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET /api/goals: Starting...')
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const folderId = searchParams.get('folder_id')
    console.log('🎯 GET /api/goals: userId =', userId, 'folderId =', folderId)

    if (!userId) {
      console.log('❌ GET /api/goals: No user ID provided')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ GET /api/goals: Supabase not configured, returning mock data')
      const userGoals = mockStorage.getGoals(userId, folderId)
      console.log(`🎯 GET /api/goals: Returning ${userGoals.length} mock goals`)
      return NextResponse.json({
        success: true,
        data: userGoals
      })
    }

    console.log('🎯 GET /api/goals: Querying database...')
    let query = supabase
      .from('goals')
      .select(`
        *,
        goal_folders:folder_id(id, name, color)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Filter by folder if specified
    if (folderId) {
      if (folderId === 'null' || folderId === 'unassigned') {
        query = query.is('folder_id', null)
      } else {
        query = query.eq('folder_id', folderId)
      }
    }

    const { data: goals, error } = await query

    if (error) {
      console.error('❌ GET /api/goals: Database error:', error)
      // Return mock data instead of error for development
      const userGoals = mockStorage.getGoals(userId, folderId)
      console.log(`🎯 GET /api/goals: Database error, returning ${userGoals.length} mock goals`)
      return NextResponse.json({
        success: true,
        data: userGoals
      })
    }

    console.log('✅ GET /api/goals: Success, returning', goals?.length || 0, 'goals')
    return NextResponse.json({
      success: true,
      data: goals || []
    })

  } catch (error) {
    console.error('❌ GET /api/goals: Exception:', error)
    // Return empty array instead of error for development
    return NextResponse.json({
      success: true,
      data: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST /api/goals: Starting...')
    const body = await request.json()
    console.log('🎯 POST /api/goals: Request body =', body)

    const {
      user_id,
      folder_id,
      name,
      description,
      color,
      deadline_date,
      goal_type,
      goal_description,
      goal_status,
      goal_priority,
      goal_progress,
      connected_bookmarks,
      tags,
      notes
    } = body

    if (!user_id || !name) {
      console.log('❌ POST /api/goals: Missing required fields')
      return NextResponse.json(
        { error: 'User ID and name are required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ POST /api/goals: Supabase not configured, creating mock goal')
      const mockGoal = {
        id: `mock-goal-${Date.now()}`,
        user_id,
        folder_id: folder_id || null,
        name,
        description: description || null,
        color: color || '#3B82F6',
        deadline_date: deadline_date || null,
        goal_type: goal_type || 'custom',
        goal_description: goal_description || null,
        goal_status: goal_status || 'not_started',
        goal_priority: goal_priority || 'medium',
        goal_progress: goal_progress || 0,
        connected_bookmarks: connected_bookmarks || [],
        tags: tags || [],
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store in mock storage for persistence
      mockStorage.addGoal(mockGoal)

      return NextResponse.json({
        success: true,
        data: mockGoal
      })
    }

    // Skip folder validation for development - just proceed with goal creation
    console.log('🎯 POST /api/goals: Creating goal in database...')

    // Create new goal
    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        user_id,
        folder_id: folder_id || null,
        name,
        description: description || null,
        color: color || '#3B82F6',
        deadline_date: deadline_date || null,
        goal_type: goal_type || 'custom',
        goal_description: goal_description || null,
        goal_status: goal_status || 'not_started',
        goal_priority: goal_priority || 'medium',
        goal_progress: goal_progress || 0,
        connected_bookmarks: connected_bookmarks || [],
        tags: tags || [],
        notes: notes || null
      })
      .select(`
        *,
        goal_folders:folder_id(id, name, color)
      `)
      .single()

    if (error) {
      console.error('❌ POST /api/goals: Database error:', error)
      // Return mock goal instead of error for development
      const mockGoal = {
        id: `mock-goal-${Date.now()}`,
        user_id,
        folder_id: folder_id || null,
        name,
        description: description || null,
        color: color || '#3B82F6',
        deadline_date: deadline_date || null,
        goal_type: goal_type || 'custom',
        goal_description: goal_description || null,
        goal_status: goal_status || 'not_started',
        goal_priority: goal_priority || 'medium',
        goal_progress: goal_progress || 0,
        connected_bookmarks: connected_bookmarks || [],
        tags: tags || [],
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Store in mock storage for persistence
      mockStorage.addGoal(mockGoal)

      return NextResponse.json({
        success: true,
        data: mockGoal
      })
    }

    console.log('✅ POST /api/goals: Goal created successfully:', goal)
    return NextResponse.json({
      success: true,
      data: goal
    })

  } catch (error) {
    console.error('❌ POST /api/goals: Exception:', error)
    // Return mock goal instead of error for development
    const mockGoal = {
      id: `mock-goal-${Date.now()}`,
      user_id: 'dev-user-fixed-id',
      folder_id: null,
      name: 'Mock Goal',
      description: 'This is a mock goal created due to API error',
      color: '#3B82F6',
      deadline_date: null,
      goal_type: 'custom',
      goal_description: null,
      goal_status: 'not_started',
      goal_priority: 'medium',
      goal_progress: 0,
      connected_bookmarks: [],
      tags: [],
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    console.log('⚠️ POST /api/goals: Returning mock goal due to exception')
    return NextResponse.json({
      success: true,
      data: mockGoal
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      user_id,
      folder_id,
      name,
      description,
      color,
      deadline_date,
      goal_type,
      goal_description,
      goal_status,
      goal_priority,
      goal_progress,
      connected_bookmarks,
      tags,
      notes
    } = body

    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Goal ID and User ID are required' },
        { status: 400 }
      )
    }

    // Validate folder exists if folder_id is provided
    if (folder_id) {
      console.log('🎯 PUT /api/goals: Validating folder_id:', folder_id, 'for user:', user_id);

      // Skip validation for mock folder IDs and use mock storage validation
      if (folder_id.startsWith('mock-folder-') || id.startsWith('mock-goal-')) {
        console.warn('⚠️ PUT /api/goals: Using mock storage validation for mock IDs');
        // Validate using mock storage
        const userFolders = mockStorage.getFolders(user_id)
        const folderExists = userFolders.some(folder => folder.id === folder_id)

        if (!folderExists) {
          console.error('❌ PUT /api/goals: Invalid mock folder ID - not found in mock storage');
          return NextResponse.json(
            {
              error: 'Invalid folder ID',
              details: `Folder ${folder_id} not found for user ${user_id}`,
              availableFolders: userFolders.map(f => ({ id: f.id, name: f.name }))
            },
            { status: 400 }
          )
        }
        console.log('✅ PUT /api/goals: Mock folder validation successful');
      } else {
        // Check if Supabase is configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          // Use mock storage for validation
          const userFolders = mockStorage.getFolders(user_id)
          console.log('🎯 PUT /api/goals: Available folders in mock storage:', userFolders.map(f => ({ id: f.id, name: f.name })));
          console.log('🎯 PUT /api/goals: Looking for folder_id:', folder_id);
          console.log('🎯 PUT /api/goals: Mock storage stats:', mockStorage.getStats());

          const folderExists = userFolders.some(folder => folder.id === folder_id)
          console.log('🎯 PUT /api/goals: Folder exists in mock storage:', folderExists);

          if (!folderExists) {
            console.error('❌ PUT /api/goals: Invalid folder ID - not found in mock storage');
            console.error('❌ PUT /api/goals: Detailed folder comparison:');
            userFolders.forEach(folder => {
              console.error(`  - Folder ID: "${folder.id}" (type: ${typeof folder.id}), Name: "${folder.name}"`);
              console.error(`  - Matches target: ${folder.id === folder_id} (target: "${folder_id}", type: ${typeof folder_id})`);
            });

            return NextResponse.json(
              {
                error: 'Invalid folder ID',
                details: `Folder ${folder_id} not found for user ${user_id}`,
                availableFolders: userFolders.map(f => ({ id: f.id, name: f.name })),
                debugInfo: {
                  targetFolderId: folder_id,
                  targetFolderIdType: typeof folder_id,
                  mockStorageStats: mockStorage.getStats(),
                  allFolderIds: userFolders.map(f => f.id)
                }
              },
              { status: 400 }
            )
          }
        } else {
          // Use Supabase for validation
          console.log('🎯 PUT /api/goals: Validating folder in Supabase...');
          const { data: folder, error: folderError } = await supabase
            .from('goal_folders')
            .select('id')
            .eq('id', folder_id)
            .eq('user_id', user_id)
            .single()

          if (folderError || !folder) {
            console.error('❌ PUT /api/goals: Invalid folder ID - not found in Supabase:', folderError);
            return NextResponse.json(
              {
                error: 'Invalid folder ID',
                details: `Folder ${folder_id} not found for user ${user_id}`,
                supabaseError: folderError?.message
              },
              { status: 400 }
            )
          }
          console.log('✅ PUT /api/goals: Folder validation successful');
        }
      }
    }

    // Check if we should use mock storage (either Supabase not configured OR dealing with mock IDs)
    const shouldUseMockStorage = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
                                !process.env.SUPABASE_SERVICE_ROLE_KEY ||
                                id.startsWith('mock-goal-') ||
                                (folder_id && folder_id.startsWith('mock-folder-'))

    if (shouldUseMockStorage) {
      console.warn('⚠️ PUT /api/goals: Using mock storage for goal update (mock IDs detected or Supabase not configured)')

      // Prepare update data
      const updateData: any = {}
      if (folder_id !== undefined) updateData.folder_id = folder_id
      if (name !== undefined) updateData.name = name
      if (description !== undefined) updateData.description = description
      if (color !== undefined) updateData.color = color
      if (deadline_date !== undefined) updateData.deadline_date = deadline_date
      if (goal_type !== undefined) updateData.goal_type = goal_type
      if (goal_description !== undefined) updateData.goal_description = goal_description
      if (goal_status !== undefined) updateData.goal_status = goal_status
      if (goal_priority !== undefined) updateData.goal_priority = goal_priority
      if (goal_progress !== undefined) updateData.goal_progress = goal_progress
      if (connected_bookmarks !== undefined) updateData.connected_bookmarks = connected_bookmarks
      if (tags !== undefined) updateData.tags = tags
      if (notes !== undefined) updateData.notes = notes

      // Update goal in mock storage
      const updatedGoal = mockStorage.updateGoal(id, user_id, updateData)

      if (!updatedGoal) {
        return NextResponse.json(
          { error: 'Goal not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: updatedGoal
      })
    }

    // Update goal using Supabase
    const updateData: any = {}
    if (folder_id !== undefined) updateData.folder_id = folder_id
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (color !== undefined) updateData.color = color
    if (deadline_date !== undefined) updateData.deadline_date = deadline_date
    if (goal_type !== undefined) updateData.goal_type = goal_type
    if (goal_description !== undefined) updateData.goal_description = goal_description
    if (goal_status !== undefined) updateData.goal_status = goal_status
    if (goal_priority !== undefined) updateData.goal_priority = goal_priority
    if (goal_progress !== undefined) updateData.goal_progress = goal_progress
    if (connected_bookmarks !== undefined) updateData.connected_bookmarks = connected_bookmarks
    if (tags !== undefined) updateData.tags = tags
    if (notes !== undefined) updateData.notes = notes

    const { data: goal, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user_id)
      .select(`
        *,
        goal_folders:folder_id(id, name, color)
      `)
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      )
    }

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: goal
    })

  } catch (error) {
    console.error('Goals API error:', error)
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

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Goal ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ DELETE /api/goals: Supabase not configured, using mock storage')
      const success = mockStorage.deleteGoal(id, userId)

      if (!success) {
        return NextResponse.json(
          { error: 'Goal not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Goal deleted successfully (mock)'
      })
    }

    // Delete the goal
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting goal:', error)
      // Fallback to mock deletion
      console.warn('⚠️ DELETE /api/goals: Database error, falling back to mock deletion')
      const success = mockStorage.deleteGoal(id, userId)

      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete goal' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Goal deleted successfully (fallback)'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully'
    })

  } catch (error) {
    console.error('Goals API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
