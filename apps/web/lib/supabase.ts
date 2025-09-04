import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { appLogger } from '@/lib/logger'

// Get environment variables with fallbacks for development - TRIM to remove newlines!
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost-placeholder.supabase.co').trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key').trim()

// Only throw errors in production or if explicitly required
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required in production')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required in production')
}

// Log warning in development if using placeholder values
if (process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    appLogger.warn('NEXT_PUBLIC_SUPABASE_URL not found. Using placeholder. Add your Supabase URL to .env.local')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    appLogger.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY not found. Using placeholder. Add your Supabase anon key to .env.local')
  }
}

// Singleton pattern to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Client for public operations (uses RLS with Clerk user ID)
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We don't use Supabase auth
        autoRefreshToken: false,
      }
    });
  }
  return supabaseInstance;
})(); 