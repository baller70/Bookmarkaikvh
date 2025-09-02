'use client'

import dynamic from 'next/dynamic'

const DashboardSimple = dynamic(() => import('./DashboardSimple'), {
  ssr: false,
  loading: () => <div className="p-10">Loading dashboard...</div>,
})

export default function DashboardClientWrapper() {
  return <DashboardSimple />
}
