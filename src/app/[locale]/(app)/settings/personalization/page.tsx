'use client';

import { ChronotypeSettings } from '@/features/settings/components/chronotype-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { SleepScheduleSettings } from '@/features/settings/components/sleep-schedule-settings';
import { TagsSettings } from '@/features/settings/components/tags-settings';
import { useTranslations } from 'next-intl';

/**
 * パーソナライズ設定ページ
 *
 * クロノタイプ、睡眠スケジュール、タグ設定
 */
export default function PersonalizationSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.personalization')}>
      <div className="space-y-8">
        <ChronotypeSettings />
        <SleepScheduleSettings />
        <TagsSettings />
      </div>
    </SettingsPageWrapper>
  );
}
