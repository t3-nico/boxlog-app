// Notification system types

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

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

export interface Reminder {
  minutes: number
  notified: boolean
}

export interface UseNotificationsOptions {
  events: CalendarPlan[] // Event type from calendar
  onReminderTriggered?: (event: CalendarPlan, reminder: Reminder) => void
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
