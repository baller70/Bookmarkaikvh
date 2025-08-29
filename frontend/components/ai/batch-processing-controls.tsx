'use client'

import React, { useState, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Upload, 
  Download, 
  Filter, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  FileText,
  Tags,
  Folder,
  Brain,
  Loader2,
  RefreshCw,
  BarChart3,
  Sliders,
  Target,
  Database,
  Globe,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { useAIProcessing } from '@/hooks/use-ai-processing'

interface BatchJobConfig {
  type: 'auto-processing' | 'bulk-upload' | 'categorization' | 'tagging' | 'validation' | 'recommendation'
  name: string
  description: string
  settings: {
    // Processing settings
    batchSize: number
    concurrency: number
    timeout: number
    retryAttempts: number
    
    // AI settings
    aiProvider: 'openai' | 'anthropic' | 'google'
    model: string
    temperature: number
    maxTokens: number
    
    // Feature flags
    autoTagging: boolean
    categoryDetection: boolean
    duplicateDetection: boolean
    qualityScoring: boolean
    contentAnalysis: boolean
    
    // Filters
    includeCategories: string[]
    excludeCategories: string[]
    minConfidence: number
    
    // Advanced
    customPrompts: Record<string, string>
    webhookUrl?: string
    notificationEmail?: string
  }
  schedule?: {
    enabled: boolean
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
    time?: string
    dayOfWeek?: number
    dayOfMonth?: number
  }
}

interface BatchProcessingControlsProps {
  className?: string
  onJobStart?: (jobId: string) => void
  onJobComplete?: (jobId: string, results: any) => void
}

const defaultJobConfig: BatchJobConfig = {
  type: 'auto-processing',
  name: 'New Batch Job',
  description: 'AI processing batch job',
  settings: {
    batchSize: 50,
    concurrency: 3,
    timeout: 300,
    retryAttempts: 2,
    aiProvider: 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1000,
    autoTagging: true,
    categoryDetection: true,
    duplicateDetection: true,
    qualityScoring: false,
    contentAnalysis: true,
    includeCategories: [],
    excludeCategories: [],
    minConfidence: 0.7,
    customPrompts: {}
  }
}

export function BatchProcessingControls({ 
  className = '',
  onJobStart,
  onJobComplete 
}: BatchProcessingControlsProps) {
  const {
    jobs,
    stats,
    loading,
    startJob,
    pauseJob,
    cancelJob,
    updateJobSettings,
    filterJobsByStatus
  } = useAIProcessing()

  // State
  const [jobConfig, setJobConfig] = useState<BatchJobConfig>(defaultJobConfig)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [selectedJobType, setSelectedJobType] = useState<string>('auto-processing')
  const [isStarting, setIsStarting] = useState(false)
  const [presets, setPresets] = useState<BatchJobConfig[]>([])

  // Load presets from localStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem('ai-batch-presets')
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets))
      } catch (error) {
        console.error('Error loading presets:', error)
      }
    }
  }, [])

  // Save presets to localStorage
  const savePresets = (newPresets: BatchJobConfig[]) => {
    setPresets(newPresets)
    localStorage.setItem('ai-batch-presets', JSON.stringify(newPresets))
  }

  // Job type configurations
  const jobTypes = [
    {
      id: 'auto-processing',
      name: 'Auto Processing',
      description: 'Comprehensive AI analysis of bookmarks',
      icon: <Brain className="h-5 w-5" />,
      features: ['AI Tagging', 'Category Detection', 'Content Analysis', 'Quality Scoring']
    },
    {
      id: 'bulk-upload',
      name: 'Bulk Upload',
      description: 'Process large batches of new bookmarks',
      icon: <Upload className="h-5 w-5" />,
      features: ['URL Validation', 'Duplicate Detection', 'Metadata Extraction']
    },
    {
      id: 'categorization',
      name: 'Smart Categorization',
      description: 'AI-powered category assignment',
      icon: <Folder className="h-5 w-5" />,
      features: ['Category Prediction', 'Hierarchy Mapping', 'Custom Categories']
    },
    {
      id: 'tagging',
      name: 'Intelligent Tagging',
      description: 'Generate relevant tags automatically',
      icon: <Tags className="h-5 w-5" />,
      features: ['Content-based Tags', 'Semantic Analysis', 'Tag Relationships']
    },
    {
      id: 'validation',
      name: 'Link Validation',
      description: 'Check bookmark health and accessibility',
      icon: <CheckCircle className="h-5 w-5" />,
      features: ['URL Checking', 'Broken Link Detection', 'Redirect Following']
    },
    {
      id: 'recommendation',
      name: 'Content Recommendations',
      description: 'Generate personalized suggestions',
      icon: <Target className="h-5 w-5" />,
      features: ['Similar Content', 'Trending Topics', 'Personalization']
    }
  ]

  // Event handlers
  const handleJobConfigChange = (key: keyof BatchJobConfig, value: any) => {
    setJobConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSettingsChange = (key: string, value: any) => {
    setJobConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }))
  }

  const handleStartJob = async () => {
    setIsStarting(true)
    try {
      const jobId = await startJob(jobConfig)
      if (jobId) {
        toast.success(`Batch job started: ${jobConfig.name}`)
        setShowConfigDialog(false)
        onJobStart?.(jobId)
      }
    } catch (error) {
      console.error('Error starting job:', error)
      toast.error('Failed to start batch job')
    } finally {
      setIsStarting(false)
    }
  }

  const handleSavePreset = () => {
    const presetName = prompt('Enter preset name:')
    if (!presetName) return

    const newPreset = {
      ...jobConfig,
      name: presetName
    }

    savePresets([...presets, newPreset])
    toast.success('Preset saved successfully')
  }

  const handleLoadPreset = (preset: BatchJobConfig) => {
    setJobConfig(preset)
    toast.success('Preset loaded successfully')
  }

  const handleDeletePreset = (index: number) => {
    const newPresets = presets.filter((_, i) => i !== index)
    savePresets(newPresets)
    toast.success('Preset deleted successfully')
  }

  // Get active and queued jobs
  const activeJobs = filterJobsByStatus('processing')
  const queuedJobs = filterJobsByStatus('queued')

  return (
    <div className={className}>
      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Batch Processing Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Job Type Selection */}
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        {type.icon}
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quick Start */}
            <div className="space-y-2">
              <Label>Quick Actions</Label>
              <div className="flex space-x-2">
                <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Start Job
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Configure Batch Processing Job</DialogTitle>
                    </DialogHeader>
                    
                    <Tabs defaultValue="basic" className="space-y-4">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="ai">AI Settings</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        <TabsTrigger value="schedule">Schedule</TabsTrigger>
                      </TabsList>

                      {/* Basic Configuration */}
                      <TabsContent value="basic" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="job-name">Job Name</Label>
                            <Input
                              id="job-name"
                              value={jobConfig.name}
                              onChange={(e) => handleJobConfigChange('name', e.target.value)}
                              placeholder="Enter job name"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="job-type">Job Type</Label>
                            <Select
                              value={jobConfig.type}
                              onValueChange={(value) => handleJobConfigChange('type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {jobTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="job-description">Description</Label>
                          <Textarea
                            id="job-description"
                            value={jobConfig.description}
                            onChange={(e) => handleJobConfigChange('description', e.target.value)}
                            placeholder="Describe what this job will do"
                            rows={3}
                          />
                        </div>

                        {/* Processing Settings */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Processing Settings</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Batch Size</Label>
                              <Slider
                                value={[jobConfig.settings.batchSize]}
                                onValueChange={([value]) => handleSettingsChange('batchSize', value)}
                                min={10}
                                max={200}
                                step={10}
                                className="mt-2"
                              />
                              <div className="text-sm text-muted-foreground mt-1">
                                {jobConfig.settings.batchSize} items per batch
                              </div>
                            </div>
                            
                            <div>
                              <Label>Concurrency</Label>
                              <Slider
                                value={[jobConfig.settings.concurrency]}
                                onValueChange={([value]) => handleSettingsChange('concurrency', value)}
                                min={1}
                                max={10}
                                step={1}
                                className="mt-2"
                              />
                              <div className="text-sm text-muted-foreground mt-1">
                                {jobConfig.settings.concurrency} parallel operations
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Feature Toggles */}
                        <div className="space-y-4">
                          <h4 className="font-medium">Features</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="auto-tagging">Auto Tagging</Label>
                              <Switch
                                id="auto-tagging"
                                checked={jobConfig.settings.autoTagging}
                                onCheckedChange={(checked) => handleSettingsChange('autoTagging', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="category-detection">Category Detection</Label>
                              <Switch
                                id="category-detection"
                                checked={jobConfig.settings.categoryDetection}
                                onCheckedChange={(checked) => handleSettingsChange('categoryDetection', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="duplicate-detection">Duplicate Detection</Label>
                              <Switch
                                id="duplicate-detection"
                                checked={jobConfig.settings.duplicateDetection}
                                onCheckedChange={(checked) => handleSettingsChange('duplicateDetection', checked)}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="content-analysis">Content Analysis</Label>
                              <Switch
                                id="content-analysis"
                                checked={jobConfig.settings.contentAnalysis}
                                onCheckedChange={(checked) => handleSettingsChange('contentAnalysis', checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* AI Settings */}
                      <TabsContent value="ai" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>AI Provider</Label>
                            <Select
                              value={jobConfig.settings.aiProvider}
                              onValueChange={(value) => handleSettingsChange('aiProvider', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="anthropic">Anthropic</SelectItem>
                                <SelectItem value="google">Google</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label>Model</Label>
                            <Select
                              value={jobConfig.settings.model}
                              onValueChange={(value) => handleSettingsChange('model', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Temperature</Label>
                            <Slider
                              value={[jobConfig.settings.temperature]}
                              onValueChange={([value]) => handleSettingsChange('temperature', value)}
                              min={0}
                              max={2}
                              step={0.1}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              {jobConfig.settings.temperature} (creativity level)
                            </div>
                          </div>
                          
                          <div>
                            <Label>Max Tokens</Label>
                            <Slider
                              value={[jobConfig.settings.maxTokens]}
                              onValueChange={([value]) => handleSettingsChange('maxTokens', value)}
                              min={100}
                              max={4000}
                              step={100}
                              className="mt-2"
                            />
                            <div className="text-sm text-muted-foreground mt-1">
                              {jobConfig.settings.maxTokens} tokens max
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Minimum Confidence</Label>
                          <Slider
                            value={[jobConfig.settings.minConfidence]}
                            onValueChange={([value]) => handleSettingsChange('minConfidence', value)}
                            min={0}
                            max={1}
                            step={0.05}
                            className="mt-2"
                          />
                          <div className="text-sm text-muted-foreground mt-1">
                            {(jobConfig.settings.minConfidence * 100).toFixed(0)}% minimum confidence
                          </div>
                        </div>
                      </TabsContent>

                      {/* Advanced Settings */}
                      <TabsContent value="advanced" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Timeout (seconds)</Label>
                            <Input
                              type="number"
                              value={jobConfig.settings.timeout}
                              onChange={(e) => handleSettingsChange('timeout', parseInt(e.target.value))}
                              min={30}
                              max={3600}
                            />
                          </div>
                          
                          <div>
                            <Label>Retry Attempts</Label>
                            <Input
                              type="number"
                              value={jobConfig.settings.retryAttempts}
                              onChange={(e) => handleSettingsChange('retryAttempts', parseInt(e.target.value))}
                              min={0}
                              max={5}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Webhook URL (Optional)</Label>
                          <Input
                            value={jobConfig.settings.webhookUrl || ''}
                            onChange={(e) => handleSettingsChange('webhookUrl', e.target.value)}
                            placeholder="https://your-webhook-url.com"
                          />
                        </div>

                        <div>
                          <Label>Notification Email (Optional)</Label>
                          <Input
                            type="email"
                            value={jobConfig.settings.notificationEmail || ''}
                            onChange={(e) => handleSettingsChange('notificationEmail', e.target.value)}
                            placeholder="your-email@example.com"
                          />
                        </div>
                      </TabsContent>

                      {/* Schedule Settings */}
                      <TabsContent value="schedule" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Enable Scheduling</Label>
                          <Switch
                            checked={jobConfig.schedule?.enabled || false}
                            onCheckedChange={(checked) => 
                              handleJobConfigChange('schedule', { 
                                ...jobConfig.schedule, 
                                enabled: checked 
                              })
                            }
                          />
                        </div>

                        {jobConfig.schedule?.enabled && (
                          <div className="space-y-4">
                            <div>
                              <Label>Frequency</Label>
                              <Select
                                value={jobConfig.schedule.frequency}
                                onValueChange={(value) => 
                                  handleJobConfigChange('schedule', { 
                                    ...jobConfig.schedule, 
                                    frequency: value 
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hourly">Hourly</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Time</Label>
                              <Input
                                type="time"
                                value={jobConfig.schedule.time || ''}
                                onChange={(e) => 
                                  handleJobConfigChange('schedule', { 
                                    ...jobConfig.schedule, 
                                    time: e.target.value 
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {/* Preset Management */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Presets</h4>
                        <Button variant="outline" size="sm" onClick={handleSavePreset}>
                          Save as Preset
                        </Button>
                      </div>
                      
                      {presets.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {presets.map((preset, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm">{preset.name}</span>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLoadPreset(preset)}
                                >
                                  Load
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePreset(index)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfigDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleStartJob}
                        disabled={isStarting}
                      >
                        {isStarting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start Job
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Status Summary */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Active Jobs:</span>
                  <span className="font-medium">{activeJobs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Queued Jobs:</span>
                  <span className="font-medium">{queuedJobs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>System Health:</span>
                  <Badge variant="outline" className={
                    stats?.systemHealth === 'healthy' ? 'bg-green-100 text-green-700' :
                    stats?.systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {stats?.systemHealth || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Queue */}
      {(activeJobs.length > 0 || queuedJobs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Job Queue ({activeJobs.length + queuedJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...activeJobs, ...queuedJobs].map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      job.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                      job.status === 'queued' ? 'bg-gray-400' :
                      'bg-green-500'
                    }`} />
                    
                    <div>
                      <div className="font-medium text-sm">
                        {job.type.replace('-', ' ').toUpperCase()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {job.status === 'processing' && (
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {job.progress.percentage.toFixed(0)}%
                        </div>
                        <Progress value={job.progress.percentage} className="w-20 h-1" />
                      </div>
                    )}
                    
                    <div className="flex space-x-1">
                      {job.status === 'processing' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => pauseJob(job.id)}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelJob(job.id)}
                      >
                        <Square className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BatchProcessingControls 