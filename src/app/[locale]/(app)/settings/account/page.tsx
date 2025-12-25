'use client';

import { AccountSettings } from '@/features/settings/components/account-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * アカウント設定ページ
 *
 * プロフィール、セキュリティ
 */
export default function AccountSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.account')}>
      <AccountSettings />
    </SettingsPageWrapper>
  );
}
