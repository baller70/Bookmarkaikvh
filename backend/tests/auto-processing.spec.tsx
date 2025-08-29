/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import AutoProcessingPage from '../app/settings/ai/auto-processing/page'
import { vi, describe, it, expect } from 'vitest'

// Mock supabase auth
vi.mock('@/lib/supabase', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
        }),
      },
    },
  }
})

// Capture the settings passed to save
let lastSaved: Record<string, unknown> | null = null

// Mock linkpilot-service helpers
vi.mock('@/lib/linkpilot-service', () => {
  const defaultSettings: Record<string, unknown> = {
    processManual: true,
    processBulk: true,
    processBrowserCapture: true,
    paused: false,
    taggingEnabled: true,
    confidence: 60,
    tagStyle: 'singular',
    languageMode: 'detect',
    synonymMapping: false,
    normalization: true,
    manualReview: true,
    stripTracking: true,
    domainBlacklist: [],
    minWordCount: 100,
    duplicateHandling: 'skip',
    suggestFolder: true,
    autoFile: false,
    smartFolderContext: true,
    fallbackFolderId: 'inbox',
    draftExpirationDays: 7,
    rules: [],
    historyDepth: 50,
  }
  return {
    getAutoProcessingSettings: vi.fn().mockResolvedValue(defaultSettings),
    saveAutoProcessingSettings: vi.fn().mockImplementation((_userId: string, data: Record<string, unknown>) => {
      lastSaved = data
      return Promise.resolve()
    }),
  }
})

// Because the page uses import of lucide-react, recharts etc., we can silence those to focus on functionality
vi.mock('lucide-react', async () => await import('../tests/__mocks__/lucide-react'))
vi.mock('recharts', () => ({
  ResponsiveContainer: (props: any) => <div>{props.children}</div>,
  PieChart: () => null,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
}))

// Silence sonner toast
vi.mock('sonner', () => ({ toast: { success: () => {}, error: () => {}, info: () => {} } }))


describe('Auto-Processing page', () => {
  it('allows toggling "Pause all processing" and saving', async () => {
    render(<AutoProcessingPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByLabelText(/Pause all processing/i)).toBeInTheDocument()
    })

    const pauseSwitch = screen.getByLabelText(/Pause all processing/i) as HTMLInputElement
    expect(pauseSwitch.checked).toBe(false)

    // Toggle it on
    fireEvent.click(pauseSwitch)
    expect(pauseSwitch.checked).toBe(true)

    // Click Save
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(lastSaved && 'paused' in lastSaved ? lastSaved.paused : undefined).toBe(true)
    })
  })
}) 