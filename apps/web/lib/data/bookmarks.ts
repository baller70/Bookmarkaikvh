import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getBookmarks() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    const { data: bookmarks, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return []
    }

    return bookmarks || []
  } catch (error) {
    console.error('Unexpected error fetching bookmarks:', error)
    return []
  }
}
