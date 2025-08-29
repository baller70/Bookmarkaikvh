// BookAIMark Service Worker for Mobile Offline Functionality
const CACHE_NAME = 'bookaimark-v1.0.0'
const OFFLINE_CACHE = 'bookaimark-offline-v1.0.0'
const RUNTIME_CACHE = 'bookaimark-runtime-v1.0.0'

// Assets to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  // Core CSS and JS (will be added by build process)
]

// API endpoints that should work offline
const OFFLINE_FALLBACK_PAGES = [
  '/dashboard',
  '/offline'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('📦 Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      
      // Cache offline fallback page
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('📦 Caching offline page')
        return cache.add('/offline')
      })
    ]).then(() => {
      console.log('✅ Service Worker installed successfully')
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== OFFLINE_CACHE && 
              cacheName !== RUNTIME_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Service Worker activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (!url.origin.includes(self.location.origin)) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle page requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle asset requests
  event.respondWith(handleAssetRequest(request))
})

// Handle API requests with offline fallback
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', url.pathname)
    
    // Try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline data for bookmarks
    if (url.pathname === '/api/bookmarks') {
      return new Response(JSON.stringify(getOfflineBookmarks()), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Return empty response for other APIs
    return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log('🔄 Navigation offline, serving cached page')
    
    // Try to serve cached page
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Serve offline page
    return caches.match('/offline')
  }
}

// Handle asset requests
async function handleAssetRequest(request) {
  // Try cache first for assets
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    // Try network
    const networkResponse = await fetch(request)
    
    // Cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🔄 Asset request failed:', request.url)
    
    // Return a fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#9ca3af">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    
    throw error
  }
}

// Get offline bookmarks from localStorage fallback
function getOfflineBookmarks() {
  // This would be populated by the app when online
  return [
    {
      id: 'offline-1',
      title: 'Offline Mode Active',
      url: 'https://offline.local',
      description: 'You are currently offline. Your bookmarks will sync when you reconnect.',
      category: 'System',
      tags: ['offline'],
      favicon: '/favicon.ico',
      is_favorite: false,
      visits: 0,
      created_at: new Date().toISOString(),
      offline: true
    }
  ]
}

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag)
  
  if (event.tag === 'bookmark-sync') {
    event.waitUntil(syncBookmarks())
  }
})

// Sync bookmarks when online
async function syncBookmarks() {
  try {
    // Get pending bookmarks from IndexedDB
    const pendingBookmarks = await getPendingBookmarks()
    
    for (const bookmark of pendingBookmarks) {
      try {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookmark)
        })
        
        // Remove from pending list
        await removePendingBookmark(bookmark.id)
      } catch (error) {
        console.error('Failed to sync bookmark:', error)
      }
    }
    
    console.log('✅ Bookmark sync completed')
  } catch (error) {
    console.error('❌ Bookmark sync failed:', error)
  }
}

// IndexedDB helpers for offline storage
async function getPendingBookmarks() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bookaimark-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pending-bookmarks'], 'readonly')
      const store = transaction.objectStore('pending-bookmarks')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result)
      getAllRequest.onerror = () => reject(getAllRequest.error)
    }
    
    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore('pending-bookmarks', { keyPath: 'id' })
    }
  })
}

async function removePendingBookmark(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('bookaimark-offline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pending-bookmarks'], 'readwrite')
      const store = transaction.objectStore('pending-bookmarks')
      const deleteRequest = store.delete(id)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('📱 Push notification received')
  
  if (!event.data) return
  
  try {
    const data = event.data.json()
    
    const options = {
      body: data.body || 'New bookmark update available',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: data.tag || 'bookmark-update',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-dismiss.png'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'BookAIMark', options)
    )
  } catch (error) {
    console.error('Error handling push notification:', error)
  }
})

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('📱 Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return
  } else {
    // Default click action
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('📨 Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_BOOKMARK') {
    cacheBookmark(event.data.bookmark)
  }
})

// Cache bookmark for offline access
async function cacheBookmark(bookmark) {
  try {
    const cache = await caches.open(RUNTIME_CACHE)
    
    // Cache the bookmark data
    await cache.put(
      `/api/bookmarks/${bookmark.id}`,
      new Response(JSON.stringify(bookmark), {
        headers: { 'Content-Type': 'application/json' }
      })
    )
    
    // Cache the favicon if available
    if (bookmark.favicon) {
      try {
        const faviconResponse = await fetch(bookmark.favicon)
        if (faviconResponse.ok) {
          await cache.put(bookmark.favicon, faviconResponse)
        }
      } catch (error) {
        console.log('Failed to cache favicon:', error)
      }
    }
    
    console.log('✅ Bookmark cached for offline access')
  } catch (error) {
    console.error('❌ Failed to cache bookmark:', error)
  }
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  console.log('🔄 Periodic sync triggered:', event.tag)
  
  if (event.tag === 'bookmark-backup') {
    event.waitUntil(performBookmarkBackup())
  }
})

// Perform bookmark backup
async function performBookmarkBackup() {
  try {
    const response = await fetch('/api/bookmarks/backup')
    if (response.ok) {
      console.log('✅ Bookmark backup completed')
    }
  } catch (error) {
    console.error('❌ Bookmark backup failed:', error)
  }
}

console.log('🚀 BookAIMark Service Worker loaded') 