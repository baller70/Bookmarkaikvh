'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useDeviceInfo } from '@/hooks/use-mobile'

interface MobilePerformanceOptimizerProps {
  children: React.ReactNode
  enableVirtualScrolling?: boolean
  enableLazyLoading?: boolean
  enableResourceOptimization?: boolean
}

interface PerformanceMetrics {
  memoryUsage: number
  renderTime: number
  scrollPerformance: number
  networkStatus: 'online' | 'offline' | 'slow'
}

export function MobilePerformanceOptimizer({
  children,
  enableVirtualScrolling = true,
  enableLazyLoading = true,
  enableResourceOptimization = true
}: MobilePerformanceOptimizerProps) {
  const { isMobile, isLowEndDevice, connectionSpeed } = useDeviceInfo()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    scrollPerformance: 0,
    networkStatus: 'online'
  })

  // Performance monitoring
  useEffect(() => {
    if (!isMobile) return

    const measurePerformance = () => {
      // Memory usage (if available)
      const memory = (performance as any).memory
      if (memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        }))
      }

      // Network status
      const connection = (navigator as any).connection
      if (connection) {
        const networkStatus = connection.effectiveType === '4g' ? 'online' :
                            connection.effectiveType === '3g' ? 'slow' : 'offline'
        setMetrics(prev => ({ ...prev, networkStatus }))
      }
    }

    const interval = setInterval(measurePerformance, 5000)
    measurePerformance()

    return () => clearInterval(interval)
  }, [isMobile])

  // Resource optimization for mobile
  useEffect(() => {
    if (!enableResourceOptimization || !isMobile) return

    // Reduce animation frame rate on low-end devices
    if (isLowEndDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.6s')
      document.documentElement.style.setProperty('--transition-duration', '0.3s')
    }

    // Optimize images for mobile
    const images = document.querySelectorAll('img')
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy'
      }
      if (!img.decoding) {
        img.decoding = 'async'
      }
    })

    // Preconnect to critical domains
    const preconnectDomains = [
      'https://api.openai.com',
      'https://supabase.com'
    ]

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      document.head.appendChild(link)
    })

  }, [enableResourceOptimization, isMobile, isLowEndDevice])

  // Virtual scrolling optimization
  const optimizedChildren = useMemo(() => {
    if (!enableVirtualScrolling || !isMobile) return children

    // Add virtual scrolling wrapper for large lists
    return (
      <div className="mobile-virtual-scroll">
        {children}
      </div>
    )
  }, [children, enableVirtualScrolling, isMobile])

  // Lazy loading intersection observer
  useEffect(() => {
    if (!enableLazyLoading || !isMobile) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            element.classList.add('mobile-loaded')
            observer.unobserve(element)
          }
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    // Observe lazy-loadable elements
    const lazyElements = document.querySelectorAll('.mobile-lazy')
    lazyElements.forEach(el => observer.observe(el))

    return () => observer.disconnect()
  }, [enableLazyLoading, isMobile])

  // Performance warning for developers
  useEffect(() => {
    if (metrics.memoryUsage > 80) {
      console.warn('⚠️ High memory usage detected:', metrics.memoryUsage.toFixed(1) + '%')
    }
    if (metrics.networkStatus === 'slow') {
      console.warn('⚠️ Slow network detected, consider reducing resource usage')
    }
  }, [metrics])

  return (
    <div 
      className={`mobile-performance-optimized ${isMobile ? 'mobile-optimized' : ''}`}
      data-performance-metrics={JSON.stringify(metrics)}
    >
      {optimizedChildren}
      
      {/* Performance indicator for development */}
      {process.env.NODE_ENV === 'development' && isMobile && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50">
          <div>Memory: {metrics.memoryUsage.toFixed(1)}%</div>
          <div>Network: {metrics.networkStatus}</div>
          <div className={`w-2 h-2 rounded-full ${
            metrics.memoryUsage < 50 ? 'bg-green-500' :
            metrics.memoryUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
        </div>
      )}
    </div>
  )
}

// CSS classes for mobile optimization
export const mobileOptimizationStyles = `
  .mobile-performance-optimized {
    /* GPU acceleration for smooth scrolling */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    will-change: scroll-position;
  }

  .mobile-optimized {
    /* Reduce repaints and reflows */
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    
    /* Optimize touch events */
    touch-action: manipulation;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-virtual-scroll {
    /* Enable hardware acceleration */
    transform: translate3d(0, 0, 0);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .mobile-lazy {
    /* Placeholder while loading */
    min-height: 100px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: mobile-loading 1.5s infinite;
  }

  .mobile-loaded {
    animation: none;
    background: none;
  }

  @keyframes mobile-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .mobile-performance-optimized * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .mobile-performance-optimized {
      filter: contrast(1.2);
    }
  }
` 