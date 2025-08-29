import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { appLogger } from '@/apps/web/lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://localhost-placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  appLogger.warn('[supabase] Missing NEXT_PUBLIC_* envs. Using placeholders for build safety.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
<<<<<<< HEAD
  auth: { persistSession: false, autoRefreshToken: false }
})
=======
  auth: {
    persistSession: false, // We don't use Supabase auth
    autoRefreshToken: false,
  }
})  
>>>>>>> devin/1752953929-backend-infrastructure-fixes
