'use client';

import { DataExportSettings } from '@/features/settings/components/data-export-settings';
import { IntegrationSettings } from '@/features/settings/components/integration-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * データ管理設定ページ
 *
 * エクスポート、外部サービス連携
 */
export default function DataControlsSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.dataControls')}>
      <div className="space-y-8">
        <DataExportSettings />
        <IntegrationSettings />
      </div>
    </SettingsPageWrapper>
  );
}
