import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AuthResult {
  success: boolean
  userId?: string
  error?: string
  status?: number
}

export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Check if authentication bypass is enabled
    const bypassAuth = process.env.BYPASS_AUTHENTICATION === 'true'
    const isDevelopment = process.env.NODE_ENV === 'development'
    const enableFallback = process.env.ENABLE_FILE_STORAGE_FALLBACK === 'true'
    
    // Allow bypass in development, when explicitly enabled, or when using fallback storage
    if (bypassAuth || isDevelopment || enableFallback) {
      // Use a valid UUID format for Supabase compatibility
      const userId = '00000000-0000-0000-0000-000000000001'
      console.log('🔓 AUTH BYPASS: Using development user ID (UUID):', userId, {
        bypassAuth,
        isDevelopment,
        enableFallback,
        nodeEnv: process.env.NODE_ENV
      })
      return {
        success: true,
        userId
      }
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ AUTH FAILED: Missing authorization header. Environment:', {
        bypassAuth,
        isDevelopment,
        enableFallback,
        nodeEnv: process.env.NODE_ENV,
        hasAuthHeader: !!authHeader
      })
      return {
        success: false,
        error: 'Missing or invalid authorization header',
        status: 401
      }
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401
      }
    }

    return {
      success: true,
      userId: user.id
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    }
  }
}

export function createUnauthorizedResponse(message: string = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 })
}
