'use client'

import DnaProfileLayout from '@/src/components/dna-profile/dna-profile-layout'
import { AboutYouComponent } from '@/src/components/dna-profile/about-you'

export default function DnaProfilePage() {
  return (
    <DnaProfileLayout 
      title="About You" 
      description="Tell us about yourself to get personalized AI recommendations"
    >
      <AboutYouComponent />
    </DnaProfileLayout>
  )
} 