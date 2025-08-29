'use client'

import { useState, useEffect, useCallback } from 'react'
import { NotificationSettings, NotificationHistory, UserNotificationPreferences } from '../types'

export const useNotifications = (bookmarkId?: string) => {
  const [notifications, setNotifications] = useState<NotificationSettings[]>([])
  const [history, setHistory] = useState<NotificationHistory[]>([])
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load notifications for a specific bookmark or all user notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API call
      const mockNotifications: NotificationSettings[] = [
        {
          id: '1',
          bookmarkId: bookmarkId || '1',
          userId: 'user-1',
          title: 'Daily Review Reminder',
          message: 'Time to review your bookmarked resources',
          type: 'reminder',
          frequency: 'daily',
          deliveryMethods: ['in-app', 'email'],
          scheduledTime: new Date('2024-01-20T09:00:00'),
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          nextSend: new Date('2024-01-20T09:00:00')
        }
      ]
      setNotifications(mockNotifications)
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [bookmarkId])

  // Create a new notification
  const createNotification = useCallback(async (notification: Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const newNotification: NotificationSettings = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setNotifications(prev => [...prev, newNotification])
      return newNotification
    } catch (err) {
      setError('Failed to create notification')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update an existing notification
  const updateNotification = useCallback(async (id: string, updates: Partial<NotificationSettings>) => {
    setLoading(true)
    setError(null)
    try {
      setNotifications(prev => prev.map(notification => 
        notification.id === id 
          ? { ...notification, ...updates, updatedAt: new Date() }
          : notification
      ))
    } catch (err) {
      setError('Failed to update notification')
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
      setNotifications(prev => prev.filter(notification => notification.id !== id))
    } catch (err) {
      setError('Failed to delete notification')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle notification active status
  const toggleNotification = useCallback(async (id: string) => {
    await updateNotification(id, { 
      isActive: !notifications.find(n => n.id === id)?.isActive 
    })
  }, [notifications, updateNotification])

  // Load notification history
  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const mockHistory: NotificationHistory[] = []
      setHistory(mockHistory)
    } catch (err) {
      setError('Failed to load notification history')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load user preferences
  const loadPreferences = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      const mockPreferences: UserNotificationPreferences = {
        userId: 'user-1',
        enableInApp: true,
        enableEmail: true,
        enableSMS: false,
        enablePush: true,
        quietHours: {
          start: '22:00',
          end: '08:00',
          timezone: 'America/New_York'
        },
        emailDigest: 'daily'
      }
      setPreferences(mockPreferences)
    } catch (err) {
      setError('Failed to load preferences')
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
    loadNotifications,
    loadHistory,
    loadPreferences
  }
}