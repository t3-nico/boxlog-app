'use client';

import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { ReminderSelect } from '@/components/common/ReminderSelect';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  checkBrowserNotificationSupport,
  requestNotificationPermission,
} from '@/lib/notification-helpers';
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

  const onSettingsSuccess = useCallback(() => {
    utils.notificationPreferences.get.invalidate();
  }, [utils]);

  const onSettingsError = useCallback(
    (error: { message: string }) => {
      toast.error(t('notification.settings.saveError', { message: error.message }));
    },
    [t],
  );

  // デフォルトリマインダーを更新
  const updateDefaultReminder =
    api.notificationPreferences.updateDefaultReminderMinutes.useMutation({
      onSuccess: onSettingsSuccess,
      onError: onSettingsError,
    });

  // ブラウザ通知設定を更新
  const updateBrowserNotifications =
    api.notificationPreferences.updateBrowserNotifications.useMutation({
      onSuccess: onSettingsSuccess,
      onError: onSettingsError,
    });

  // メール通知設定を更新
  const updateEmailNotifications = api.notificationPreferences.updateEmailNotifications.useMutation(
    {
      onSuccess: onSettingsSuccess,
      onError: onSettingsError,
    },
  );

  // プッシュ通知設定を更新
  const updatePushNotifications = api.notificationPreferences.updatePushNotifications.useMutation({
    onSuccess: onSettingsSuccess,
    onError: onSettingsError,
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

  const isSaving =
    updateBrowserNotifications.isPending ||
    updateEmailNotifications.isPending ||
    updatePushNotifications.isPending ||
    updateDefaultReminder.isPending;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SettingsCard>
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
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
      <SettingsCard isSaving={isSaving}>
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
            label={t('notification.settings.emailNotifications.label')}
            description={t('notification.settings.emailNotifications.description')}
          >
            <Switch
              checked={preferences?.enableEmailNotifications ?? false}
              onCheckedChange={(checked) => updateEmailNotifications.mutate({ enabled: checked })}
              disabled={updateEmailNotifications.isPending}
            />
          </SettingRow>
          <SettingRow
            label={
              <span className="flex items-center gap-2">
                {t('notification.settings.pushNotifications.label')}
                <Badge variant="secondary" className="text-xs">
                  {t('notification.settings.pushNotifications.comingSoon')}
                </Badge>
              </span>
            }
            description={t('notification.settings.pushNotifications.description')}
          >
            <Switch
              checked={preferences?.enablePushNotifications ?? false}
              onCheckedChange={(checked) => updatePushNotifications.mutate({ enabled: checked })}
              disabled={updatePushNotifications.isPending}
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
