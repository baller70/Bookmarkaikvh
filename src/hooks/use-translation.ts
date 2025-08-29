'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TranslationData {
  [key: string]: any
}

interface UseTranslationReturn {
  t: (key: string, params?: Record<string, string | number>) => string
  locale: string
  isLoading: boolean
  error: string | null
}

export function useTranslation(namespace: string = 'common'): UseTranslationReturn {
  const router = useRouter()
  const [translations, setTranslations] = useState<TranslationData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get current locale from URL or default to 'en'
  const getLocale = (): string => {
    if (typeof window === 'undefined') return 'en'
    const pathSegments = window.location.pathname.split('/')
    const potentialLocale = pathSegments[1]
    const supportedLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi']
    return supportedLocales.includes(potentialLocale) ? potentialLocale : 'en'
  }

  const [locale, setLocale] = useState(getLocale())

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/locales/${locale}/${namespace}.json`)
        if (!response.ok) {
          // Fallback to English if translation file doesn't exist
          const fallbackResponse = await fetch(`/locales/en/${namespace}.json`)
          if (!fallbackResponse.ok) {
            throw new Error('Translation files not found')
          }
          const fallbackData = await fallbackResponse.json()
          setTranslations(fallbackData)
        } else {
          const data = await response.json()
          setTranslations(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load translations')
        console.error('Translation loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTranslations()
  }, [locale, namespace])

  // Update locale when URL changes
  useEffect(() => {
    const handleRouteChange = () => {
      const newLocale = getLocale()
      if (newLocale !== locale) {
        setLocale(newLocale)
      }
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [locale])

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (isLoading) return key
    if (error) return key

    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters in the translation
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  return { t, locale, isLoading, error }
} 