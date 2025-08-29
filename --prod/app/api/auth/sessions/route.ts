import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/auth/sessions - Get user's active sessions
export async function GET(request: NextRequest) {
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

    // Get user sessions from database
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('last_accessed', { ascending: false })

    if (sessionsError) {
      console.error('Failed to fetch sessions:', sessionsError)
      return NextResponse.json({ 
        error: 'Failed to fetch sessions' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || []
    })

  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// DELETE /api/auth/sessions - Sign out from specific session or all sessions
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const signOutAll = searchParams.get('all') === 'true'

    if (signOutAll) {
      // Sign out from all sessions
      const { error: signOutError } = await supabase.auth.admin.signOut(user.id, 'global')
      
      if (signOutError) {
        return NextResponse.json({ 
          error: 'Failed to sign out from all sessions' 
        }, { status: 500 })
      }

      // Remove all session records from database
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) {
        console.error('Failed to delete session records:', deleteError)
      }

      return NextResponse.json({
        success: true,
        message: 'Signed out from all sessions'
      })

    } else if (sessionId) {
      // Sign out from specific session
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId)

      if (deleteError) {
        return NextResponse.json({ 
          error: 'Failed to sign out from session' 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Signed out from session'
      })

    } else {
      return NextResponse.json({ 
        error: 'Session ID or all=true parameter required' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Session signout error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 