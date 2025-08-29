'use client'

import { AboutYouComponent } from '@/src/components/dna-profile/about-you'
import DnaTabsWrapper from '@/src/components/dna-profile/dna-tabs-wrapper'

export default function AboutYouPage() {
  return (
    <>
      <DnaTabsWrapper />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AboutYouComponent />
        </div>
      </div>
    </>
  )
} 