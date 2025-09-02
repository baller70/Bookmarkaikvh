'use client'

import dynamic from 'next/dynamic'

const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => <div className="p-10">Loading dashboard...</div>,
})

export default function DashboardClientWrapper() {
  return <DashboardClient />
}
