// Notification system types

import type { CalendarEvent } from '@/features/events/types/events'

export interface SystemNotification {
  id: number | string
  title: string
  content: string
  date: string
  isRead: boolean
  type: 'system' | 'feature' | 'important' | 'general'
}

export interface NotificationItem {
  id: string
  eventId: string
  title: string
  message: string
  timestamp: Date
}

export interface NotificationPermissionState {
  status: NotificationPermission
  hasRequested: boolean
}

export interface UseNotificationsOptions {
  events: CalendarEvent[] // Event type from events
  onReminderTriggered?: (event: CalendarEvent, reminder: Reminder) => void
}

export interface NotificationDisplayProps {
  notifications: NotificationItem[]
  onDismiss: (id: string) => void
  onClearAll: () => void
}

export interface NotificationsListProps {
  notifications?: SystemNotification[]
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  browserNotifications: boolean
  reminderMinutes: number[]
  weeklyDigest: boolean
  systemNotifications: boolean
}