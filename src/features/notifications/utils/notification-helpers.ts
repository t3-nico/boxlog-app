/**
 * Re-export from shared lib for backward compatibility
 * 実体は @/lib/notification-helpers に移動済み
 */
export {
  checkBrowserNotificationSupport,
  getDateGroupKey,
  groupNotificationsByDate,
  requestNotificationPermission,
  showBrowserNotification,
} from '@/lib/notification-helpers';
export type { DateGroupKey, GroupedNotifications } from '@/lib/notification-helpers';
