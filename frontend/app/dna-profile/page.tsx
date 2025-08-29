'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DnaProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to about-you as the new entry point for DNA profile
    router.replace('/about-you')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting to About You...</p>
      </div>
    </div>
  )
} 