import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client using auth helpers
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Alternative client using direct createClient (fallback)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Default export for backward compatibility
export default supabase 