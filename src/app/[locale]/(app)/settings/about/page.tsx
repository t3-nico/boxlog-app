'use client';

import { AboutLegalSettings } from '@/features/settings/components/about-legal-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * About設定ページ
 *
 * 法的情報、バージョン情報
 */
export default function AboutSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.about')}>
      <AboutLegalSettings />
    </SettingsPageWrapper>
  );
}
