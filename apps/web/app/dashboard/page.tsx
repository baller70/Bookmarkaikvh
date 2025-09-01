import DashboardClient from './DashboardClient'
import { getBookmarks } from '@/lib/data/bookmarks'
import { getCategories } from '@/lib/data/categories'
import { getTags } from '@/lib/data/tags'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const initialBookmarks = await getBookmarks()
  const initialCategories = await getCategories()
  const availableTags = await getTags()

  // Here, initialFolders can be derived from categories or fetched separately if needed.
  // For now, we'll pass categories as the basis for folders.
  const initialFolders = initialCategories.map(c => ({
    id: c.id,
    name: c.name,
    color: c.color,
    description: c.description,
    bookmarkCount: c.bookmarkCount
  }))

  return (
    <DashboardClient
      initialBookmarks={initialBookmarks}
      initialFolders={initialFolders}
      availableTags={availableTags}
      availableCategories={initialCategories}
    />
  )
}
