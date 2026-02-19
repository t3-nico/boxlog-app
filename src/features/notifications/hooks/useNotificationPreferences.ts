/**
 * useNotificationPreferences hook
 * 通知設定を取得し、通知の表示可否を判定する（ChatGPTスタイル対応）
 */

import { trpc } from '@/lib/trpc/client';

import type { NotificationType } from '@/schemas/notifications';

import {
  mapNotificationTypeToSettingsType,
  type NotificationSettingsType,
} from '../utils/notification-helpers';

// 配信方法の型
type DeliveryMethod = 'browser' | 'email' | 'push';

// 配信設定の型
type DeliverySettings = Record<NotificationSettingsType, DeliveryMethod[]>;

// デフォルトの配信設定
const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  reminders: ['browser'],
  plan_updates: ['browser'],
  system: ['browser'],
};

/**
 * 通知設定を取得するhook
 */
export function useNotificationPreferences() {
  const { data, isLoading, error } = trpc.notificationPreferences.get.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    refetchOnWindowFocus: false,
  });

  const deliverySettings: DeliverySettings =
    (data?.deliverySettings as DeliverySettings) ?? DEFAULT_DELIVERY_SETTINGS;

  /**
   * 指定した通知タイプで、指定した配信方法が有効か判定
   */
  const isDeliveryMethodEnabled = (
    notificationType: NotificationType,
    deliveryMethod: DeliveryMethod,
  ): boolean => {
    const settingsType = mapNotificationTypeToSettingsType(notificationType);
    if (!settingsType) {
      // 未知の通知タイプはデフォルトでブラウザ通知のみ許可
      return deliveryMethod === 'browser';
    }

    const methods = deliverySettings[settingsType] ?? [];
    return methods.includes(deliveryMethod);
  };

  /**
   * 通知タイプに基づいてToast表示可否を判定
   * （ブラウザ通知が有効な通知タイプのみToast表示）
   */
  const shouldShowNotification = (type: NotificationType): boolean => {
    return isDeliveryMethodEnabled(type, 'browser');
  };

  /**
   * ブラウザ通知を表示すべきか判定
   */
  const shouldShowBrowserNotification = (type: NotificationType): boolean => {
    return isDeliveryMethodEnabled(type, 'browser');
  };

  return {
    deliverySettings,
    isLoading,
    error,
    isDeliveryMethodEnabled,
    shouldShowNotification,
    shouldShowBrowserNotification,
  };
}

// 型エクスポート
export type { DeliveryMethod, DeliverySettings };
