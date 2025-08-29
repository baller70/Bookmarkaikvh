import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Demo user ID for testing without authentication
export const DEMO_USER_ID = 'demo-user-for-testing'

// Enhanced Supabase client that works in demo mode
export function createDemoSupabaseClient() {
  try {
    const supabase = createClientComponentClient()
    
    // Wrap the auth.getUser method to return demo user when no real user
    const originalGetUser = supabase.auth.getUser.bind(supabase.auth)
    supabase.auth.getUser = async () => {
      try {
        const result = await originalGetUser()
        if (result.error || !result.data.user) {
          // Return demo user for testing
          return {
            data: { 
              user: { 
                id: DEMO_USER_ID,
                email: 'demo@bookaimark.com',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                app_metadata: {},
                user_metadata: {}
              } 
            },
            error: null
          }
        }
        return result
      } catch (error) {
        // Return demo user on any auth error
        return {
          data: { 
            user: { 
              id: DEMO_USER_ID,
              email: 'demo@bookaimark.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {}
            } 
          },
          error: null
        }
      }
    }
    
    return supabase
  } catch (error) {
    console.warn('Supabase client creation failed, using mock mode:', error)
    
    // Return a mock client for development
    return {
      auth: {
        getUser: () => Promise.resolve({ 
          data: { 
            user: { 
              id: DEMO_USER_ID,
              email: 'demo@bookaimark.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {}
            } 
          }, 
          error: null 
        }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Demo mode - authentication disabled' } 
        })
      },
      from: (table: string) => ({
        upsert: (data: any) => {
          console.log(`Demo Supabase: Would upsert to ${table}:`, data)
          return Promise.resolve({ error: null })
        },
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ 
              data: null, 
              error: { message: 'No data found in demo mode' } 
            }),
            maybeSingle: () => Promise.resolve({ 
              data: null, 
              error: null 
            })
          })
        }),
        insert: (data: any) => {
          console.log(`Demo Supabase: Would insert to ${table}:`, data)
          return Promise.resolve({ error: null })
        },
        update: (data: any) => ({
          eq: () => {
            console.log(`Demo Supabase: Would update ${table}:`, data)
            return Promise.resolve({ error: null })
          }
        }),
        delete: () => ({
          eq: () => {
            console.log(`Demo Supabase: Would delete from ${table}`)
            return Promise.resolve({ error: null })
          }
        })
      }),
      storage: {
        from: (bucket: string) => ({
          upload: (path: string, file: File, options?: any) => {
            console.log(`Demo Supabase: Would upload to ${bucket}/${path}:`, file.name, options)
            return Promise.resolve({ 
              error: null,
              data: { path: `demo/${path}` }
            })
          },
          getPublicUrl: (path: string) => ({
            data: { 
              publicUrl: `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}` 
            }
          })
        })
      }
    }
  }
}

// Helper function to get demo user ID consistently
export function getDemoUserId(): string {
  return DEMO_USER_ID
}

// Helper function to check if we're in demo mode
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
} 