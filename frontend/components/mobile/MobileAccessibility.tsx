'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Eye, 
  EyeOff, 
  Type, 
  Contrast,
  Accessibility,
  Headphones
} from 'lucide-react'
import { useDeviceInfo } from '@/hooks/use-mobile'

interface AccessibilitySettings {
  screenReader: boolean
  voiceCommands: boolean
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  soundEffects: boolean
  hapticFeedback: boolean
  keyboardNavigation: boolean
}

interface MobileAccessibilityProps {
  children: React.ReactNode
  enableVoiceCommands?: boolean
  enableScreenReader?: boolean
  enableHapticFeedback?: boolean
}

export function MobileAccessibility({
  children,
  enableVoiceCommands = true,
  enableScreenReader = true,
  enableHapticFeedback = true
}: MobileAccessibilityProps) {
  const { isMobile, isTouch } = useDeviceInfo()
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    voiceCommands: false,
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    soundEffects: true,
    hapticFeedback: true,
    keyboardNavigation: false
  })
  
  const [isListening, setIsListening] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize accessibility features
  useEffect(() => {
    if (!isMobile) return

    // Load saved settings
    const savedSettings = localStorage.getItem('mobile-accessibility-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'
        
        recognitionRef.current.onresult = handleVoiceCommand
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }
      }
    }

    // Detect system accessibility preferences
    detectSystemPreferences()

  }, [isMobile])

  // Save settings when changed
  useEffect(() => {
    localStorage.setItem('mobile-accessibility-settings', JSON.stringify(settings))
    applyAccessibilitySettings()
  }, [settings])

  const detectSystemPreferences = () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }))
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }))
    }

    // Check for color scheme preference
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }

  const applyAccessibilitySettings = () => {
    const root = document.documentElement

    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation')
    } else {
      root.classList.remove('keyboard-navigation')
    }
  }

  const handleVoiceCommand = useCallback((event: SpeechRecognitionEvent) => {
    if (!enableVoiceCommands) return

    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase()
    
    // Voice command processing
    if (transcript.includes('search')) {
      announceAction('Opening search')
      // Trigger search functionality
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    } else if (transcript.includes('add bookmark')) {
      announceAction('Adding new bookmark')
      // Trigger add bookmark
      const addButton = document.querySelector('[data-action="add-bookmark"]') as HTMLButtonElement
      if (addButton) {
        addButton.click()
      }
    } else if (transcript.includes('go back')) {
      announceAction('Going back')
      window.history.back()
    } else if (transcript.includes('refresh')) {
      announceAction('Refreshing page')
      window.location.reload()
    } else if (transcript.includes('help')) {
      announceAction('Available commands: search, add bookmark, go back, refresh, help')
    }
  }, [enableVoiceCommands])

  const announceAction = (text: string) => {
    if (!enableScreenReader || !synthRef.current) return

    setAnnouncement(text)
    
    if (settings.soundEffects) {
      // Play sound effect
      playAccessibilitySound('action')
    }

    if (settings.screenReader) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.volume = 0.8
      synthRef.current.speak(utterance)
    }

    if (settings.hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const playAccessibilitySound = (type: 'action' | 'error' | 'success') => {
    if (!settings.soundEffects) return

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different tones for different actions
    switch (type) {
      case 'action':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        break
      case 'success':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        break
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        break
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  const toggleVoiceCommands = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      announceAction('Voice commands disabled')
    } else {
      recognitionRef.current.start()
      setIsListening(true)
      announceAction('Voice commands enabled. Say "help" for available commands.')
    }
  }

  const toggleSetting = (setting: keyof AccessibilitySettings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [setting]: !prev[setting] }
      
      // Announce the change
      const action = newSettings[setting] ? 'enabled' : 'disabled'
      announceAction(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${action}`)
      
      return newSettings
    })
  }

  // Keyboard navigation handler
  useEffect(() => {
    if (!settings.keyboardNavigation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case '/':
          event.preventDefault()
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement
          if (searchInput) {
            searchInput.focus()
            announceAction('Search focused')
          }
          break
        case 'a':
          if (event.ctrlKey || event.metaKey) return
          event.preventDefault()
          const addButton = document.querySelector('[data-action="add-bookmark"]') as HTMLButtonElement
          if (addButton) {
            addButton.click()
            announceAction('Add bookmark activated')
          }
          break
        case 'h':
          event.preventDefault()
          announceAction('Keyboard shortcuts: / for search, a for add bookmark, r for refresh, ? for help')
          break
        case 'r':
          if (event.ctrlKey || event.metaKey) return
          event.preventDefault()
          window.location.reload()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [settings.keyboardNavigation])

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div className="mobile-accessibility-wrapper">
      {/* Accessibility Controls */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        {/* Voice Commands Toggle */}
        {enableVoiceCommands && (
          <Button
            variant={isListening ? "default" : "outline"}
            size="sm"
            onClick={toggleVoiceCommands}
            className="h-10 w-10 p-0"
            aria-label={isListening ? "Disable voice commands" : "Enable voice commands"}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        )}

        {/* Quick Settings */}
        <div className="flex flex-col gap-1">
          <Button
            variant={settings.highContrast ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSetting('highContrast')}
            className="h-8 w-8 p-0"
            aria-label="Toggle high contrast"
          >
            <Contrast className="h-3 w-3" />
          </Button>
          
          <Button
            variant={settings.largeText ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSetting('largeText')}
            className="h-8 w-8 p-0"
            aria-label="Toggle large text"
          >
            <Type className="h-3 w-3" />
          </Button>
          
          <Button
            variant={settings.screenReader ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSetting('screenReader')}
            className="h-8 w-8 p-0"
            aria-label="Toggle screen reader"
          >
            <Volume2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Announcement Region */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Main Content */}
      <div 
        className={`mobile-accessible-content ${settings.keyboardNavigation ? 'keyboard-navigation' : ''}`}
        role="main"
        aria-label="Main content"
      >
        {children}
      </div>

      {/* Accessibility Status */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 left-4 bg-black/80 text-white text-xs p-2 rounded z-50">
          <div className="flex items-center gap-2 mb-1">
            <Accessibility className="h-3 w-3" />
            <span>Accessibility</span>
          </div>
          {settings.screenReader && <Badge variant="outline" className="text-xs">Screen Reader</Badge>}
          {isListening && <Badge variant="outline" className="text-xs">Voice Commands</Badge>}
          {settings.highContrast && <Badge variant="outline" className="text-xs">High Contrast</Badge>}
          {settings.largeText && <Badge variant="outline" className="text-xs">Large Text</Badge>}
        </div>
      )}
    </div>
  )
}

// CSS for accessibility features
export const accessibilityStyles = `
  .high-contrast {
    filter: contrast(1.5) brightness(1.2);
  }

  .large-text {
    font-size: 1.2em !important;
  }

  .large-text * {
    font-size: inherit !important;
  }

  .reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .keyboard-navigation *:focus {
    outline: 3px solid #3b82f6 !important;
    outline-offset: 2px !important;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Focus indicators for touch devices */
  .mobile-accessible-content button:focus-visible,
  .mobile-accessible-content a:focus-visible,
  .mobile-accessible-content input:focus-visible {
    outline: 3px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Improved touch targets */
  .mobile-accessible-content button,
  .mobile-accessible-content a {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
` 