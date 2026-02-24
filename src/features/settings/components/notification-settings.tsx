'use client';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  checkBrowserNotificationSupport,
  requestNotificationPermission,
} from '@/features/notifications/utils/notification-helpers';
import { ReminderSelect } from '@/features/plans/components/shared/ReminderSelect';
import { api } from '@/lib/trpc';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

export function NotificationSettings() {
  const t = useTranslations();
  const utils = api.useUtils();

  // 通知設定を取得
  const { data: preferences, isLoading } = api.notificationPreferences.get.useQuery();

  // ブラウザ通知許可状態
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(() => {
    if (typeof window === 'undefined') return null;
    return checkBrowserNotificationSupport() ? Notification.permission : null;
  });

  // デフォルトリマインダーを更新
  const updateDefaultReminder =
    api.notificationPreferences.updateDefaultReminderMinutes.useMutation({
      onSuccess: () => {
        utils.notificationPreferences.get.invalidate();
      },
      onError: (error) => {
        toast.error(t('notification.settings.saveError', { message: error.message }));
      },
    });

  // ブラウザ通知設定を更新
  const updateBrowserNotifications =
    api.notificationPreferences.updateBrowserNotifications.useMutation({
      onSuccess: () => {
        utils.notificationPreferences.get.invalidate();
      },
      onError: (error) => {
        toast.error(t('notification.settings.saveError', { message: error.message }));
      },
    });

  const handleBrowserToggle = useCallback(
    async (checked: boolean) => {
      if (checked) {
        // 有効にする場合はブラウザの許可をリクエスト
        if (checkBrowserNotificationSupport()) {
          const permission = await requestNotificationPermission();
          if (permission !== 'granted') {
            toast.error(t('notification.settings.browserPermissionDenied'));
            return;
          }
          setBrowserPermission('granted');
        }
      }

      updateBrowserNotifications.mutate({ enabled: checked });
    },
    [updateBrowserNotifications, t],
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SettingsCard>
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </SettingsCard>
      </div>
    );
  }

  const isBrowserPermissionDenied = browserPermission === 'denied';

  return (
    <div className="space-y-8">
      <SettingsCard
        isSaving={updateBrowserNotifications.isPending || updateDefaultReminder.isPending}
      >
        <div className="space-y-0">
          <SettingRow
            label={t('notification.settings.browserNotifications.label')}
            description={
              isBrowserPermissionDenied
                ? t('notification.settings.permissionDenied')
                : t('notification.settings.browserNotifications.description')
            }
          >
            <Switch
              checked={preferences?.enableBrowserNotifications ?? true}
              onCheckedChange={handleBrowserToggle}
              disabled={updateBrowserNotifications.isPending || isBrowserPermissionDenied}
            />
          </SettingRow>
          <SettingRow
            label={t('notification.settings.defaultReminder.label')}
            description={t('notification.settings.defaultReminder.description')}
          >
            <ReminderSelect
              value={preferences?.defaultReminderMinutes ?? null}
              onChange={(minutes) => updateDefaultReminder.mutate({ minutes })}
              variant="button"
              disabled={updateDefaultReminder.isPending}
            />
          </SettingRow>
        </div>
      </SettingsCard>

      {/* ヒント情報 */}
      <div className="bg-card border-border rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">{t('notification.settings.tip')}</p>
      </div>
    </div>
  );
}
