'use client'

import { useState, useEffect, useCallback } from 'react'
import { NotificationSettings, NotificationHistory, UserNotificationPreferences } from '../types'

export const useNotifications = (bookmarkId?: string) => {
  const [notifications, setNotifications] = useState<NotificationSettings[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userId = 'dev-user-123' // In production, this would come from auth context

  // Load notifications for a specific bookmark or all user notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        user_id: userId,
        type: 'notifications'
      })
      
      if (bookmarkId) {
        params.append('bookmark_id', bookmarkId)
      }

      const response = await fetch(`/api/notifications?${params}`)
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to load notifications')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications'
      setError(errorMessage)
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [bookmarkId, userId])

  // Create a new notification
  const createNotification = useCallback(async (notification: Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notification',
          action: 'create',
          data: notification
        })
      })

      const result = await response.json()

      if (result.success) {
        // Reload notifications to get the updated list
        await loadNotifications()
        return result
      } else {
        throw new Error(result.error || 'Failed to create notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification'
      setError(errorMessage)
      console.error('Error creating notification:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [loadNotifications])

  // Update an existing notification
  const updateNotification = useCallback(async (id: string, updates: Partial<NotificationSettings>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notification',
          action: 'update',
          data: { id, ...updates }
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setNotifications((prev: NotificationSettings[]) => prev.map((notification: NotificationSettings) => 
          notification.id === id 
            ? { ...notification, ...updates, updatedAt: new Date() }
            : notification
        ))
      } else {
        throw new Error(result.error || 'Failed to update notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update notification'
      setError(errorMessage)
      console.error('Error updating notification:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/notifications?id=${id}&user_id=${userId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setNotifications(prev => prev.filter(notification => notification.id !== id))
      } else {
        throw new Error(result.error || 'Failed to delete notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification'
      setError(errorMessage)
      console.error('Error deleting notification:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Toggle notification active status
  const toggleNotification = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'notification',
          action: 'toggle',
          data: { id }
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setNotifications(prev => prev.map(notification => 
          notification.id === id 
            ? { ...notification, isActive: !notification.isActive, updatedAt: new Date() }
            : notification
        ))
      } else {
        throw new Error(result.error || 'Failed to toggle notification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle notification'
      setError(errorMessage)
      console.error('Error toggling notification:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Load notification history
  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        user_id: userId,
        type: 'history'
      })
      
      if (bookmarkId) {
        params.append('bookmark_id', bookmarkId)
      }

      const response = await fetch(`/api/notifications?${params}`)
      const result = await response.json()

      if (result.success) {
        setHistory(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to load notification history')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load notification history'
      setError(errorMessage)
      console.error('Error loading notification history:', err)
    } finally {
      setLoading(false)
    }
  }, [bookmarkId, userId])

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        user_id: userId,
        type: 'preferences'
      })

      const response = await fetch(`/api/notifications?${params}`)
      const result = await response.json()

      if (result.success) {
        setPreferences(result.data || null)
      } else {
        throw new Error(result.error || 'Failed to load preferences')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load preferences'
      setError(errorMessage)
      console.error('Error loading preferences:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Update user preferences
  const updatePreferences = useCallback(async (updates: Partial<UserNotificationPreferences>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'preferences',
          action: 'update',
          data: updates
        })
      })

      const result = await response.json()

      if (result.success) {
        // Update local state
        setPreferences(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null)
      } else {
        throw new Error(result.error || 'Failed to update preferences')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences'
      setError(errorMessage)
      console.error('Error updating preferences:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    loadPreferences()
    loadHistory()
  }, [loadNotifications, loadPreferences, loadHistory])

  return {
    notifications,
    history,
    preferences,
    loading,
    error,
    createNotification,
    updateNotification,
    deleteNotification,
    toggleNotification,
    updatePreferences,
    loadNotifications,
    loadHistory,
    loadPreferences
  }
}