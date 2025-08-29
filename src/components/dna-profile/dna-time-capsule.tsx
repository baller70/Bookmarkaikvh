'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock,
  Camera,
  History,
  Bookmark,
  Folder as FolderIcon,
  Tag,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'

interface TimeCapsule {
  id: string
  name: string
  description: string
  createdAt: Date
  type: 'manual' | 'scheduled' | 'auto'
  bookmarkCount: number
}

export default function DnaTimeCapsule() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCapsules()
  }, [])

  const fetchCapsules = async () => {
    setLoading(true)
    try {
      // In a real app, this would fetch from an API
      // For now, we simulate an empty state as the DB is empty
      setCapsules([])
    } catch (error) {
      toast.error('Failed to load time capsules.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCapsule = () => {
    toast.info('This feature is not yet implemented.')
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading Time Capsules...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Capsule</h2>
          <p className="text-gray-600">Versioned snapshots of your bookmark collection</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateCapsule}>
            <Camera className="h-4 w-4 mr-2" />
            Create Snapshot
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Your Time Capsules</CardTitle>
        </CardHeader>
        <CardContent>
          {capsules.length > 0 ? (
            <div className="space-y-4">
              {capsules.map(capsule => (
                <Card key={capsule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-sm">{capsule.name}</h3>
                      <Badge variant={capsule.type === 'manual' ? 'default' : 'secondary'}>
                        {capsule.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{capsule.description}</p>
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                           <Bookmark className="h-3 w-3 mr-1" />
                           {capsule.bookmarkCount}
                        </div>
                      <span className="text-gray-600">{new Date(capsule.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Time Capsules Yet</h3>
              <p className="text-gray-600 mb-4">Create your first snapshot to start your Time Capsule.</p>
              <Button onClick={handleCreateCapsule}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Snapshot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 