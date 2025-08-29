'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { BrainCircuit, Database, Clock, Users, FileText, Trash2, Save, RotateCcw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getOracleSetting, saveOracleSetting } from '@/lib/user-settings-service'

interface ContextSettings {
  memoryEnabled: boolean
  conversationHistory: number
  contextWindow: number
  personalityMemory: boolean
  preferencesMemory: boolean
  factualMemory: boolean
  emotionalContext: boolean
  conversationSummary: boolean
  longTermMemory: boolean
  memoryRetention: number
  contextPriority: 'recent' | 'relevant' | 'important'
  memoryCompression: boolean
  crossSessionMemory: boolean
  userProfileBuilding: boolean
  contextSharing: boolean
  memoryCategories: string[]
  forgetThreshold: number
  memoryBackup: boolean
  contextAnalysis: boolean
  semanticSearch: boolean
}

const defaultSettings: ContextSettings = {
  memoryEnabled: true,
  conversationHistory: 50,
  contextWindow: 4000,
  personalityMemory: true,
  preferencesMemory: true,
  factualMemory: true,
  emotionalContext: false,
  conversationSummary: true,
  longTermMemory: false,
  memoryRetention: 30,
  contextPriority: 'relevant',
  memoryCompression: true,
  crossSessionMemory: true,
  userProfileBuilding: true,
  contextSharing: false,
  memoryCategories: ['preferences', 'facts', 'conversations', 'projects'],
  forgetThreshold: 90,
  memoryBackup: true,
  contextAnalysis: true,
  semanticSearch: true
}

export default function ContextPage() {
  const [settings, setSettings] = useState<ContextSettings>(defaultSettings)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        try {
          const remote = await getOracleSetting<ContextSettings>(user.id, 'context', defaultSettings)
          setSettings(remote)
        } catch (error) {
          console.error('Failed to load context settings:', error)
        }
      }
    })()
  }, [])

  const updateSetting = (key: keyof ContextSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const saveSettings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      try {
        await saveOracleSetting<ContextSettings>(user.id, 'context', settings)
      } catch (error) {
        console.error('Failed to save context settings:', error)
        toast.error('Failed to save context settings')
        return
      }
    }
    setHasUnsavedChanges(false)
    toast.success('Context settings saved successfully')
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setHasUnsavedChanges(true)
    toast.info('Settings reset to defaults')
  }

  const addCategory = () => {
    if (newCategory.trim() && !settings.memoryCategories.includes(newCategory.trim())) {
      updateSetting('memoryCategories', [...settings.memoryCategories, newCategory.trim()])
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    updateSetting('memoryCategories', settings.memoryCategories.filter(c => c !== category))
  }

  const clearAllMemory = () => {
    // Simulate clearing memory
    toast.success('All memory cleared successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Oracle AI Chatbot - Context</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetSettings}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={saveSettings}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Memory Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Memory & Context</span>
          </CardTitle>
          <CardDescription>
            Configure how Oracle AI remembers and uses conversation context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Memory</Label>
              <p className="text-sm text-muted-foreground">Allow Oracle AI to remember conversations</p>
            </div>
            <Switch
              checked={settings.memoryEnabled}
              onCheckedChange={(checked) => updateSetting('memoryEnabled', checked)}
            />
          </div>

          {settings.memoryEnabled && (
            <>
              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Conversation History: {settings.conversationHistory} messages</Label>
                  <Slider
                    value={[settings.conversationHistory]}
                    onValueChange={(value) => updateSetting('conversationHistory', value[0])}
                    max={200}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of recent messages to keep in active memory
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Context Window: {settings.contextWindow} tokens</Label>
                  <Slider
                    value={[settings.contextWindow]}
                    onValueChange={(value) => updateSetting('contextWindow', value[0])}
                    max={8192}
                    min={1024}
                    step={512}
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum context size for processing
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Context Priority</Label>
                <Select value={settings.contextPriority} onValueChange={(value) => updateSetting('contextPriority', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent - Prioritize latest messages</SelectItem>
                    <SelectItem value="relevant">Relevant - Prioritize contextually relevant content</SelectItem>
                    <SelectItem value="important">Important - Prioritize marked important content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Memory Types */}
      {settings.memoryEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Memory Types</span>
            </CardTitle>
            <CardDescription>
              Choose what types of information Oracle AI should remember
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Personality Memory</Label>
                <p className="text-sm text-muted-foreground">Remember user personality and communication style</p>
              </div>
              <Switch
                checked={settings.personalityMemory}
                onCheckedChange={(checked) => updateSetting('personalityMemory', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Preferences Memory</Label>
                <p className="text-sm text-muted-foreground">Remember user preferences and settings</p>
              </div>
              <Switch
                checked={settings.preferencesMemory}
                onCheckedChange={(checked) => updateSetting('preferencesMemory', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Factual Memory</Label>
                <p className="text-sm text-muted-foreground">Remember facts and information shared</p>
              </div>
              <Switch
                checked={settings.factualMemory}
                onCheckedChange={(checked) => updateSetting('factualMemory', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Emotional Context</Label>
                <p className="text-sm text-muted-foreground">Remember emotional context and mood</p>
              </div>
              <Switch
                checked={settings.emotionalContext}
                onCheckedChange={(checked) => updateSetting('emotionalContext', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Conversation Summary</Label>
                <p className="text-sm text-muted-foreground">Create summaries of long conversations</p>
              </div>
              <Switch
                checked={settings.conversationSummary}
                onCheckedChange={(checked) => updateSetting('conversationSummary', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Long-term Memory</Label>
                <p className="text-sm text-muted-foreground">Store information across sessions</p>
              </div>
              <Switch
                checked={settings.longTermMemory}
                onCheckedChange={(checked) => updateSetting('longTermMemory', checked)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Memory Settings */}
      {settings.memoryEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Advanced Memory Settings</span>
            </CardTitle>
            <CardDescription>
              Fine-tune memory behavior and retention policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Memory Retention: {settings.memoryRetention} days</Label>
              <Slider
                value={[settings.memoryRetention]}
                onValueChange={(value) => updateSetting('memoryRetention', value[0])}
                max={365}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                How long to keep memories before automatic cleanup
              </p>
            </div>

            <div className="space-y-3">
              <Label>Forget Threshold: {settings.forgetThreshold} days</Label>
              <Slider
                value={[settings.forgetThreshold]}
                onValueChange={(value) => updateSetting('forgetThreshold', value[0])}
                max={365}
                min={7}
                step={7}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Automatically forget unused memories after this period
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Memory Compression</Label>
                  <p className="text-sm text-muted-foreground">Compress older memories to save space</p>
                </div>
                <Switch
                  checked={settings.memoryCompression}
                  onCheckedChange={(checked) => updateSetting('memoryCompression', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cross-session Memory</Label>
                  <p className="text-sm text-muted-foreground">Remember context between different chat sessions</p>
                </div>
                <Switch
                  checked={settings.crossSessionMemory}
                  onCheckedChange={(checked) => updateSetting('crossSessionMemory', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Profile Building</Label>
                  <p className="text-sm text-muted-foreground">Build a comprehensive user profile over time</p>
                </div>
                <Switch
                  checked={settings.userProfileBuilding}
                  onCheckedChange={(checked) => updateSetting('userProfileBuilding', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Context Sharing</Label>
                  <p className="text-sm text-muted-foreground">Share context with other AI assistants (if applicable)</p>
                </div>
                <Switch
                  checked={settings.contextSharing}
                  onCheckedChange={(checked) => updateSetting('contextSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Memory Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup memory data</p>
                </div>
                <Switch
                  checked={settings.memoryBackup}
                  onCheckedChange={(checked) => updateSetting('memoryBackup', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Context Analysis</Label>
                  <p className="text-sm text-muted-foreground">Analyze conversation patterns and topics</p>
                </div>
                <Switch
                  checked={settings.contextAnalysis}
                  onCheckedChange={(checked) => updateSetting('contextAnalysis', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Semantic Search</Label>
                  <p className="text-sm text-muted-foreground">Enable semantic search through memories</p>
                </div>
                <Switch
                  checked={settings.semanticSearch}
                  onCheckedChange={(checked) => updateSetting('semanticSearch', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Categories */}
      {settings.memoryEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Memory Categories</span>
            </CardTitle>
            <CardDescription>
              Organize memories into categories for better retrieval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.memoryCategories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <button
                    onClick={() => removeCategory(category)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add new category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                className="flex-1"
              />
              <Button onClick={addCategory} disabled={!newCategory.trim()}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Management */}
      {settings.memoryEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Management</CardTitle>
            <CardDescription>
              Manage and maintain Oracle AI memory data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Memory Usage</Label>
                  <div className="text-2xl font-bold">2.4 MB</div>
                  <p className="text-xs text-muted-foreground">
                    {settings.conversationHistory} conversations stored
                  </p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Retention Period</Label>
                  <div className="text-2xl font-bold">{settings.memoryRetention}d</div>
                  <p className="text-xs text-muted-foreground">
                    Automatic cleanup enabled
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={clearAllMemory}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Memory
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This action cannot be undone. All conversation history and learned preferences will be permanently deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 