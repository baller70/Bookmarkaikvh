'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  OnboardingState, 
  OnboardingActions, 
  OnboardingFlow, 
  OnboardingStep,
  OnboardingTutorial,
  UserOnboardingProgress,
  OnboardingPreferences,
  PersonalizationData,
  OnboardingAnalytics,
  OnboardingContext as OnboardingContextType,
  DEFAULT_ONBOARDING_FLOWS
} from '@/features/onboarding/types'

interface OnboardingProviderProps {
  children: React.ReactNode
  userId: string
  userInfo: {
    email: string
    name?: string
    avatar?: string
    isNewUser: boolean
    registrationDate: Date
  }
}

const OnboardingContext = createContext<(OnboardingState & OnboardingActions) | null>(null)

export function OnboardingProvider({ children, userId, userInfo }: OnboardingProviderProps) {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentFlow: undefined,
    currentStep: undefined,
    currentTutorial: undefined,
    progress: {
      userId,
      flowId: '',
      currentStepId: '',
      completedSteps: [],
      skippedSteps: [],
      startedAt: new Date(),
      lastActiveAt: new Date(),
      progressPercentage: 0,
      timeSpent: 0,
      isCompleted: false,
      isPaused: false
    },
    context: {
      user: {
        id: userId,
        ...userInfo
      },
      progress: {
        userId,
        flowId: '',
        currentStepId: '',
        completedSteps: [],
        skippedSteps: [],
        startedAt: new Date(),
        lastActiveAt: new Date(),
        progressPercentage: 0,
        timeSpent: 0,
        isCompleted: false,
        isPaused: false
      },
      preferences: {
        userId,
        skipTutorials: false,
        showTooltips: true,
        autoAdvance: true,
        playbackSpeed: 'normal',
        preferredLearningStyle: 'interactive',
        completedOnboardings: [],
        dismissedTutorials: []
      },
      currentFlow: DEFAULT_ONBOARDING_FLOWS[0],
      availableFlows: DEFAULT_ONBOARDING_FLOWS
    },
    isLoading: false,
    error: undefined
  })

  // Load saved progress and preferences
  useEffect(() => {
    loadOnboardingData()
  }, [userId])

  // Auto-save progress
  useEffect(() => {
    if (state.isActive) {
      saveProgress()
    }
  }, [state.progress, state.isActive])

  const loadOnboardingData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // Load from localStorage for now (could be API call)
      const savedProgress = localStorage.getItem(`onboarding-progress-${userId}`)
      const savedPreferences = localStorage.getItem(`onboarding-preferences-${userId}`)
      const savedPersonalization = localStorage.getItem(`onboarding-personalization-${userId}`)
      
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        setState(prev => ({
          ...prev,
          progress: {
            ...progress,
            startedAt: new Date(progress.startedAt),
            lastActiveAt: new Date(progress.lastActiveAt),
            completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined
          },
          context: {
            ...prev.context,
            progress: {
              ...progress,
              startedAt: new Date(progress.startedAt),
              lastActiveAt: new Date(progress.lastActiveAt),
              completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined
            }
          }
        }))
      }
      
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences)
        setState(prev => ({
          ...prev,
          context: {
            ...prev.context,
            preferences: {
              ...preferences,
              lastOnboardingDate: preferences.lastOnboardingDate ? 
                new Date(preferences.lastOnboardingDate) : undefined
            }
          }
        }))
      }
      
      if (savedPersonalization) {
        const personalization = JSON.parse(savedPersonalization)
        setState(prev => ({
          ...prev,
          context: {
            ...prev.context,
            personalization
          }
        }))
      }
      
    } catch (error) {
      console.error('Failed to load onboarding data:', error)
      setState(prev => ({ ...prev, error: 'Failed to load onboarding data' }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const saveProgress = async () => {
    try {
      localStorage.setItem(`onboarding-progress-${userId}`, JSON.stringify(state.progress))
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const savePreferences = async (preferences: OnboardingPreferences) => {
    try {
      localStorage.setItem(`onboarding-preferences-${userId}`, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const savePersonalization = async (personalization: PersonalizationData) => {
    try {
      localStorage.setItem(`onboarding-personalization-${userId}`, JSON.stringify(personalization))
    } catch (error) {
      console.error('Failed to save personalization:', error)
    }
  }

  const trackEvent = async (event: Omit<OnboardingAnalytics, 'timestamp'>) => {
    try {
      const analyticsEvent: OnboardingAnalytics = {
        ...event,
        timestamp: new Date()
      }
      
      // Save to localStorage for now (could be API call)
      const existingEvents = localStorage.getItem(`onboarding-analytics-${userId}`)
      const events = existingEvents ? JSON.parse(existingEvents) : []
      events.push(analyticsEvent)
      localStorage.setItem(`onboarding-analytics-${userId}`, JSON.stringify(events))
      
      console.log('Onboarding event tracked:', analyticsEvent)
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  const calculateProgress = (flow: OnboardingFlow, completedSteps: string[]) => {
    if (flow.steps.length === 0) return 0
    return (completedSteps.length / flow.steps.length) * 100
  }

  const startFlow = useCallback(async (flowId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const flow = DEFAULT_ONBOARDING_FLOWS.find(f => f.id === flowId)
      if (!flow) {
        throw new Error(`Flow ${flowId} not found`)
      }
      
      const newProgress: UserOnboardingProgress = {
        userId,
        flowId,
        currentStepId: flow.steps[0]?.id || '',
        completedSteps: [],
        skippedSteps: [],
        startedAt: new Date(),
        lastActiveAt: new Date(),
        progressPercentage: 0,
        timeSpent: 0,
        isCompleted: false,
        isPaused: false
      }
      
      setState(prev => ({
        ...prev,
        isActive: true,
        currentFlow: flow,
        currentStep: flow.steps[0],
        progress: newProgress,
        context: {
          ...prev.context,
          currentFlow: flow,
          progress: newProgress
        }
      }))
      
      await trackEvent({
        flowId,
        stepId: flow.steps[0]?.id || '',
        userId,
        event: 'started'
      })
      
    } catch (error) {
      console.error('Failed to start flow:', error)
      setState(prev => ({ ...prev, error: 'Failed to start onboarding flow' }))
    } finally {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [userId])

  const nextStep = useCallback(async () => {
    if (!state.currentFlow || !state.currentStep) return
    
    const currentIndex = state.currentFlow.steps.findIndex(s => s.id === state.currentStep!.id)
    const nextStepIndex = currentIndex + 1
    
    if (nextStepIndex < state.currentFlow.steps.length) {
      const nextStep = state.currentFlow.steps[nextStepIndex]
      
      setState(prev => ({
        ...prev,
        currentStep: nextStep,
        progress: {
          ...prev.progress,
          currentStepId: nextStep.id,
          lastActiveAt: new Date()
        }
      }))
      
      await trackEvent({
        flowId: state.currentFlow.id,
        stepId: nextStep.id,
        userId,
        event: 'started'
      })
    }
  }, [state.currentFlow, state.currentStep, userId])

  const previousStep = useCallback(async () => {
    if (!state.currentFlow || !state.currentStep) return
    
    const currentIndex = state.currentFlow.steps.findIndex(s => s.id === state.currentStep!.id)
    const prevStepIndex = currentIndex - 1
    
    if (prevStepIndex >= 0) {
      const prevStep = state.currentFlow.steps[prevStepIndex]
      
      setState(prev => ({
        ...prev,
        currentStep: prevStep,
        progress: {
          ...prev.progress,
          currentStepId: prevStep.id,
          lastActiveAt: new Date()
        }
      }))
    }
  }, [state.currentFlow, state.currentStep])

  const skipStep = useCallback(async (stepId: string) => {
    if (!state.currentFlow) return
    
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        skippedSteps: [...prev.progress.skippedSteps, stepId],
        lastActiveAt: new Date(),
        progressPercentage: calculateProgress(state.currentFlow!, [
          ...prev.progress.completedSteps,
          ...prev.progress.skippedSteps,
          stepId
        ])
      }
    }))
    
    await trackEvent({
      flowId: state.currentFlow.id,
      stepId,
      userId,
      event: 'skipped'
    })
    
    await nextStep()
  }, [state.currentFlow, userId, nextStep])

  const completeStep = useCallback(async (stepId: string, data?: any) => {
    if (!state.currentFlow) return
    
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        completedSteps: [...prev.progress.completedSteps, stepId],
        lastActiveAt: new Date(),
        progressPercentage: calculateProgress(state.currentFlow!, [
          ...prev.progress.completedSteps,
          stepId
        ])
      }
    }))
    
    await trackEvent({
      flowId: state.currentFlow.id,
      stepId,
      userId,
      event: 'completed',
      metadata: data
    })
    
    await nextStep()
  }, [state.currentFlow, userId, nextStep])

  const pauseFlow = useCallback(async () => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        isPaused: true,
        lastActiveAt: new Date()
      }
    }))
  }, [])

  const resumeFlow = useCallback(async () => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        isPaused: false,
        lastActiveAt: new Date()
      }
    }))
  }, [])

  const completeFlow = useCallback(async () => {
    if (!state.currentFlow) return
    
    setState(prev => ({
      ...prev,
      isActive: false,
      progress: {
        ...prev.progress,
        isCompleted: true,
        completedAt: new Date(),
        progressPercentage: 100
      },
      context: {
        ...prev.context,
        preferences: {
          ...prev.context.preferences,
          completedOnboardings: [
            ...prev.context.preferences.completedOnboardings,
            state.currentFlow!.id
          ],
          lastOnboardingDate: new Date()
        }
      }
    }))
    
    await trackEvent({
      flowId: state.currentFlow.id,
      stepId: state.currentStep?.id || '',
      userId,
      event: 'completed'
    })
  }, [state.currentFlow, state.currentStep, userId])

  const abandonFlow = useCallback(async () => {
    if (!state.currentFlow) return
    
    setState(prev => ({
      ...prev,
      isActive: false
    }))
    
    await trackEvent({
      flowId: state.currentFlow.id,
      stepId: state.currentStep?.id || '',
      userId,
      event: 'abandoned'
    })
  }, [state.currentFlow, state.currentStep, userId])

  const updatePreferences = useCallback(async (preferences: Partial<OnboardingPreferences>) => {
    const newPreferences = {
      ...state.context.preferences,
      ...preferences
    }
    
    setState(prev => ({
      ...prev,
      context: {
        ...prev.context,
        preferences: newPreferences
      }
    }))
    
    await savePreferences(newPreferences)
  }, [state.context.preferences])

  const savePersonalizationData = useCallback(async (data: PersonalizationData) => {
    setState(prev => ({
      ...prev,
      context: {
        ...prev.context,
        personalization: data
      }
    }))
    
    await savePersonalization(data)
  }, [])

  const value: OnboardingState & OnboardingActions = {
    ...state,
    startFlow,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    pauseFlow,
    resumeFlow,
    completeFlow,
    abandonFlow,
    updatePreferences,
    savePersonalization: savePersonalizationData,
    trackEvent
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}

export function useOnboardingAnalytics() {
  const { trackEvent } = useOnboarding()
  
  return {
    trackStepStarted: (flowId: string, stepId: string) =>
      trackEvent({ flowId, stepId, userId: '', event: 'started' }),
    trackStepCompleted: (flowId: string, stepId: string, timeSpent?: number) =>
      trackEvent({ flowId, stepId, userId: '', event: 'completed', timeSpent }),
    trackStepSkipped: (flowId: string, stepId: string) =>
      trackEvent({ flowId, stepId, userId: '', event: 'skipped' }),
    trackHelpViewed: (flowId: string, stepId: string) =>
      trackEvent({ flowId, stepId, userId: '', event: 'help_viewed' })
  }
} 