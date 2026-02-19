import { isThisMonth, isThisWeek, isToday, isYesterday } from 'date-fns';

import { logger } from '@/lib/logger';
import type { NotificationType } from '@/schemas/notifications';

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

export const checkBrowserNotificationSupport = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const requestNotificationPermission = async (
  t?: (key: string) => string,
): Promise<NotificationPermission> => {
  if (!checkBrowserNotificationSupport()) {
    const message = t
      ? t('notification.errors.notSupported')
      : 'Browser notifications not supported';
    logger.warn(message);
    return 'denied';
  }

  try {
    const result = await Notification.requestPermission();
    return result;
  } catch (error) {
    const message = t
      ? t('notification.errors.permissionFailed')
      : 'Failed to request notification permission';
    logger.error(message, error);
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
    const message = t
      ? t('notification.errors.displayFailed')
      : 'Failed to display browser notification';
    logger.error(message, error);
    return null;
  }
};

// 通知設定用タイプ
export type NotificationSettingsType = 'reminders' | 'plan_updates' | 'system';

/**
 * DB通知タイプを設定用タイプにマッピング
 */
export function mapNotificationTypeToSettingsType(
  type: NotificationType,
): NotificationSettingsType | null {
  switch (type) {
    case 'reminder':
      return 'reminders';
    case 'plan_created':
    case 'plan_updated':
    case 'plan_deleted':
    case 'plan_completed':
      return 'plan_updates';
    case 'trash_warning':
    case 'system':
      return 'system';
    default:
      return null;
  }
}
