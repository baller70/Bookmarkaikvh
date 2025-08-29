// Onboarding System Types

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isRequired: boolean
  estimatedTime: number // in minutes
  dependencies?: string[]
  completionCriteria: string[]
  helpText?: string
  videoUrl?: string
  order: number
}

export interface OnboardingFlow {
  id: string
  name: string
  description: string
  target: 'new_user' | 'existing_user' | 'feature_specific'
  steps: OnboardingStep[]
  totalEstimatedTime: number
  completionReward?: string
  isActive: boolean
}

export interface UserOnboardingProgress {
  userId: string
  flowId: string
  currentStepId: string
  completedSteps: string[]
  skippedSteps: string[]
  startedAt: Date
  lastActiveAt: Date
  completedAt?: Date
  progressPercentage: number
  timeSpent: number // in minutes
  isCompleted: boolean
  isPaused: boolean
}

export interface OnboardingTutorial {
  id: string
  stepId: string
  type: 'tooltip' | 'modal' | 'spotlight' | 'guided_tour' | 'interactive'
  target: string // CSS selector or component reference
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  showSkip: boolean
  showNext: boolean
  showPrevious: boolean
  action?: {
    type: 'click' | 'input' | 'wait' | 'navigate'
    target?: string
    value?: string
    waitTime?: number
  }
  validation?: {
    type: 'element_exists' | 'value_entered' | 'action_completed'
    target: string
    expectedValue?: string
  }
}

export interface OnboardingPreferences {
  userId: string
  skipTutorials: boolean
  showTooltips: boolean
  autoAdvance: boolean
  playbackSpeed: 'slow' | 'normal' | 'fast'
  preferredLearningStyle: 'visual' | 'interactive' | 'text' | 'video'
  completedOnboardings: string[]
  dismissedTutorials: string[]
  lastOnboardingDate?: Date
}

export interface OnboardingAnalytics {
  flowId: string
  stepId: string
  userId: string
  event: 'started' | 'completed' | 'skipped' | 'abandoned' | 'help_viewed'
  timestamp: Date
  timeSpent?: number
  metadata?: Record<string, any>
}

export interface PersonalizationData {
  userId: string
  role: 'student' | 'professional' | 'researcher' | 'casual_user' | 'power_user'
  primaryUseCase: string[]
  interests: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  preferredFeatures: string[]
  workflowPreferences: {
    organizationStyle: 'tags' | 'folders' | 'categories' | 'mixed'
    sharingFrequency: 'never' | 'rarely' | 'sometimes' | 'often'
    aiAssistanceLevel: 'minimal' | 'moderate' | 'maximum'
  }
}

export interface OnboardingContext {
  user: {
    id: string
    email: string
    name?: string
    avatar?: string
    isNewUser: boolean
    registrationDate: Date
  }
  progress: UserOnboardingProgress
  preferences: OnboardingPreferences
  personalization?: PersonalizationData
  currentFlow: OnboardingFlow
  availableFlows: OnboardingFlow[]
}

export interface OnboardingState {
  isActive: boolean
  currentFlow?: OnboardingFlow
  currentStep?: OnboardingStep
  currentTutorial?: OnboardingTutorial
  progress: UserOnboardingProgress
  context: OnboardingContext
  isLoading: boolean
  error?: string
}

export interface OnboardingActions {
  startFlow: (flowId: string) => Promise<void>
  nextStep: () => Promise<void>
  previousStep: () => Promise<void>
  skipStep: (stepId: string) => Promise<void>
  completeStep: (stepId: string, data?: any) => Promise<void>
  pauseFlow: () => Promise<void>
  resumeFlow: () => Promise<void>
  completeFlow: () => Promise<void>
  abandonFlow: () => Promise<void>
  updatePreferences: (preferences: Partial<OnboardingPreferences>) => Promise<void>
  savePersonalization: (data: PersonalizationData) => Promise<void>
  trackEvent: (event: Omit<OnboardingAnalytics, 'timestamp'>) => Promise<void>
}

// Default onboarding flows
export const DEFAULT_ONBOARDING_FLOWS: OnboardingFlow[] = [
  {
    id: 'new_user_welcome',
    name: 'Welcome to BookAIMark',
    description: 'Get started with your AI-powered bookmark manager',
    target: 'new_user',
    steps: [],
    totalEstimatedTime: 10,
    completionReward: 'Welcome bonus: 100 AI processing credits',
    isActive: true
  },
  {
    id: 'ai_features_tour',
    name: 'AI Features Tour',
    description: 'Discover the power of AI-assisted bookmark management',
    target: 'existing_user',
    steps: [],
    totalEstimatedTime: 15,
    isActive: true
  },
  {
    id: 'advanced_features',
    name: 'Advanced Features',
    description: 'Master advanced bookmark organization and collaboration',
    target: 'feature_specific',
    steps: [],
    totalEstimatedTime: 20,
    isActive: true
  }
] 