'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  User, HelpCircle, SlidersHorizontal, LayoutList, Tag, Globe,
  ListChecks, Download
} from 'lucide-react'

const nav = [
  { href: '/settings/dna/about-you',         label: 'About You',            icon: User },
  { href: '/settings/dna/insight-questions', label: 'Insights',            icon: HelpCircle },
  { href: '/settings/dna/importance',        label: 'Importance',          icon: SlidersHorizontal },
  { href: '/settings/dna/content-channels',  label: 'Content & Channels',  icon: LayoutList },
  { href: '/settings/dna/tags-filters',      label: 'Tags & Filters',      icon: Tag },
  { href: '/settings/dna/site-preference',   label: 'Site Preference',     icon: Globe },
  { href: '/settings/dna/recommendations',   label: 'Recommendations',     icon: ListChecks },
  { href: '/settings/dna/review-save',       label: 'Review & Save',       icon: Download }
]

export default function DNALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Bookmark DNA Profile</h1>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        {/* Sidebar */}
        <ScrollArea className="hidden lg:block w-56 shrink-0 rounded-lg border bg-white p-2 h-fit">
          <div className="space-y-1">
            {nav.map(item => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors',
                    pathname.startsWith(item.href) && 'bg-muted font-medium text-primary'
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        {/* Main content */}
        <div className="flex-1 w-full p-6 bg-white rounded-lg shadow-sm min-h-[600px]">
          {children}
        </div>
      </div>
    </div>
  )
}
