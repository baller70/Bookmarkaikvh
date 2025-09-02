'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => <div className="p-10">Loading dashboard...</div>,
})

class DashboardErrorBoundary extends React.Component<React.PropsWithChildren, { hasError: boolean; error?: any }>{
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, info: any) {
    console.error('Dashboard error:', error, info)
  }
  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || String(this.state.error || 'Unknown error')
      return (
        <div className="p-6 text-red-600">
          <div className="font-semibold mb-2">Dashboard error:</div>
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function DashboardClientWrapper() {
  return (
    <DashboardErrorBoundary>
      <DashboardClient />
    </DashboardErrorBoundary>
  )
}
