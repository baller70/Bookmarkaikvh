import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    BYPASS_AUTHENTICATION: process.env.BYPASS_AUTHENTICATION,
    ENABLE_FILE_STORAGE_FALLBACK: process.env.ENABLE_FILE_STORAGE_FALLBACK,
    // Don't expose sensitive keys, just check if they exist
    HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    timestamp: new Date().toISOString()
  })
}
