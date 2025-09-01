import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getCategories() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*, bookmarks(id)')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    // Manually calculate bookmark counts as Supabase client library doesn't support aggregated counts on relations directly yet.
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      bookmarkCount: Array.isArray(category.bookmarks) ? category.bookmarks.length : 0,
    }));

    return categoriesWithCounts || []
  } catch (error) {
    console.error('Unexpected error fetching categories:', error)
    return []
  }
}
