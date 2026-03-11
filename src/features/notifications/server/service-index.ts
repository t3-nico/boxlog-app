/**
 * Notification Service Module
 */

export {
  NotificationService,
  NotificationServiceError,
  createNotificationService,
} from './notification-service';
export type {
  CreateNotificationOptions,
  DeleteNotificationsOptions,
  ListNotificationsOptions,
  MarkAllAsReadOptions,
  NotificationRow,
  ServiceSupabaseClient,
  UpdateNotificationOptions,
} from './types';
