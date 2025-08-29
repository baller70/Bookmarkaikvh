'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { WelcomeScreen } from './WelcomeScreen'
import { SetupWizard } from './SetupWizard'
import { InteractiveTutorial } from './InteractiveTutorial'
import { useOnboarding } from './OnboardingProvider'
import { PersonalizationData, OnboardingTutorial } from '@/features/onboarding/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  Sparkles, 
  Target, 
  BookOpen, 
  Users, 
  ArrowRight,
  Gift,
  Star,
  Trophy
} from 'lucide-react'

type OnboardingStage = 'welcome' | 'setup' | 'tutorial' | 'completed' | 'skipped'

interface OnboardingOrchestratorProps {
  userInfo: {
    id: string
    email: string
    name?: string
    avatar?: string
    isNewUser: boolean
    registrationDate: Date
  }
  onComplete: (personalization?: PersonalizationData) => void
  onSkip: () => void
  autoStart?: boolean
}

export function OnboardingOrchestrator({ 
  userInfo, 
  onComplete, 
  onSkip,
  autoStart = false 
}: OnboardingOrchestratorProps) {
  const [currentStage, setCurrentStage] = useState<OnboardingStage>('welcome')
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  
  const {
    startFlow,
    completeFlow,
    abandonFlow,
    savePersonalization,
    context,
    isActive,
    currentFlow,
    trackEvent
  } = useOnboarding()

  // Auto-start onboarding for new users
  useEffect(() => {
    if (autoStart && userInfo.isNewUser && !isActive) {
      handleGetStarted()
    }
  }, [autoStart, userInfo.isNewUser, isActive])

  // Tutorial steps for the dashboard
  const dashboardTutorials: OnboardingTutorial[] = [
    {
      id: 'welcome-dashboard',
      stepId: 'dashboard-intro',
      type: 'modal',
      target: 'body',
      title: 'Welcome to Your Dashboard!',
      content: 'This is your bookmark management hub. Let\'s take a quick tour of the key features.',
      position: 'center',
      showSkip: true,
      showNext: true,
      showPrevious: false
    },
    {
      id: 'add-bookmark',
      stepId: 'add-bookmark-tutorial',
      type: 'spotlight',
      target: '[data-testid="add-bookmark-button"]',
      title: 'Add Your First Bookmark',
      content: 'Click here to add a new bookmark. You can paste any URL and our AI will automatically categorize and tag it for you.',
      position: 'bottom',
      showSkip: true,
      showNext: true,
      showPrevious: true,
      action: {
        type: 'click',
        target: '[data-testid="add-bookmark-button"]'
      },
      validation: {
        type: 'element_exists',
        target: '[data-testid="bookmark-form"]'
      }
    },
    {
      id: 'search-bookmarks',
      stepId: 'search-tutorial',
      type: 'spotlight',
      target: '[data-testid="search-input"]',
      title: 'Smart Search',
      content: 'Use our intelligent search to find bookmarks by content, tags, or categories. Try searching for something!',
      position: 'bottom',
      showSkip: true,
      showNext: true,
      showPrevious: true,
      action: {
        type: 'input',
        target: '[data-testid="search-input"]'
      }
    },
    {
      id: 'ai-features',
      stepId: 'ai-features-tutorial',
      type: 'spotlight',
      target: '[data-testid="ai-copilot-button"]',
      title: 'AI-Powered Features',
      content: 'Access AI features like smart categorization, duplicate detection, and content recommendations.',
      position: 'left',
      showSkip: true,
      showNext: true,
      showPrevious: true
    },
    {
      id: 'view-modes',
      stepId: 'view-modes-tutorial',
      type: 'tooltip',
      target: '[data-testid="view-toggle"]',
      title: 'Multiple View Modes',
      content: 'Switch between grid, list, and compact views to find what works best for you.',
      position: 'bottom',
      showSkip: true,
      showNext: true,
      showPrevious: true
    },
    {
      id: 'completion',
      stepId: 'tutorial-completion',
      type: 'modal',
      target: 'body',
      title: 'You\'re All Set!',
      content: 'Congratulations! You\'ve completed the onboarding. Start adding bookmarks and let our AI help you stay organized.',
      position: 'center',
      showSkip: false,
      showNext: true,
      showPrevious: false
    }
  ]

  const handleGetStarted = async () => {
    setCurrentStage('setup')
    await startFlow('new_user_welcome')
    await trackEvent({
      flowId: 'new_user_welcome',
      stepId: 'welcome',
      userId: userInfo.id,
      event: 'started'
    })
  }

  const handleSkipWelcome = () => {
    setCurrentStage('skipped')
    onSkip()
  }

  const handleSetupComplete = async (data: PersonalizationData) => {
    setPersonalizationData(data)
    await savePersonalization(data)
    
    // Decide whether to show tutorial based on user preferences
    if (data.experienceLevel === 'beginner' || data.role === 'casual_user') {
      setCurrentStage('tutorial')
      setShowTutorial(true)
    } else {
      setCurrentStage('completed')
      await completeFlow()
      onComplete(data)
    }
  }

  const handleSetupBack = () => {
    setCurrentStage('welcome')
  }

  const handleTutorialComplete = async () => {
    setCurrentStage('completed')
    await completeFlow()
    onComplete(personalizationData || undefined)
  }

  const handleTutorialSkip = async () => {
    setCurrentStage('completed')
    await completeFlow()
    onComplete(personalizationData || undefined)
  }

  const handleTutorialClose = async () => {
    await abandonFlow()
    onSkip()
  }

  // Completion screen
  const CompletionScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-green-500 to-blue-600 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center mb-6"
          >
            <Trophy className="h-12 w-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4"
          >
            Welcome to BookAIMark!
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-gray-600 mb-8"
          >
            You're all set up and ready to revolutionize your bookmark management
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Profile Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Your personalized experience is ready</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <Sparkles className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">AI Activated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Smart features are now enabled</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Bonus Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">100 AI processing credits added</p>
            </CardContent>
          </Card>
        </motion.div>

        {personalizationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white rounded-lg p-6 shadow-lg border mb-8"
          >
            <h3 className="text-lg font-semibold mb-4">Your Personalization Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Role</div>
                <Badge variant="secondary" className="mt-1">
                  {personalizationData.role.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <div className="font-medium text-gray-900">Experience</div>
                <Badge variant="secondary" className="mt-1">
                  {personalizationData.experienceLevel}
                </Badge>
              </div>
              <div>
                <div className="font-medium text-gray-900">Organization</div>
                <Badge variant="secondary" className="mt-1">
                  {personalizationData.workflowPreferences.organizationStyle}
                </Badge>
              </div>
              <div>
                <div className="font-medium text-gray-900">AI Level</div>
                <Badge variant="secondary" className="mt-1">
                  {personalizationData.workflowPreferences.aiAssistanceLevel}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Button
            onClick={() => onComplete(personalizationData || undefined)}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Using BookAIMark
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-6 text-sm text-gray-500"
        >
          You can always adjust these settings later in your preferences
        </motion.div>
      </motion.div>
    </div>
  )

  return (
    <AnimatePresence mode="wait">
      {currentStage === 'welcome' && (
        <WelcomeScreen
          key="welcome"
          onGetStarted={handleGetStarted}
          onSkip={handleSkipWelcome}
          userInfo={userInfo}
        />
      )}
      
      {currentStage === 'setup' && (
        <SetupWizard
          key="setup"
          onComplete={handleSetupComplete}
          onBack={handleSetupBack}
          userInfo={userInfo}
        />
      )}
      
      {currentStage === 'tutorial' && showTutorial && (
        <InteractiveTutorial
          key="tutorial"
          tutorials={dashboardTutorials}
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
          onClose={handleTutorialClose}
          isActive={showTutorial}
        />
      )}
      
      {currentStage === 'completed' && (
        <CompletionScreen key="completed" />
      )}
    </AnimatePresence>
  )
} 