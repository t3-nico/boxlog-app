// Components
export { NotificationDropdown } from './components/NotificationDropdown';
export { NotificationItem } from './components/NotificationItem';

// Hooks
export { useNotificationPreferences } from './hooks/useNotificationPreferences';
export { useNotifications } from './hooks/useNotifications';

// Types
export { NOTIFICATION_PRIORITY_CONFIG, NOTIFICATION_TYPE_ICONS } from './types';
export type {
  CreateNotificationRequest,
  Notification,
  NotificationEntity,
  NotificationIcon,
  NotificationPriority,
  NotificationType,
} from './types';

// Utilities
export {
  checkBrowserNotificationSupport,
  getDateGroupKey,
  getNotificationTypeIcon,
  groupNotificationsByDate,
  mapNotificationTypeToSettingsType,
  requestNotificationPermission,
  showBrowserNotification,
} from './utils/notification-helpers';
export type {
  DateGroupKey,
  GroupedNotifications,
  NotificationSettingsType,
} from './utils/notification-helpers';

// Transformers
export { transformNotificationEntities, transformNotificationEntity } from './lib/transformers';
