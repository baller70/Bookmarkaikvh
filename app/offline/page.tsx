'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  WifiOff, 
  RefreshCw, 
  Bookmark, 
  Search, 
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDeviceInfo, useNetworkStatus } from '@/hooks/use-mobile'

export default function OfflinePage() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [offlineBookmarks, setOfflineBookmarks] = useState<any[]>([])
  
  const { isMobile } = useDeviceInfo()
  const { isOnline, effectiveType } = useNetworkStatus()

  useEffect(() => {
    // Load cached bookmarks from localStorage
    const loadOfflineBookmarks = () => {
      try {
        const cached = localStorage.getItem('bookaimark-offline-bookmarks')
        if (cached) {
          setOfflineBookmarks(JSON.parse(cached))
        }
        
        const lastSync = localStorage.getItem('bookaimark-last-sync')
        if (lastSync) {
          setLastSyncTime(new Date(lastSync))
        }
      } catch (error) {
        console.error('Failed to load offline data:', error)
      }
    }

    loadOfflineBookmarks()
  }, [])

  const handleRetryConnection = async () => {
    setIsRetrying(true)
    
    try {
      // Try to fetch a simple endpoint to test connectivity
      const response = await fetch('/api/health', { 
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        // Connection restored, redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        throw new Error('Connection test failed')
      }
    } catch (error) {
      console.log('Still offline')
    } finally {
      setIsRetrying(false)
    }
  }

  const handleViewCachedBookmarks = () => {
    // Navigate to dashboard with offline mode
    window.location.href = '/dashboard?offline=true'
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="mobile-title">BookAI Mark</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mobile-container mobile-section">
        <div className="max-w-md mx-auto space-y-6">
          {/* Offline Status Card */}
          <Card className="mobile-card text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="h-8 w-8 text-slate-400" />
              </div>
              
              <h2 className="mobile-subtitle mb-2">You're Offline</h2>
              <p className="mobile-body text-slate-500 mb-6">
                No internet connection detected. Don't worry, you can still access your cached bookmarks.
              </p>

              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isOnline ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
                {effectiveType && (
                  <Badge variant="outline" className="text-xs">
                    {effectiveType.toUpperCase()}
                  </Badge>
                )}
              </div>

              <Button
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="mobile-button w-full"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Offline Features */}
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Available Offline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleViewCachedBookmarks}
                className="w-full justify-start gap-3 h-12"
                disabled={offlineBookmarks.length === 0}
              >
                <Bookmark className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Cached Bookmarks</div>
                  <div className="text-xs text-slate-500">
                    {offlineBookmarks.length} bookmarks available
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                disabled
              >
                <Search className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Search Cache</div>
                  <div className="text-xs text-slate-500">
                    Search your offline bookmarks
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => window.location.href = '/settings'}
              >
                <Settings className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Settings</div>
                  <div className="text-xs text-slate-500">
                    Manage offline preferences
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Sync Status */}
          {lastSyncTime && (
            <Card className="mobile-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="font-medium text-sm">Last Sync</div>
                    <div className="text-xs text-slate-500">
                      {lastSyncTime.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Offline Tips */}
          <Card className="mobile-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Offline Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Cached Content</div>
                  <div className="text-slate-500">
                    Your recently viewed bookmarks are available offline
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Auto Sync</div>
                  <div className="text-slate-500">
                    Changes will sync automatically when connection is restored
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Background Updates</div>
                  <div className="text-slate-500">
                    New bookmarks will be downloaded in the background
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Info (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="text-sm">Network Debug</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>Online: {isOnline ? 'Yes' : 'No'}</div>
                <div>Connection: {effectiveType}</div>
                <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-slate-500">
          BookAIMark works offline to keep your bookmarks accessible anywhere
        </p>
      </footer>
    </div>
  )
} 