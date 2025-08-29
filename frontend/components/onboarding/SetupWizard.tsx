'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Search, 
  Heart,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
  Settings,
  BookOpen,
  Tags,
  Folder,
  Share,
  Brain,
  Zap,
  Users,
  Globe
} from 'lucide-react'
import { PersonalizationData } from '@/features/onboarding/types'

interface SetupWizardProps {
  onComplete: (data: PersonalizationData) => void
  onBack: () => void
  userInfo: {
    id: string
    email: string
    name?: string
  }
}

interface WizardStep {
  id: string
  title: string
  description: string
  component: React.ReactNode
}

export function SetupWizard({ onComplete, onBack, userInfo }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<PersonalizationData>>({
    userId: userInfo.id,
    role: 'professional',
    primaryUseCase: [],
    interests: [],
    experienceLevel: 'intermediate',
    goals: [],
    preferredFeatures: [],
    workflowPreferences: {
      organizationStyle: 'mixed',
      sharingFrequency: 'sometimes',
      aiAssistanceLevel: 'moderate'
    }
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateWorkflowPreferences = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workflowPreferences: {
        ...prev.workflowPreferences,
        [field]: value
      }
    }))
  }

  const toggleArrayField = (field: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof PersonalizationData] as string[] || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return {
        ...prev,
        [field]: newArray
      }
    })
  }

  // Step 1: Role & Experience
  const RoleStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">What best describes your role?</Label>
        <RadioGroup 
          value={formData.role} 
          onValueChange={(value) => updateFormData('role', value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Research and study materials' },
            { value: 'professional', label: 'Professional', icon: Briefcase, desc: 'Work-related content' },
            { value: 'researcher', label: 'Researcher', icon: Search, desc: 'Academic and research content' },
            { value: 'casual_user', label: 'Casual User', icon: Heart, desc: 'Personal interests and hobbies' },
            { value: 'power_user', label: 'Power User', icon: Zap, desc: 'Advanced organization needs' }
          ].map((role) => (
            <div key={role.value} className="flex items-center space-x-3">
              <RadioGroupItem value={role.value} id={role.value} />
              <Label 
                htmlFor={role.value} 
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 flex-1"
              >
                <role.icon className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-sm text-gray-500">{role.desc}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">How experienced are you with bookmark management?</Label>
        <RadioGroup 
          value={formData.experienceLevel} 
          onValueChange={(value) => updateFormData('experienceLevel', value)}
          className="space-y-3"
        >
          {[
            { value: 'beginner', label: 'Beginner', desc: 'New to organized bookmark management' },
            { value: 'intermediate', label: 'Intermediate', desc: 'Some experience with organizing bookmarks' },
            { value: 'advanced', label: 'Advanced', desc: 'Experienced with complex organization systems' }
          ].map((level) => (
            <div key={level.value} className="flex items-center space-x-3">
              <RadioGroupItem value={level.value} id={level.value} />
              <Label htmlFor={level.value} className="cursor-pointer">
                <div className="font-medium">{level.label}</div>
                <div className="text-sm text-gray-500">{level.desc}</div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )

  // Step 2: Use Cases & Interests
  const InterestsStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">What do you primarily use bookmarks for?</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Research', 'Learning', 'Work Projects', 'News & Articles', 
            'Shopping', 'Entertainment', 'Recipes', 'Travel Planning',
            'Job Hunting', 'Investment', 'Health & Fitness', 'Technology'
          ].map((useCase) => (
            <div key={useCase} className="flex items-center space-x-2">
              <Checkbox
                id={useCase}
                checked={formData.primaryUseCase?.includes(useCase)}
                onCheckedChange={() => toggleArrayField('primaryUseCase', useCase)}
              />
              <Label htmlFor={useCase} className="text-sm cursor-pointer">{useCase}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">What are your main interests?</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            'Technology', 'Science', 'Business', 'Design', 'Marketing',
            'Programming', 'AI/ML', 'Finance', 'Health', 'Education',
            'Arts', 'Sports', 'Travel', 'Food', 'Music', 'Gaming'
          ].map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={formData.interests?.includes(interest)}
                onCheckedChange={() => toggleArrayField('interests', interest)}
              />
              <Label htmlFor={interest} className="text-sm cursor-pointer">{interest}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 3: Goals & Features
  const GoalsStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">What are your main goals with BookAIMark?</Label>
        <div className="space-y-3">
          {[
            'Better organize my existing bookmarks',
            'Discover new relevant content',
            'Share bookmarks with team/friends',
            'Reduce time spent searching for saved content',
            'Build a personal knowledge base',
            'Track and analyze my reading habits',
            'Collaborate on research projects',
            'Create curated collections for others'
          ].map((goal) => (
            <div key={goal} className="flex items-center space-x-2">
              <Checkbox
                id={goal}
                checked={formData.goals?.includes(goal)}
                onCheckedChange={() => toggleArrayField('goals', goal)}
              />
              <Label htmlFor={goal} className="text-sm cursor-pointer">{goal}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">Which features are most important to you?</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { id: 'ai_categorization', label: 'AI Auto-categorization', icon: Brain },
            { id: 'smart_search', label: 'Smart Search', icon: Search },
            { id: 'collaboration', label: 'Team Collaboration', icon: Users },
            { id: 'recommendations', label: 'Content Recommendations', icon: Target },
            { id: 'analytics', label: 'Usage Analytics', icon: Globe },
            { id: 'mobile_sync', label: 'Mobile Sync', icon: Zap }
          ].map((feature) => (
            <div key={feature.id} className="flex items-center space-x-3">
              <Checkbox
                id={feature.id}
                checked={formData.preferredFeatures?.includes(feature.id)}
                onCheckedChange={() => toggleArrayField('preferredFeatures', feature.id)}
              />
              <Label htmlFor={feature.id} className="flex items-center gap-2 cursor-pointer">
                <feature.icon className="h-4 w-4 text-blue-500" />
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Step 4: Workflow Preferences
  const WorkflowStep = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">How do you prefer to organize content?</Label>
        <RadioGroup 
          value={formData.workflowPreferences?.organizationStyle} 
          onValueChange={(value) => updateWorkflowPreferences('organizationStyle', value)}
          className="space-y-3"
        >
          {[
            { value: 'tags', label: 'Tags', icon: Tags, desc: 'Flexible tagging system' },
            { value: 'folders', label: 'Folders', icon: Folder, desc: 'Traditional folder structure' },
            { value: 'categories', label: 'Categories', icon: BookOpen, desc: 'Predefined categories' },
            { value: 'mixed', label: 'Mixed Approach', icon: Settings, desc: 'Combination of all methods' }
          ].map((style) => (
            <div key={style.value} className="flex items-center space-x-3">
              <RadioGroupItem value={style.value} id={style.value} />
              <Label htmlFor={style.value} className="flex items-center gap-3 cursor-pointer">
                <style.icon className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="font-medium">{style.label}</div>
                  <div className="text-sm text-gray-500">{style.desc}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">How often do you plan to share bookmarks?</Label>
        <RadioGroup 
          value={formData.workflowPreferences?.sharingFrequency} 
          onValueChange={(value) => updateWorkflowPreferences('sharingFrequency', value)}
          className="space-y-2"
        >
          {[
            { value: 'never', label: 'Never - Keep everything private' },
            { value: 'rarely', label: 'Rarely - Only special collections' },
            { value: 'sometimes', label: 'Sometimes - Share with team/friends' },
            { value: 'often', label: 'Often - Regular collaboration' }
          ].map((freq) => (
            <div key={freq.value} className="flex items-center space-x-3">
              <RadioGroupItem value={freq.value} id={freq.value} />
              <Label htmlFor={freq.value} className="cursor-pointer">{freq.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-semibold mb-4 block">How much AI assistance do you want?</Label>
        <RadioGroup 
          value={formData.workflowPreferences?.aiAssistanceLevel} 
          onValueChange={(value) => updateWorkflowPreferences('aiAssistanceLevel', value)}
          className="space-y-2"
        >
          {[
            { value: 'minimal', label: 'Minimal - Manual control' },
            { value: 'moderate', label: 'Moderate - Suggestions with approval' },
            { value: 'maximum', label: 'Maximum - Automatic processing' }
          ].map((level) => (
            <div key={level.value} className="flex items-center space-x-3">
              <RadioGroupItem value={level.value} id={level.value} />
              <Label htmlFor={level.value} className="cursor-pointer">{level.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )

  const steps: WizardStep[] = [
    {
      id: 'role',
      title: 'Tell us about yourself',
      description: 'Help us understand your background and experience level',
      component: <RoleStep />
    },
    {
      id: 'interests',
      title: 'What interests you?',
      description: 'Select your primary use cases and interests',
      component: <InterestsStep />
    },
    {
      id: 'goals',
      title: 'What are your goals?',
      description: 'Choose your objectives and preferred features',
      component: <GoalsStep />
    },
    {
      id: 'workflow',
      title: 'Customize your workflow',
      description: 'Set up your preferred organization and AI assistance level',
      component: <WorkflowStep />
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(formData as PersonalizationData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      onBack()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Setup Your Experience</h1>
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 mt-2">
            {Math.round(progress)}% complete
          </p>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  {currentStepData.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentStepData.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStepData.component}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mt-8"
        >
          <Button
            onClick={handlePrevious}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 0 ? 'Back' : 'Previous'}
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Complete Setup
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Skip Option */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6"
        >
          <Button
            onClick={() => onComplete(formData as PersonalizationData)}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            Skip setup for now
          </Button>
        </motion.div>
      </div>
    </div>
  )
} 