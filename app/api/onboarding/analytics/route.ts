import { NextRequest, NextResponse } from 'next/server'

// Mock analytics storage - in production this would be your analytics database
const analyticsEvents = new Map<string, any[]>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const flowId = searchParams.get('flowId')
    const stepId = searchParams.get('stepId')
    const event = searchParams.get('event')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let events = analyticsEvents.get(userId) || []

    // Apply filters
    if (flowId) {
      events = events.filter(e => e.flowId === flowId)
    }
    if (stepId) {
      events = events.filter(e => e.stepId === stepId)
    }
    if (event) {
      events = events.filter(e => e.event === event)
    }
    if (startDate) {
      events = events.filter(e => new Date(e.timestamp) >= new Date(startDate))
    }
    if (endDate) {
      events = events.filter(e => new Date(e.timestamp) <= new Date(endDate))
    }

    // Generate analytics summary
    const summary = {
      totalEvents: events.length,
      eventTypes: events.reduce((acc, e) => {
        acc[e.event] = (acc[e.event] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      flowsStarted: events.filter(e => e.event === 'started').length,
      flowsCompleted: events.filter(e => e.event === 'completed').length,
      stepsSkipped: events.filter(e => e.event === 'skipped').length,
      flowsAbandoned: events.filter(e => e.event === 'abandoned').length,
      averageTimeSpent: events
        .filter(e => e.timeSpent)
        .reduce((acc, e, _, arr) => acc + (e.timeSpent || 0) / arr.length, 0),
      completionRate: events.filter(e => e.event === 'started').length > 0 
        ? (events.filter(e => e.event === 'completed').length / events.filter(e => e.event === 'started').length) * 100
        : 0
    }

    return NextResponse.json({
      events,
      summary,
      filters: {
        userId,
        flowId,
        stepId,
        event,
        startDate,
        endDate
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, flowId, stepId, event, timeSpent, metadata } = body

    // Validate required fields
    if (!userId || !flowId || !stepId || !event) {
      return NextResponse.json(
        { error: 'userId, flowId, stepId, and event are required' },
        { status: 400 }
      )
    }

    // Validate event type
    const validEvents = ['started', 'completed', 'skipped', 'abandoned', 'help_viewed']
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` },
        { status: 400 }
      )
    }

    // Create analytics event
    const analyticsEvent = {
      userId,
      flowId,
      stepId,
      event,
      timestamp: new Date().toISOString(),
      timeSpent: timeSpent || null,
      metadata: metadata || {},
      sessionId: `${userId}-${Date.now()}`, // Simple session tracking
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    }

    // Store event
    const userEvents = analyticsEvents.get(userId) || []
    userEvents.push(analyticsEvent)
    analyticsEvents.set(userId, userEvents)

    // Log for debugging (remove in production)
    console.log('Onboarding analytics event recorded:', {
      userId,
      flowId,
      stepId,
      event,
      timestamp: analyticsEvent.timestamp
    })

    return NextResponse.json({
      success: true,
      message: 'Analytics event recorded successfully',
      eventId: `${userId}-${analyticsEvent.timestamp}`
    })
  } catch (error) {
    console.error('Error recording analytics event:', error)
    return NextResponse.json(
      { error: 'Failed to record analytics event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const flowId = searchParams.get('flowId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (flowId) {
      // Delete events for specific flow
      const userEvents = analyticsEvents.get(userId) || []
      const filteredEvents = userEvents.filter(e => e.flowId !== flowId)
      analyticsEvents.set(userId, filteredEvents)
    } else {
      // Delete all events for user
      analyticsEvents.delete(userId)
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to delete analytics data' },
      { status: 500 }
    )
  }
} 