'use client';

import { DataExportSettings } from '@/features/settings/components/data-export-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * データ管理設定ページ
 *
 * エクスポート、インポート、バックアップ
 */
export default function DataControlsSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.dataControls')}>
      <DataExportSettings />
    </SettingsPageWrapper>
  );
}
