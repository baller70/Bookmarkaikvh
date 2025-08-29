'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ChatSidebar } from '@/components/dashboard/ChatSidebar'
import { ShadcnSidebar } from '@/components/dashboard/ShadcnSidebar'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <DashboardProvider>
        <div className="min-h-screen bg-transparent">
          <div className="flex h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-col bg-transparent">
              <ShadcnSidebar />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent side="left" className="p-0 bg-transparent">
                <ShadcnSidebar />
              </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
              {/* Mobile Header */}
              <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">AI</span>
                  </div>
                  <h1 className="font-semibold text-slate-900 dark:text-white">BookAI Mark</h1>
                </div>
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </Button>
                  </SheetTrigger>
                </Sheet>
              </div>

              {/* Page Content */}
              <main className="flex-1 overflow-y-auto bg-transparent">
                {children}
              </main>
            </div>
          </div>

        {/* Chat Sidebar */}
        <ChatSidebar />
      </div>
    </DashboardProvider>
  )
} 