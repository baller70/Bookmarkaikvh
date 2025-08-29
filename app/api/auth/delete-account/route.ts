import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST /api/auth/delete-account - Request account deletion
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { reason, feedback } = body

    // Create account deletion request
    const { error: insertError } = await supabase
      .from('account_deletion_requests')
      .insert({
        user_id: user.id,
        email: user.email,
        reason: reason || 'No reason provided',
        feedback: feedback || '',
        requested_at: new Date().toISOString(),
        status: 'pending'
      })

    if (insertError) {
      console.error('Failed to create deletion request:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create deletion request' 
      }, { status: 500 })
    }

    // Log the deletion request
    const { error: logError } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: user.id,
        action: 'account_deletion_requested',
        details: {
          timestamp: new Date().toISOString(),
          reason,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      })

    if (logError) {
      console.error('Failed to log deletion request:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion request submitted successfully. You will receive an email confirmation within 24 hours.'
    })

  } catch (error) {
    console.error('Account deletion request error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 