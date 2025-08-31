'use client'

import { useState } from 'react'

export default function TestBookmark() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testBookmarkCreation = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🚀 Testing bookmark creation...')
      
      const requestBody = {
        title: 'Test Bookmark from Test Page',
        url: 'https://example.com/test-page',
        description: 'Testing bookmark creation from test page',
        category: 'Development',
        tags: ['test', 'debug'],
        notes: 'Test notes',
        userId: 'dev-user-123',
        enableAI: true
      }
      
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      })
      
    } catch (error) {
      console.error('❌ Error:', error)
      setResult({
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bookmark Creation Test</h1>
        
        <button
          onClick={testBookmarkCreation}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium mb-6"
        >
          {loading ? 'Testing...' : 'Test Bookmark Creation'}
        </button>
        
        {result && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Result:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Open Developer Tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click "Test Bookmark Creation" button</li>
            <li>Check console logs and result below</li>
            <li>Compare with main dashboard bookmark creation</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
