import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Mock database - in production this would be your actual database
const onboardingData = new Map()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') // 'progress', 'preferences', 'analytics'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userKey = `${userId}-${type || 'progress'}`
    const data = onboardingData.get(userKey)

    if (!data) {
      // Return default data structure
      const defaultData = {
        progress: {
          userId,
          flowId: '',
          currentStepId: '',
          completedSteps: [],
          skippedSteps: [],
          startedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          progressPercentage: 0,
          timeSpent: 0,
          isCompleted: false,
          isPaused: false
        },
        preferences: {
          userId,
          skipTutorials: false,
          showTooltips: true,
          autoAdvance: true,
          playbackSpeed: 'normal',
          preferredLearningStyle: 'interactive',
          completedOnboardings: [],
          dismissedTutorials: []
        },
        analytics: []
      }

      return NextResponse.json(defaultData[type as keyof typeof defaultData] || defaultData.progress)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, data } = body

    if (!userId || !type || !data) {
      return NextResponse.json(
        { error: 'User ID, type, and data are required' },
        { status: 400 }
      )
    }

    const userKey = `${userId}-${type}`
    
    // Validate data structure based on type
    if (type === 'progress') {
      const requiredFields = ['flowId', 'currentStepId', 'completedSteps', 'skippedSteps']
      const hasAllFields = requiredFields.every(field => field in data)
      
      if (!hasAllFields) {
        return NextResponse.json(
          { error: 'Invalid progress data structure' },
          { status: 400 }
        )
      }
      
      // Update timestamps
      data.lastActiveAt = new Date().toISOString()
      if (data.isCompleted && !data.completedAt) {
        data.completedAt = new Date().toISOString()
      }
    }

    // Store data
    onboardingData.set(userKey, data)

    return NextResponse.json({ 
      success: true, 
      message: `${type} data saved successfully` 
    })
  } catch (error) {
    console.error('Error saving onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, updates } = body

    if (!userId || !type || !updates) {
      return NextResponse.json(
        { error: 'User ID, type, and updates are required' },
        { status: 400 }
      )
    }

    const userKey = `${userId}-${type}`
    const existingData = onboardingData.get(userKey)

    if (!existingData) {
      return NextResponse.json(
        { error: 'No existing data found' },
        { status: 404 }
      )
    }

    // Merge updates with existing data
    const updatedData = {
      ...existingData,
      ...updates,
      lastActiveAt: new Date().toISOString()
    }

    onboardingData.set(userKey, updatedData)

    return NextResponse.json({ 
      success: true, 
      message: `${type} data updated successfully`,
      data: updatedData
    })
  } catch (error) {
    console.error('Error updating onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (type) {
      // Delete specific type of data
      const userKey = `${userId}-${type}`
      onboardingData.delete(userKey)
    } else {
      // Delete all onboarding data for user
      const keysToDelete = Array.from(onboardingData.keys()).filter(key => 
        key.startsWith(`${userId}-`)
      )
      keysToDelete.forEach(key => onboardingData.delete(key))
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding data deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting onboarding data:', error)
    return NextResponse.json(
      { error: 'Failed to delete onboarding data' },
      { status: 500 }
    )
  }
} 