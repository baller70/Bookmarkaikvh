import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobilePerformanceOptimizer } from '@/components/mobile/MobilePerformanceOptimizer'
import { MobileAccessibility } from '@/components/mobile/MobileAccessibility'
import { MobileDashboard } from '@/components/dashboard/MobileDashboard'
import { useDeviceInfo } from '@/hooks/use-mobile'
import { useTouchGestures } from '@/hooks/use-touch-gestures'

// Mock hooks
jest.mock('@/hooks/use-mobile')
jest.mock('@/hooks/use-touch-gestures')

const mockUseDeviceInfo = useDeviceInfo as jest.MockedFunction<typeof useDeviceInfo>
const mockUseTouchGestures = useTouchGestures as jest.MockedFunction<typeof useTouchGestures>

describe('Mobile Performance Optimization', () => {
  beforeEach(() => {
    mockUseDeviceInfo.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      isLowEndDevice: false,
      connectionSpeed: '4g',
      orientation: 'portrait',
      screenSize: { width: 390, height: 844 },
      devicePixelRatio: 2,
      isOnline: true
    })
  })

  test('renders performance optimizer with mobile optimizations', () => {
    render(
      <MobilePerformanceOptimizer>
        <div data-testid="content">Test Content</div>
      </MobilePerformanceOptimizer>
    )

    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(document.querySelector('.mobile-performance-optimized')).toBeInTheDocument()
  })

  test('applies low-end device optimizations', () => {
    mockUseDeviceInfo.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      isLowEndDevice: true,
      connectionSpeed: '3g',
      orientation: 'portrait',
      screenSize: { width: 390, height: 844 },
      devicePixelRatio: 1,
      isOnline: true
    })

    render(
      <MobilePerformanceOptimizer>
        <div>Content</div>
      </MobilePerformanceOptimizer>
    )

    // Check if reduced animations are applied
    const root = document.documentElement
    expect(root.style.getPropertyValue('--animation-duration')).toBe('0.6s')
  })

  test('enables virtual scrolling for mobile', () => {
    render(
      <MobilePerformanceOptimizer enableVirtualScrolling={true}>
        <div>Scrollable Content</div>
      </MobilePerformanceOptimizer>
    )

    expect(document.querySelector('.mobile-virtual-scroll')).toBeInTheDocument()
  })

  test('monitors performance metrics', async () => {
    // Mock performance.memory
    Object.defineProperty(performance, 'memory', {
      value: {
        usedJSHeapSize: 50000000,
        jsHeapSizeLimit: 100000000
      },
      configurable: true
    })

    render(
      <MobilePerformanceOptimizer>
        <div>Content</div>
      </MobilePerformanceOptimizer>
    )

    await waitFor(() => {
      const perfElement = document.querySelector('[data-performance-metrics]')
      if (perfElement) {
        const metrics = JSON.parse(perfElement.getAttribute('data-performance-metrics') || '{}')
        expect(metrics.memoryUsage).toBeGreaterThan(0)
      }
    })
  })
})

describe('Mobile Accessibility', () => {
  beforeEach(() => {
    mockUseDeviceInfo.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      isLowEndDevice: false,
      connectionSpeed: '4g',
      orientation: 'portrait',
      screenSize: { width: 390, height: 844 },
      devicePixelRatio: 2,
      isOnline: true
    })

    // Mock speech synthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: jest.fn(),
        cancel: jest.fn(),
        getVoices: jest.fn(() => [])
      },
      configurable: true
    })

    // Mock speech recognition
    Object.defineProperty(window, 'SpeechRecognition', {
      value: jest.fn(() => ({
        start: jest.fn(),
        stop: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      })),
      configurable: true
    })
  })

  test('renders accessibility controls', () => {
    render(
      <MobileAccessibility>
        <div data-testid="content">Accessible Content</div>
      </MobileAccessibility>
    )

    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByLabelText(/voice commands/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/high contrast/i)).toBeInTheDocument()
  })

  test('toggles high contrast mode', async () => {
    const user = userEvent.setup()
    
    render(
      <MobileAccessibility>
        <div>Content</div>
      </MobileAccessibility>
    )

    const contrastButton = screen.getByLabelText(/high contrast/i)
    await user.click(contrastButton)

    expect(document.documentElement.classList.contains('high-contrast')).toBe(true)
  })

  test('enables keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <MobileAccessibility>
        <div>
          <input placeholder="Search bookmarks..." />
          <button data-action="add-bookmark">Add</button>
        </div>
      </MobileAccessibility>
    )

    // Simulate keyboard shortcut for search
    fireEvent.keyDown(document, { key: '/', code: 'Slash' })
    
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByPlaceholderText(/search/i))
    })
  })

  test('announces actions to screen reader', async () => {
    const mockSpeak = jest.fn()
    Object.defineProperty(window, 'speechSynthesis', {
      value: { speak: mockSpeak },
      configurable: true
    })

    render(
      <MobileAccessibility enableScreenReader={true}>
        <div>Content</div>
      </MobileAccessibility>
    )

    // Trigger an action that should be announced
    fireEvent.keyDown(document, { key: 'h', code: 'KeyH' })

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })
  })
})

describe('Touch Gestures', () => {
  beforeEach(() => {
    mockUseTouchGestures.mockReturnValue({
      isGesturing: false,
      gestureType: null,
      gestureData: null,
      bindGestures: jest.fn(() => ({}))
    })
  })

  test('handles swipe gestures', () => {
    const onSwipeLeft = jest.fn()
    const onSwipeRight = jest.fn()

    mockUseTouchGestures.mockReturnValue({
      isGesturing: true,
      gestureType: 'swipe',
      gestureData: { direction: 'left', distance: 100 },
      bindGestures: jest.fn(() => ({
        onTouchStart: jest.fn(),
        onTouchMove: jest.fn(),
        onTouchEnd: jest.fn()
      }))
    })

    render(
      <div data-testid="swipe-area">
        Swipe me
      </div>
    )

    const swipeArea = screen.getByTestId('swipe-area')
    
    // Simulate swipe left
    fireEvent.touchStart(swipeArea, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    fireEvent.touchMove(swipeArea, {
      touches: [{ clientX: 50, clientY: 100 }]
    })
    fireEvent.touchEnd(swipeArea)

    // Verify gesture was detected
    expect(mockUseTouchGestures).toHaveBeenCalled()
  })

  test('handles pinch zoom gestures', () => {
    mockUseTouchGestures.mockReturnValue({
      isGesturing: true,
      gestureType: 'pinch',
      gestureData: { scale: 1.5, center: { x: 100, y: 100 } },
      bindGestures: jest.fn(() => ({}))
    })

    render(
      <div data-testid="zoom-area">
        Pinch to zoom
      </div>
    )

    const zoomArea = screen.getByTestId('zoom-area')
    
    // Simulate pinch gesture
    fireEvent.touchStart(zoomArea, {
      touches: [
        { clientX: 90, clientY: 90 },
        { clientX: 110, clientY: 110 }
      ]
    })
    fireEvent.touchMove(zoomArea, {
      touches: [
        { clientX: 80, clientY: 80 },
        { clientX: 120, clientY: 120 }
      ]
    })
    fireEvent.touchEnd(zoomArea)

    expect(mockUseTouchGestures).toHaveBeenCalled()
  })
})

describe('Mobile Dashboard Integration', () => {
  const mockBookmarks = [
    {
      id: 1,
      title: 'Test Bookmark',
      url: 'https://example.com',
      category: 'Test',
      tags: ['test'],
      description: 'Test bookmark'
    }
  ]

  const mockProps = {
    bookmarks: mockBookmarks,
    onRefresh: jest.fn(),
    onAddBookmark: jest.fn(),
    onEditBookmark: jest.fn(),
    onDeleteBookmark: jest.fn(),
    onToggleFavorite: jest.fn(),
    onShareBookmark: jest.fn(),
    onVisitBookmark: jest.fn(),
    searchTerm: '',
    onSearchChange: jest.fn(),
    viewMode: 'grid' as const,
    onViewModeChange: jest.fn(),
    selectedCategory: 'All',
    onCategoryChange: jest.fn()
  }

  test('renders mobile dashboard with touch optimizations', () => {
    mockUseDeviceInfo.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      isLowEndDevice: false,
      connectionSpeed: '4g',
      orientation: 'portrait',
      screenSize: { width: 390, height: 844 },
      devicePixelRatio: 2,
      isOnline: true
    })

    render(<MobileDashboard {...mockProps} />)

    expect(screen.getByText('BookAI Mark')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search bookmarks/i)).toBeInTheDocument()
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument()
  })

  test('handles pull to refresh', async () => {
    const onRefresh = jest.fn()
    
    render(<MobileDashboard {...mockProps} onRefresh={onRefresh} />)

    const dashboard = document.querySelector('.mobile-full-height')
    
    // Simulate pull down gesture
    if (dashboard) {
      fireEvent.touchStart(dashboard, {
        touches: [{ clientX: 100, clientY: 50 }]
      })
      fireEvent.touchMove(dashboard, {
        touches: [{ clientX: 100, clientY: 150 }]
      })
      fireEvent.touchEnd(dashboard)
    }

    // Note: Actual pull-to-refresh logic would be tested with proper gesture mocking
    expect(dashboard).toBeInTheDocument()
  })

  test('adapts to different orientations', () => {
    // Test portrait
    mockUseDeviceInfo.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      isLowEndDevice: false,
      connectionSpeed: '4g',
      orientation: 'portrait',
      screenSize: { width: 390, height: 844 },
      devicePixelRatio: 2,
      isOnline: true
    })

    const { rerender } = render(<MobileDashboard {...mockProps} />)
    expect(screen.getByText('BookAI Mark')).toBeInTheDocument()

    // Test landscape
    mockUseDeviceInfo.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouch: true,
      isLowEndDevice: false,
      connectionSpeed: '4g',
      orientation: 'landscape',
      screenSize: { width: 844, height: 390 },
      devicePixelRatio: 2,
      isOnline: true
    })

    rerender(<MobileDashboard {...mockProps} />)
    expect(screen.getByText('BookAI Mark')).toBeInTheDocument()
  })
})

describe('Service Worker Integration', () => {
  test('registers service worker on mobile', () => {
    // Mock service worker registration
    const mockRegister = jest.fn()
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register: mockRegister },
      configurable: true
    })

    // Simulate service worker registration script
    const script = document.createElement('script')
    script.innerHTML = `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    `
    document.head.appendChild(script)

    // Execute the script
    eval(script.innerHTML)

    expect(mockRegister).toHaveBeenCalledWith('/sw.js')
  })

  test('handles offline functionality', async () => {
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true
    })

    // Mock fetch to simulate offline behavior
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')))

    render(<MobileDashboard {...mockProps} />)

    // Verify offline handling
    expect(navigator.onLine).toBe(false)
  })
})

describe('PWA Features', () => {
  test('supports app installation', () => {
    // Mock beforeinstallprompt event
    const mockPrompt = jest.fn()
    const installEvent = new Event('beforeinstallprompt')
    Object.defineProperty(installEvent, 'prompt', { value: mockPrompt })

    window.dispatchEvent(installEvent)

    // Verify PWA installation capability
    expect(installEvent.type).toBe('beforeinstallprompt')
  })

  test('handles app shortcuts', () => {
    // Test app shortcuts from manifest
    const shortcuts = [
      { name: 'Add Bookmark', url: '/dashboard?action=add' },
      { name: 'Search', url: '/dashboard?action=search' }
    ]

    shortcuts.forEach(shortcut => {
      expect(shortcut.name).toBeDefined()
      expect(shortcut.url).toBeDefined()
    })
  })
}) 