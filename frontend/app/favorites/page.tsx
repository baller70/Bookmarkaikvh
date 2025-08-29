'use client'

import { FavoritesPage } from '@/src/components/dna-profile/favorites-page'
import DnaTabsWrapper from '@/src/components/dna-profile/dna-tabs-wrapper'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import React from 'react'

export default function Favorites() {
  const supabase = createClientComponentClient()
  const [userId, setUserId] = React.useState<string>('dev-user-123')

  React.useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      if (session?.user?.id) setUserId(session.user.id)
    }).catch(() => {})
    return () => { isMounted = false }
  }, [supabase])

  return (
    <>
      <DnaTabsWrapper />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FavoritesPage userId={userId} />
        </div>
      </div>
    </>
  )
} 