// Components
export { NotificationDropdown } from './components/NotificationDropdown';
export { NotificationItem } from './components/NotificationItem';

// Hooks
export { useNotificationPreferences } from './hooks/useNotificationPreferences';
export { useNotifications } from './hooks/useNotifications';

// Types
export type { Notification, NotificationEntity, NotificationType } from './types';

// Utilities
export {
  checkBrowserNotificationSupport,
  getDateGroupKey,
  groupNotificationsByDate,
  requestNotificationPermission,
  showBrowserNotification,
} from './utils/notification-helpers';
export type { DateGroupKey, GroupedNotifications } from './utils/notification-helpers';

// Transformers
export { transformNotificationEntities, transformNotificationEntity } from './lib/transformers';
