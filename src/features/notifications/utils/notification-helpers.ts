import { isThisMonth, isThisWeek, isToday, isYesterday } from 'date-fns';

import type { NotificationType } from '@/schemas/notifications';
import { useTranslations } from 'next-intl';

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

  // 通知をグループに振り分け
  for (const notification of notifications) {
    const key = getDateGroupKey(notification.created_at);
    groups[key].push(notification);
  }

  // ラベル付きのグループ配列を作成（空のグループは除外）
  const groupLabels: Record<DateGroupKey, string> = {
    today: t('time.today'),
    yesterday: t('time.yesterday'),
    thisWeek: t('time.thisWeek'),
    thisMonth: t('time.thisMonth'),
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

/**
 * 通知タイプのアイコン名を取得
 */
export function getNotificationTypeIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    reminder: 'bell',
    plan_created: 'plus-circle',
    plan_updated: 'edit',
    plan_deleted: 'trash',
    plan_completed: 'check-circle',
    trash_warning: 'alert-triangle',
    system: 'info',
  };
  return icons[type] || 'bell';
}

export const getNotificationTypeColor = (type: string) => {
  switch (type) {
    case 'system':
      return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
    case 'feature':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
    case 'important':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
    default:
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
  }
};

export const useNotificationTypeLabel = () => {
  const t = useTranslations();

  return (type: string) => {
    switch (type) {
      case 'system':
        return t('notification.types.system');
      case 'feature':
        return t('notification.types.feature');
      case 'important':
        return t('notification.types.important');
      case 'reminder':
        return t('notification.types.reminder');
      case 'task':
        return t('notification.types.task');
      case 'event':
        return t('notification.types.event');
      default:
        return t('notification.types.general');
    }
  };
};

export const formatNotificationDate = (date: string | Date, locale: string = 'ja-JP') => {
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString(locale);
  }
  return date.toLocaleDateString(locale);
};

export const checkBrowserNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const requestNotificationPermission = async (
  t?: (key: string) => string,
): Promise<NotificationPermission> => {
  if (!checkBrowserNotificationSupport()) {
    const message = t
      ? t('notification.errors.notSupported')
      : 'このブラウザは通知をサポートしていません';
    console.warn(message);
    return 'denied';
  }

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (error) {
    const message = t ? t('notification.errors.permissionFailed') : '通知許可の取得に失敗しました';
    console.error(message, error);
    return 'denied';
  }
};

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

    // デフォルト10秒後に自動で閉じる
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  } catch (error) {
    const message = t ? t('notification.errors.displayFailed') : 'ブラウザ通知の表示に失敗しました';
    console.error(message, error);
    return null;
  }
};
