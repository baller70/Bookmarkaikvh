import { NextRequest, NextResponse } from 'next/server'

// POST /api/notifications/test-simple - Send test notification without authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel } = body

    if (!channel || !['email', 'push', 'inApp'].includes(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    // Simulate different notification types
    const notificationData = {
      title: '',
      message: '',
      metadata: {} as Record<string, unknown>
    }

    switch (channel) {
      case 'email':
        notificationData.title = 'Test Email Notification'
        notificationData.message = 'This is a test email notification from your bookmark manager. If you received this, your email notifications are working correctly!'
        notificationData.metadata = {
          recipient: 'test@example.com',
          template: 'test_notification'
        }
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        break

      case 'push':
        notificationData.title = 'Test Push Notification'
        notificationData.message = 'Hello! This is a test push notification from your bookmark manager.'
        notificationData.metadata = {
          icon: '/favicon.ico',
          tag: 'test-notification'
        }
        break

      case 'inApp':
        notificationData.title = 'Test In-App Notification'
        notificationData.message = '🔔 Hello! Your bookmark insights are ready and notifications are working perfectly!'
        notificationData.metadata = {
          duration: 5000,
          type: 'info'
        }
        break
    }

    return NextResponse.json({
      success: true,
      message: `Test ${channel} notification sent successfully!`,
      data: notificationData
    })

  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 })
  }
} 