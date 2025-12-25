'use client';

import { NotificationSettings } from '@/features/settings/components/notification-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * 通知設定ページ
 *
 * 通知、リマインダー設定
 */
export default function NotificationsSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.notifications')}>
      <NotificationSettings />
    </SettingsPageWrapper>
  );
}
