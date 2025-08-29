'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Plus,
  Search,
  Music,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface PlaybookData {
  id: string
  name: string
  description: string
  bookmarks: any[]
}

export default function DnaPlaybooks() {
  const [playbooks, setPlaybooks] = useState<PlaybookData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPlaybooks()
  }, [])

  const loadPlaybooks = async () => {
    try {
      setIsLoading(true)
      // This would fetch from /api/playbooks in a real app
      // Simulating empty response for now
      setPlaybooks([])
    } catch (error) {
      console.error('Error loading playbooks:', error)
      toast.error('Failed to load playbooks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlaybook = () => {
    toast.info('Feature coming soon!')
  }

  const handleAIGenerate = () => {
    toast.info('AI generation coming soon!')
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Playbooks</h2>
          <p className="text-gray-600">Spotify for your bookmarks</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleAIGenerate}>
            <Sparkles className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={handleCreatePlaybook}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playbook
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
           <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Music className="h-5 w-5 mr-2" />
            Playbooks
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 text-center text-gray-500">
            <Music className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No playbooks found</p>
            <p className="text-sm">Create your first playbook to get started</p>
        </div>
      </CardContent>
    </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                           <Button disabled>
                               <Play className="h-4 w-4" />
                           </Button>
                      </div>
                  </div>
              </CardContent>
            </Card>
            <Card>
                <CardContent className="p-8 text-center text-gray-500">
                    <p>Select a playbook to see its contents.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
} 