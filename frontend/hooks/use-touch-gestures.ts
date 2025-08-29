"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

export interface TouchGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  onPullRefresh?: () => void
  swipeThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  pullRefreshThreshold?: number
}

export interface TouchState {
  isTouch: boolean
  isSwiping: boolean
  isPinching: boolean
  isLongPressing: boolean
  isPullingRefresh: boolean
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null
  pinchScale: number
  pullDistance: number
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onDoubleTap,
    onLongPress,
    onPullRefresh,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pullRefreshThreshold = 80,
  } = options

  const [touchState, setTouchState] = useState<TouchState>({
    isTouch: false,
    isSwiping: false,
    isPinching: false,
    isLongPressing: false,
    isPullingRefresh: false,
    swipeDirection: null,
    pinchScale: 1,
    pullDistance: 0,
  })

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTap = useRef<number>(0)
  const initialPinchDistance = useRef<number>(0)
  const currentPinchDistance = useRef<number>(0)

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    const now = Date.now()

    setTouchState(prev => ({ ...prev, isTouch: true }))

    if (e.touches.length === 1) {
      // Single touch
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      }

      // Check for double tap
      if (onDoubleTap && now - lastTap.current < doubleTapDelay) {
        onDoubleTap()
        lastTap.current = 0
      } else {
        lastTap.current = now
      }

      // Start long press timer
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          setTouchState(prev => ({ ...prev, isLongPressing: true }))
          onLongPress()
        }, longPressDelay)
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture
      initialPinchDistance.current = getDistance(e.touches[0], e.touches[1])
      setTouchState(prev => ({ ...prev, isPinching: true }))
    }
  }, [onDoubleTap, onLongPress, doubleTapDelay, longPressDelay, getDistance])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.touches[0]

    if (e.touches.length === 1) {
      const deltaX = touch.clientX - touchStart.current.x
      const deltaY = touch.clientY - touchStart.current.y
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Clear long press if moving
      if (longPressTimer.current && distance > 10) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
        setTouchState(prev => ({ ...prev, isLongPressing: false }))
      }

      // Check for swipe
      if (distance > swipeThreshold) {
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
        let direction: 'left' | 'right' | 'up' | 'down'

        if (angle > -45 && angle <= 45) {
          direction = 'right'
        } else if (angle > 45 && angle <= 135) {
          direction = 'down'
        } else if (angle > 135 || angle <= -135) {
          direction = 'left'
        } else {
          direction = 'up'
        }

        setTouchState(prev => ({
          ...prev,
          isSwiping: true,
          swipeDirection: direction,
        }))
      }

      // Check for pull to refresh (only when at top of page)
      if (onPullRefresh && window.scrollY === 0 && deltaY > 0) {
        const pullDistance = Math.min(deltaY, pullRefreshThreshold * 2)
        setTouchState(prev => ({
          ...prev,
          isPullingRefresh: pullDistance > pullRefreshThreshold,
          pullDistance,
        }))
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture
      currentPinchDistance.current = getDistance(e.touches[0], e.touches[1])
      const scale = currentPinchDistance.current / initialPinchDistance.current

      setTouchState(prev => ({ ...prev, pinchScale: scale }))

      if (onPinch) {
        onPinch(scale)
      }
    }
  }, [swipeThreshold, onPinch, onPullRefresh, pullRefreshThreshold, getDistance])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return

    const touch = e.changedTouches[0]
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // Handle swipe completion
    if (touchState.isSwiping && touchState.swipeDirection) {
      switch (touchState.swipeDirection) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }
    }

    // Handle pull to refresh completion
    if (touchState.isPullingRefresh && onPullRefresh) {
      onPullRefresh()
    }

    // Reset touch state
    setTouchState({
      isTouch: false,
      isSwiping: false,
      isPinching: false,
      isLongPressing: false,
      isPullingRefresh: false,
      swipeDirection: null,
      pinchScale: 1,
      pullDistance: 0,
    })

    touchStart.current = null
    touchEnd.current = null
  }, [touchState, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPullRefresh])

  // Bind event listeners
  const bindGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    touchState,
    bindGestures,
  }
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const handlePullRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      setPullDistance(0)
    }
  }, [onRefresh, isRefreshing])

  const { touchState, bindGestures } = useTouchGestures({
    onPullRefresh: handlePullRefresh,
    pullRefreshThreshold: 80,
  })

  useEffect(() => {
    setPullDistance(touchState.pullDistance)
  }, [touchState.pullDistance])

  return {
    isRefreshing,
    pullDistance,
    isPulling: touchState.isPullingRefresh,
    bindGestures,
  }
}

// Hook for swipe actions on list items
export function useSwipeActions(actions: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}) {
  const { touchState, bindGestures } = useTouchGestures({
    onSwipeLeft: actions.onSwipeLeft,
    onSwipeRight: actions.onSwipeRight,
    swipeThreshold: 100,
  })

  return {
    isSwiping: touchState.isSwiping,
    swipeDirection: touchState.swipeDirection,
    bindGestures,
  }
}

// Hook for pinch-to-zoom functionality
export function usePinchZoom(onZoom?: (scale: number) => void) {
  const [scale, setScale] = useState(1)

  const handlePinch = useCallback((newScale: number) => {
    setScale(newScale)
    onZoom?.(newScale)
  }, [onZoom])

  const { touchState, bindGestures } = useTouchGestures({
    onPinch: handlePinch,
  })

  return {
    scale,
    isPinching: touchState.isPinching,
    bindGestures,
  }
} 