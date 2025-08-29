import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { authenticateUser, createUnauthorizedResponse } from '@/lib/auth-utils';

// File-based storage for notification data
const NOTIFICATIONS_FILE = join(process.cwd(), 'data', 'notifications.json');

interface NotificationData {
  notifications: NotificationSettings[];
  history: NotificationHistory[];
  preferences: UserNotificationPreferences[];
}

interface NotificationSettings {
  id: string;
  bookmarkId: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'digest' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  deliveryMethods: ('in-app' | 'email' | 'sms' | 'push')[];
  scheduledTime: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  nextSend?: Date;
  customSchedule?: {
    days: string[];
    time: string;
    timezone: string;
  };
}

interface NotificationHistory {
  id: string;
  notificationId: string;
  userId: string;
  bookmarkId: string;
  title: string;
  message: string;
  deliveryMethod: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  sentAt: Date;
  deliveredAt?: Date;
  error?: string;
}

interface UserNotificationPreferences {
  userId: string;
  enableInApp: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  enablePush: boolean;
  quietHours: {
    start: string;
    end: string;
    timezone: string;
  };
  emailDigest: 'never' | 'daily' | 'weekly' | 'monthly';
  updatedAt: Date;
}

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true });
  }
}

// Load notification data from file
async function loadNotificationData(): Promise<NotificationData> {
  try {
    await ensureDataDirectory();
    if (!existsSync(NOTIFICATIONS_FILE)) {
      const defaultData: NotificationData = {
        notifications: [],
        history: [],
        preferences: []
      };
      await saveNotificationData(defaultData);
      return defaultData;
    }
    const data = await readFile(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data) as NotificationData;
  } catch (error) {
    console.error('❌ Error loading notification data:', error);
    return {
      notifications: [],
      history: [],
      preferences: []
    };
  }
}

// Save notification data to file
async function saveNotificationData(data: NotificationData): Promise<void> {
  try {
    await ensureDataDirectory();
    await writeFile(NOTIFICATIONS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error saving notification data:', error);
    throw error;
  }
}

// GET /api/notifications - Get notifications for user/bookmark
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createUnauthorizedResponse(authResult.error);
    }
    const userId = authResult.userId!;

    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('bookmark_id');
    const type = searchParams.get('type'); // notifications, history, preferences

    const data = await loadNotificationData();

    let result: any = {};

    if (type === 'notifications' || !type) {
      result.notifications = data.notifications.filter(notification => {
        const matchesUser = notification.userId === userId;
        const matchesBookmark = !bookmarkId || notification.bookmarkId === bookmarkId;
        return matchesUser && matchesBookmark;
      });
    }

    if (type === 'history' || !type) {
      result.history = data.history.filter(historyItem => {
        const matchesUser = historyItem.userId === userId;
        const matchesBookmark = !bookmarkId || historyItem.bookmarkId === bookmarkId;
        return matchesUser && matchesBookmark;
      });
    }

    if (type === 'preferences' || !type) {
      const userPreferences = data.preferences.find(pref => pref.userId === userId);
      result.preferences = userPreferences || {
        userId,
        enableInApp: true,
        enableEmail: true,
        enableSMS: false,
        enablePush: true,
        quietHours: {
          start: '22:00',
          end: '08:00',
          timezone: 'America/New_York'
        },
        emailDigest: 'daily',
        updatedAt: new Date()
      };
    }

    // Return specific type if requested
    if (type && result[type] !== undefined) {
      return NextResponse.json({
        success: true,
        data: result[type]
      });
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error fetching notification data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create or update notification data
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createUnauthorizedResponse(authResult.error);
    }
    const userId = authResult.userId!;
    
    const body = await request.json();
    const { type, action, data: itemData } = body;

    const data = await loadNotificationData();

    switch (type) {
      case 'notification':
        if (action === 'create') {
          const newNotification: NotificationSettings = {
            ...itemData,
            id: Date.now().toString(),
            userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            scheduledTime: new Date(itemData.scheduledTime),
            nextSend: itemData.nextSend ? new Date(itemData.nextSend) : undefined
          };
          data.notifications.push(newNotification);
        } else if (action === 'update') {
          const notificationIndex = data.notifications.findIndex(
            notification => notification.id === itemData.id && notification.userId === userId
          );
          if (notificationIndex !== -1) {
            data.notifications[notificationIndex] = {
              ...data.notifications[notificationIndex],
              ...itemData,
              updatedAt: new Date(),
              scheduledTime: itemData.scheduledTime ? new Date(itemData.scheduledTime) : data.notifications[notificationIndex].scheduledTime,
              nextSend: itemData.nextSend ? new Date(itemData.nextSend) : data.notifications[notificationIndex].nextSend
            };
          }
        } else if (action === 'delete') {
          data.notifications = data.notifications.filter(
            notification => !(notification.id === itemData.id && notification.userId === userId)
          );
        } else if (action === 'toggle') {
          const notificationIndex = data.notifications.findIndex(
            notification => notification.id === itemData.id && notification.userId === userId
          );
          if (notificationIndex !== -1) {
            data.notifications[notificationIndex].isActive = !data.notifications[notificationIndex].isActive;
            data.notifications[notificationIndex].updatedAt = new Date();
          }
        }
        break;

      case 'history':
        if (action === 'create') {
          const newHistoryItem: NotificationHistory = {
            ...itemData,
            id: Date.now().toString(),
            userId,
            sentAt: new Date(itemData.sentAt),
            deliveredAt: itemData.deliveredAt ? new Date(itemData.deliveredAt) : undefined
          };
          data.history.push(newHistoryItem);
        }
        break;

      case 'preferences':
        if (action === 'update') {
          const preferencesIndex = data.preferences.findIndex(pref => pref.userId === userId);
          if (preferencesIndex !== -1) {
            data.preferences[preferencesIndex] = {
              ...data.preferences[preferencesIndex],
              ...itemData,
              userId,
              updatedAt: new Date()
            };
          } else {
            // Create new preferences if they don't exist
            const newPreferences: UserNotificationPreferences = {
              ...itemData,
              userId,
              updatedAt: new Date()
            };
            data.preferences.push(newPreferences);
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type specified' },
          { status: 400 }
        );
    }

    await saveNotificationData(data);

    return NextResponse.json({
      success: true,
      message: `${type} ${action}d successfully`
    });

  } catch (error) {
    console.error('❌ Error updating notification data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createUnauthorizedResponse(authResult.error);
    }
    const userId = authResult.userId!;

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const data = await loadNotificationData();

    // Remove notification
    data.notifications = data.notifications.filter(
      notification => !(notification.id === notificationId && notification.userId === userId)
    );

    await saveNotificationData(data);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}    