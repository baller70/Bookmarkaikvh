'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Play, 
  Pause,
  SkipForward,
  HelpCircle,
  CheckCircle,
  Eye,
  Hand,
  MousePointer,
  Keyboard,
  Target,
  Lightbulb,
  Zap
} from 'lucide-react'
import { OnboardingTutorial } from '@/features/onboarding/types'

interface InteractiveTutorialProps {
  tutorials: OnboardingTutorial[]
  onComplete: () => void
  onSkip: () => void
  onClose: () => void
  isActive: boolean
}

interface TutorialSpotlight {
  element: HTMLElement
  tutorial: OnboardingTutorial
}

export function InteractiveTutorial({ 
  tutorials, 
  onComplete, 
  onSkip, 
  onClose, 
  isActive 
}: InteractiveTutorialProps) {
  const [currentTutorialIndex, setCurrentTutorialIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [spotlight, setSpotlight] = useState<TutorialSpotlight | null>(null)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [userInteraction, setUserInteraction] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const currentTutorial = tutorials[currentTutorialIndex]
  const progress = ((currentTutorialIndex + 1) / tutorials.length) * 100

  // Find and highlight target element
  useEffect(() => {
    if (!currentTutorial || !isActive) return

    const findElement = () => {
      const element = document.querySelector(currentTutorial.target) as HTMLElement
      if (element) {
        setHighlightedElement(element)
        setSpotlight({ element, tutorial: currentTutorial })
        
        // Calculate tooltip position
        const rect = element.getBoundingClientRect()
        const tooltipWidth = 320
        const tooltipHeight = 200
        
        let x = rect.left + rect.width / 2 - tooltipWidth / 2
        let y = rect.bottom + 10
        
        // Adjust position based on tutorial position preference
        switch (currentTutorial.position) {
          case 'top':
            y = rect.top - tooltipHeight - 10
            break
          case 'left':
            x = rect.left - tooltipWidth - 10
            y = rect.top + rect.height / 2 - tooltipHeight / 2
            break
          case 'right':
            x = rect.right + 10
            y = rect.top + rect.height / 2 - tooltipHeight / 2
            break
          case 'center':
            x = window.innerWidth / 2 - tooltipWidth / 2
            y = window.innerHeight / 2 - tooltipHeight / 2
            break
        }
        
        // Keep tooltip within viewport
        x = Math.max(10, Math.min(x, window.innerWidth - tooltipWidth - 10))
        y = Math.max(10, Math.min(y, window.innerHeight - tooltipHeight - 10))
        
        setTooltipPosition({ x, y })
        setShowTooltip(true)
        
        // Add highlight class
        element.classList.add('tutorial-highlight')
        element.style.position = 'relative'
        element.style.zIndex = '9999'
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }

    // Try to find element immediately, then retry after a delay
    findElement()
    const timer = setTimeout(findElement, 100)
    
    return () => {
      clearTimeout(timer)
      if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-highlight')
        highlightedElement.style.zIndex = ''
      }
    }
  }, [currentTutorial, currentTutorialIndex, isActive])

  // Handle tutorial actions
  useEffect(() => {
    if (!currentTutorial?.action || !highlightedElement) return

    const handleAction = async () => {
      switch (currentTutorial.action?.type) {
        case 'click':
          // Wait for user to click the element
          const handleClick = () => {
            setUserInteraction('clicked')
            highlightedElement.removeEventListener('click', handleClick)
          }
          highlightedElement.addEventListener('click', handleClick)
          break
          
        case 'input':
          // Wait for user to enter text
          const handleInput = (e: Event) => {
            const target = e.target as HTMLInputElement
            if (target.value) {
              setUserInteraction('input_entered')
              highlightedElement.removeEventListener('input', handleInput)
            }
          }
          highlightedElement.addEventListener('input', handleInput)
          break
          
        case 'wait':
          // Auto-advance after specified time
          setTimeout(() => {
            setUserInteraction('waited')
          }, currentTutorial.action?.waitTime || 2000)
          break
          
        case 'navigate':
          // Handle navigation
          if (currentTutorial.action.target) {
            window.location.href = currentTutorial.action.target
          }
          break
      }
    }

    if (isPlaying) {
      handleAction()
    }
  }, [currentTutorial, highlightedElement, isPlaying])

  // Auto-advance when user interaction is detected
  useEffect(() => {
    if (userInteraction && isPlaying) {
      const timer = setTimeout(() => {
        handleNext()
        setUserInteraction(null)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [userInteraction, isPlaying])

  const handleNext = () => {
    if (currentTutorialIndex < tutorials.length - 1) {
      setCurrentTutorialIndex(prev => prev + 1)
      setShowTooltip(false)
      setUserInteraction(null)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentTutorialIndex > 0) {
      setCurrentTutorialIndex(prev => prev - 1)
      setShowTooltip(false)
      setUserInteraction(null)
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const getTutorialIcon = (type: string) => {
    switch (type) {
      case 'tooltip': return HelpCircle
      case 'modal': return Target
      case 'spotlight': return Eye
      case 'guided_tour': return Hand
      case 'interactive': return MousePointer
      default: return Lightbulb
    }
  }

  const getActionIcon = (actionType?: string) => {
    switch (actionType) {
      case 'click': return MousePointer
      case 'input': return Keyboard
      case 'wait': return Play
      case 'navigate': return ArrowRight
      default: return Eye
    }
  }

  if (!isActive || !currentTutorial) return null

  return (
    <>
      {/* Overlay */}
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        style={{
          maskImage: spotlight ? 
            `radial-gradient(circle at ${spotlight.element.getBoundingClientRect().left + spotlight.element.getBoundingClientRect().width / 2}px ${spotlight.element.getBoundingClientRect().top + spotlight.element.getBoundingClientRect().height / 2}px, transparent ${Math.max(spotlight.element.getBoundingClientRect().width, spotlight.element.getBoundingClientRect().height) / 2 + 10}px, black ${Math.max(spotlight.element.getBoundingClientRect().width, spotlight.element.getBoundingClientRect().height) / 2 + 50}px)` 
            : undefined
        }}
      />

      {/* Tutorial Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              zIndex: 10000
            }}
            className="w-80"
          >
            <Card className="border-2 border-blue-200 shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {React.createElement(getTutorialIcon(currentTutorial.type), { 
                      className: "h-5 w-5 text-blue-500" 
                    })}
                    <CardTitle className="text-lg">{currentTutorial.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentTutorialIndex + 1}/{tutorials.length}
                    </Badge>
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="h-1" />
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{currentTutorial.content}</p>
                
                {/* Action Indicator */}
                {currentTutorial.action && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    {React.createElement(getActionIcon(currentTutorial.action.type), { 
                      className: "h-4 w-4 text-blue-500" 
                    })}
                    <span className="text-sm font-medium text-blue-700">
                      {currentTutorial.action.type === 'click' && 'Click the highlighted element'}
                      {currentTutorial.action.type === 'input' && 'Enter some text'}
                      {currentTutorial.action.type === 'wait' && 'Watch and learn'}
                      {currentTutorial.action.type === 'navigate' && 'Navigate to the next page'}
                    </span>
                    {userInteraction && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Validation Status */}
                {currentTutorial.validation && userInteraction && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 bg-green-50 rounded text-green-700 text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Great! You've completed this step.
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentTutorial.showPrevious && (
                      <Button
                        onClick={handlePrevious}
                        variant="outline"
                        size="sm"
                        disabled={currentTutorialIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    )}
                    
                    <Button
                      onClick={handlePlayPause}
                      variant="outline"
                      size="sm"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentTutorial.showSkip && (
                      <Button
                        onClick={onSkip}
                        variant="ghost"
                        size="sm"
                      >
                        Skip Tour
                      </Button>
                    )}
                    
                    {currentTutorial.showNext && (
                      <Button
                        onClick={handleNext}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {currentTutorialIndex === tutorials.length - 1 ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finish
                          </>
                        ) : (
                          <>
                            Next
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-[10001]"
      >
        <Card className="p-4 shadow-lg border-blue-200">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium">Tutorial Progress</div>
              <div className="text-xs text-gray-500">
                {currentTutorialIndex + 1} of {tutorials.length} steps
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tutorial Styles */}
      <style jsx global>{`
        .tutorial-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
          border-radius: 8px !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
          animation: tutorial-pulse 2s infinite !important;
        }
        
        @keyframes tutorial-pulse {
          0% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2); }
          100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        }
      `}</style>
    </>
  )
} 