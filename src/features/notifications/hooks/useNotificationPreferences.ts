/**
 * useNotificationPreferences hook
 * 通知設定を取得し、通知の表示可否を判定する（ChatGPTスタイル対応）
 */

import { trpc } from '@/lib/trpc/client';

// 配信方法の型
type DeliveryMethod = 'browser' | 'email' | 'push';

// 通知タイプの型（設定用）
type NotificationSettingsType = 'reminders' | 'plan_updates' | 'system';

// 配信設定の型
type DeliverySettings = Record<NotificationSettingsType, DeliveryMethod[]>;

// デフォルトの配信設定
const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  reminders: ['browser'],
  plan_updates: ['browser'],
  system: ['browser'],
};

/**
 * DB通知タイプを設定用タイプにマッピング
 */
function mapNotificationTypeToSettingsType(type: string): NotificationSettingsType | null {
  switch (type) {
    case 'reminder':
      return 'reminders';
    case 'plan_created':
    case 'plan_updated':
    case 'plan_deleted':
    case 'plan_completed':
      return 'plan_updates';
    case 'system':
      return 'system';
    default:
      return null;
  }
}

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
    notificationType: string,
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
  const shouldShowNotification = (type: string): boolean => {
    return isDeliveryMethodEnabled(type, 'browser');
  };

  /**
   * ブラウザ通知を表示すべきか判定
   */
  const shouldShowBrowserNotification = (type: string): boolean => {
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
export type { DeliveryMethod, DeliverySettings, NotificationSettingsType };
