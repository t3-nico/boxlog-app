import { isThisMonth, isThisWeek, isToday, isYesterday } from 'date-fns';

import { checkBrowserNotificationSupport } from '@/lib/browser-notification';
import { logger } from '@/lib/logger';

// Browser Notification API ラッパーを re-export
export {
  checkBrowserNotificationSupport,
  requestNotificationPermission,
} from '@/lib/browser-notification';

// 日付グループのキー
export type DateGroupKey = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'older';

// グループ化された通知
export interface GroupedNotifications<T> {
  key: DateGroupKey;
  label: string;
  notifications: T[];
}

/**
 * 日付からグループキーを取得
 */
export function getDateGroupKey(date: Date | string): DateGroupKey {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) return 'today';
  if (isYesterday(d)) return 'yesterday';
  if (isThisWeek(d, { weekStartsOn: 1 })) return 'thisWeek';
  if (isThisMonth(d)) return 'thisMonth';
  return 'older';
}

/**
 * 通知を日付グループでグループ化
 */
export function groupNotificationsByDate<T extends { created_at: string }>(
  notifications: T[],
  t: (key: string) => string,
): GroupedNotifications<T>[] {
  const groups: Record<DateGroupKey, T[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  for (const notification of notifications) {
    const key = getDateGroupKey(notification.created_at);
    groups[key].push(notification);
  }

  const groupLabels: Record<DateGroupKey, string> = {
    today: t('common.time.today'),
    yesterday: t('common.time.yesterday'),
    thisWeek: t('common.time.thisWeek'),
    thisMonth: t('common.time.thisMonth'),
    older: t('notification.dateGroups.older'),
  };

  const orderedKeys: DateGroupKey[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];

  return orderedKeys
    .filter((key) => groups[key].length > 0)
    .map((key) => ({
      key,
      label: groupLabels[key],
      notifications: groups[key],
    }));
}

export const showBrowserNotification = (
  title: string,
  options?: NotificationOptions,
  t?: (key: string) => string,
) => {
  if (!checkBrowserNotificationSupport() || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: true,
      ...options,
    });

    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  } catch (error) {
    const message = t
      ? t('notification.errors.displayFailed')
      : 'Failed to display browser notification';
    logger.error(message, error);
    return null;
  }
};
