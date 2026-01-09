'use client';

import { IntegrationSettings } from '@/features/settings/components/integration-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * 連携設定ページ
 *
 * AIプロバイダーと外部サービス連携
 */
export default function IntegrationsSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.integrations')}>
      <IntegrationSettings />
    </SettingsPageWrapper>
  );
}
