'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Upload, 
  Image, 
  Video, 
  Music, 
  FileText,
  Trash2,
  ExternalLink,
  Download
} from 'lucide-react'
import { NovelEditor } from '../../media/components/NovelEditor'
import { useMediaLibrary } from '../../media/hooks/useMediaLibrary'

interface ARPAsset {
  id: string
  type: 'image' | 'video' | 'audio' | 'document'
  name: string
  url: string
  size?: number
  uploadedAt: Date
}

interface ARPSection {
  id: string
  title: string
  content: any[] // Novel editor content
  assets: ARPAsset[]
  relatedBookmarks: string[] // bookmark IDs
  createdAt: Date
  updatedAt: Date
}

interface ARPTabProps {
  bookmarkId: string
  initialData?: ARPSection[]
  onSave?: (sections: ARPSection[]) => void
}

export const ARPTab: React.FC<ARPTabProps> = ({ 
  bookmarkId, 
  initialData = [], 
  onSave 
}) => {
  const [sections, setSections] = useState<ARPSection[]>(
    initialData.length > 0 ? initialData : [createNewSection()]
  )
  const [availableBookmarks, setAvailableBookmarks] = useState<any[]>([])
  const [isAddingBookmark, setIsAddingBookmark] = useState(false)
  const [addBookmarkMode, setAddBookmarkMode] = useState<'existing' | 'new' | null>(null)
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('')
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('')
  const { filteredFiles } = useMediaLibrary()

  // Create a new empty section
  function createNewSection(): ARPSection {
    return {
      id: `section-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      title: '',
      content: [],
      assets: [],
      relatedBookmarks: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // Load available bookmarks for related bookmarks feature
  React.useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks')
        const data = await response.json()
        if (data.success && data.bookmarks) {
          // Filter out current bookmark
          const otherBookmarks = data.bookmarks.filter((b: any) => b.id !== bookmarkId)
          setAvailableBookmarks(otherBookmarks)
        }
      } catch (error) {
        console.error('Error loading bookmarks:', error)
      }
    }
    loadBookmarks()
  }, [bookmarkId])

  const updateSection = useCallback((sectionId: string, updates: Partial<ARPSection>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates, updatedAt: new Date() }
        : section
    ))
  }, [])

  const addNewSection = useCallback(() => {
    setSections(prev => [...prev, createNewSection()])
  }, [])

  const removeSection = useCallback((sectionId: string) => {
    if (sections.length > 1) {
      setSections(prev => prev.filter(section => section.id !== sectionId))
    }
  }, [sections.length])

  const handleAssetUpload = useCallback(async (sectionId: string, files: FileList) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        // Upload file to server
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', getAssetType(file.type))
        formData.append('tags', `arp-${bookmarkId},section-${sectionId}`)

        const uploadResponse = await fetch('/api/user-data/upload', {
          method: 'POST',
          body: formData
        })

        const uploadResult = await uploadResponse.json()
        
        if (uploadResult.success) {
          const newAsset: ARPAsset = {
            id: `asset-${Date.now()}-${i}`,
            type: getAssetType(file.type),
            name: file.name,
            url: uploadResult.data.url,
            size: file.size,
            uploadedAt: new Date()
          }

          updateSection(sectionId, {
            assets: [...section.assets, newAsset]
          })
        }
      } catch (error) {
        console.error('Error uploading asset:', error)
      }
    }
  }, [sections, bookmarkId, updateSection])

  const addMediaAsset = useCallback((sectionId: string, mediaFile: any) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const newAsset: ARPAsset = {
      id: `media-asset-${Date.now()}`,
      type: getAssetType(mediaFile.type || mediaFile.mime_type),
      name: mediaFile.name,
      url: mediaFile.url,
      size: mediaFile.size,
      uploadedAt: new Date(mediaFile.uploadedAt || mediaFile.created_at)
    }

    updateSection(sectionId, {
      assets: [...section.assets, newAsset]
    })
  }, [sections, updateSection])

  const removeAsset = useCallback((sectionId: string, assetId: string) => {
    console.log('Removing asset:', { sectionId, assetId });
    const section = sections.find(s => s.id === sectionId)
    if (!section) {
      console.error('Section not found:', sectionId);
      return;
    }

    console.log('Current assets:', section.assets);
    const updatedAssets = section.assets.filter(asset => asset.id !== assetId);
    console.log('Updated assets after removal:', updatedAssets);

    updateSection(sectionId, {
      assets: updatedAssets
    })
  }, [sections, updateSection])

  const toggleRelatedBookmark = useCallback((sectionId: string, bookmarkId: string) => {
    console.log('Toggling bookmark:', { sectionId, bookmarkId });
    const section = sections.find(s => s.id === sectionId)
    if (!section) {
      console.error('Section not found:', sectionId);
      return;
    }

    const isAlreadyRelated = section.relatedBookmarks.includes(bookmarkId)
    console.log('Is already related:', isAlreadyRelated);
    console.log('Current bookmarks:', section.relatedBookmarks);
    
    const updatedBookmarks = isAlreadyRelated
      ? section.relatedBookmarks.filter(id => id !== bookmarkId)
      : [...section.relatedBookmarks, bookmarkId]
    
    console.log('Updated bookmarks:', updatedBookmarks);

    updateSection(sectionId, {
      relatedBookmarks: updatedBookmarks
    })
  }, [sections, updateSection])

  const handleAddNewBookmark = useCallback(async () => {
    if (!newBookmarkTitle.trim() || !newBookmarkUrl.trim()) return

    try {
      // Create new bookmark via API
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newBookmarkTitle.trim(),
          url: newBookmarkUrl.trim(),
          category: 'Research', // Default category for ARP bookmarks
        }),
      })

      if (response.ok) {
        const newBookmark = await response.json()
        
        // Add to available bookmarks
        setAvailableBookmarks(prev => [newBookmark, ...prev])
        
        // Reset form
        setNewBookmarkTitle('')
        setNewBookmarkUrl('')
        setIsAddingBookmark(false)
        setAddBookmarkMode(null)
      }
    } catch (error) {
      console.error('Failed to create bookmark:', error)
    }
  }, [newBookmarkTitle, newBookmarkUrl])

  const handleAddExistingBookmark = useCallback((sectionId: string, bookmarkId: string) => {
    console.log('Adding existing bookmark to section:', { sectionId, bookmarkId });
    toggleRelatedBookmark(sectionId, bookmarkId);
    // Reset form
    setIsAddingBookmark(false)
    setAddBookmarkMode(null)
  }, [toggleRelatedBookmark])

  const handleCancelAddBookmark = useCallback(() => {
    setNewBookmarkTitle('')
    setNewBookmarkUrl('')
    setIsAddingBookmark(false)
    setAddBookmarkMode(null)
  }, [])

  const getAssetType = (mimeType: string): ARPAsset['type'] => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const getAssetIcon = (type: ARPAsset['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
    }
  }

  // Save sections
  React.useEffect(() => {
    if (onSave) {
      onSave(sections)
    }
  }, [sections, onSave])

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ACTION RESEARCH PLAN</h2>
        <Badge variant="secondary">{sections.length} Section{sections.length !== 1 ? 's' : ''}</Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={section.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <Input
                      placeholder="ENTER SECTION TITLE..."
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="text-lg font-bold uppercase border-0 px-0 focus:ring-0 placeholder:text-gray-400"
                    />
                  </div>
                  {sections.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 1. Title (handled in header) */}
                
                {/* 2. Large Text Box with Novel Editor */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">CONTENT</h4>
                  <div className="border rounded-lg min-h-[200px]">
                    <NovelEditor
                      content={section.content}
                      onChange={(content) => updateSection(section.id, { content })}
                      className="min-h-[200px]"
                      placeholder="Start writing your action research plan... Press '/' for commands"
                      mediaFiles={filteredFiles}
                    />
                  </div>
                </div>

                {/* 3. Assets Section */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">ASSETS</h4>
                  
                  {/* Upload Options */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = '*/*'
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) {
                            handleAssetUpload(section.id, files)
                          }
                        }
                        input.click()
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>

                    {/* Media Library Assets */}
                    <div className="flex flex-wrap gap-1">
                      {filteredFiles.slice(0, 5).map((mediaFile) => (
                        <Button
                          key={mediaFile.id}
                          variant="ghost"
                          size="sm"
                          onClick={() => addMediaAsset(section.id, mediaFile)}
                          className="text-xs"
                        >
                          {getAssetIcon(getAssetType(mediaFile.type))}
                          <span className="ml-1 max-w-[80px] truncate">
                            {mediaFile.name}
                          </span>
                        </Button>
                      ))}
                      {filteredFiles.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{filteredFiles.length - 5} more in media
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Asset List */}
                  {section.assets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.assets.map((asset) => (
                        <Card key={asset.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              {getAssetIcon(asset.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{asset.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(asset.url, '_blank')}
                                className="h-6 w-6 p-0"
                                title="Open asset"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAsset(section.id, asset.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                title="Delete asset"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Related Bookmarks */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">RELATED BOOKMARKS</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingBookmark(!isAddingBookmark)}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Bookmark
                    </Button>
                  </div>
                  
                  {/* Add Bookmark Options */}
                  {isAddingBookmark && (
                    <Card className="p-3 mb-4 border-dashed">
                      {!addBookmarkMode ? (
                        // Choose mode
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">Choose an option:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAddBookmarkMode('existing')}
                              className="flex flex-col items-center p-4 h-auto"
                            >
                              <Plus className="h-4 w-4 mb-1" />
                              <span className="text-xs">Add Existing</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAddBookmarkMode('new')}
                              className="flex flex-col items-center p-4 h-auto"
                            >
                              <Plus className="h-4 w-4 mb-1" />
                              <span className="text-xs">Create New</span>
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelAddBookmark}
                            className="text-xs w-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : addBookmarkMode === 'existing' ? (
                        // Add existing bookmark
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Select existing bookmark:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddBookmarkMode(null)}
                              className="text-xs"
                            >
                              Back
                            </Button>
                          </div>
                          <ScrollArea className="h-48 w-full rounded-lg border p-2">
                            <div className="space-y-2">
                              {availableBookmarks.filter(bookmark => !section.relatedBookmarks.includes(bookmark.id)).map((bookmark) => (
                                <div
                                  key={bookmark.id}
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 cursor-pointer border border-gray-200 hover:border-blue-300 transition-all duration-200"
                                  onClick={() => handleAddExistingBookmark(section.id, bookmark.id)}
                                >
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-xs text-white">
                                      {bookmark.title?.[0]?.toUpperCase() || 'B'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{bookmark.title}</p>
                                      <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {availableBookmarks.filter(bookmark => !section.relatedBookmarks.includes(bookmark.id)).length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No available bookmarks to add</p>
                              )}
                            </div>
                          </ScrollArea>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelAddBookmark}
                            className="text-xs w-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        // Create new bookmark
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Create new bookmark:</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddBookmarkMode(null)}
                              className="text-xs"
                            >
                              Back
                            </Button>
                          </div>
                          <div>
                            <Input
                              placeholder="Bookmark title..."
                              value={newBookmarkTitle}
                              onChange={(e) => setNewBookmarkTitle(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Input
                              placeholder="https://example.com"
                              value={newBookmarkUrl}
                              onChange={(e) => setNewBookmarkUrl(e.target.value)}
                              className="text-sm"
                              type="url"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={handleAddNewBookmark}
                              disabled={!newBookmarkTitle.trim() || !newBookmarkUrl.trim()}
                              className="text-xs"
                            >
                              Create Bookmark
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelAddBookmark}
                              className="text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                  
                  {/* Available Bookmarks to Add */}
                  <div className="mb-4">
                    <ScrollArea className="h-32">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableBookmarks.map((bookmark) => {
                          const isRelated = section.relatedBookmarks.includes(bookmark.id)
                          return (
                            <Button
                              key={bookmark.id}
                              variant={isRelated ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleRelatedBookmark(section.id, bookmark.id)}
                              className="justify-start text-left h-auto p-2"
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                                  {bookmark.title?.[0]?.toUpperCase() || 'B'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{bookmark.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
                                </div>
                              </div>
                            </Button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected Related Bookmarks */}
                  {section.relatedBookmarks.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Selected ({section.relatedBookmarks.length}):</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {section.relatedBookmarks.map((bookmarkId) => {
                          const bookmark = availableBookmarks.find(b => b.id === bookmarkId)
                          if (!bookmark) return null
                          
                          return (
                            <Card key={bookmarkId} className="p-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center text-xs text-white">
                                    {bookmark.title?.[0]?.toUpperCase() || 'B'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate">{bookmark.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{bookmark.url}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleRelatedBookmark(section.id, bookmarkId)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  title="Remove bookmark"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section Separator */}
                {index < sections.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </CardContent>
            </Card>
          ))}

          {/* 5. Add New Section Button */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <CardContent className="p-8">
              <Button
                variant="ghost"
                onClick={addNewSection}
                className="w-full h-20 text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-2"
              >
                <Plus className="h-8 w-8" />
                <span className="text-lg">Add New Section</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
