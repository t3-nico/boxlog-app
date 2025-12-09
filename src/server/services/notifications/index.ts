/**
 * Notification Service Module
 */

export { createNotificationService, NotificationService, NotificationServiceError } from './notification-service'
export type {
  CreateNotificationOptions,
  DeleteNotificationsOptions,
  ListNotificationsOptions,
  MarkAllAsReadOptions,
  NotificationRow,
  ServiceSupabaseClient,
  UpdateNotificationOptions,
} from './types'
