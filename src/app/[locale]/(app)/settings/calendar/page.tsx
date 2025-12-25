'use client';

import { CalendarSettings } from '@/features/settings/components/calendar-settings';
import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper';
import { useTranslations } from 'next-intl';

/**
 * カレンダー設定ページ
 *
 * タイムゾーン、表示設定、デフォルトビュー
 */
export default function CalendarSettingsPage() {
  const t = useTranslations();

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.calendar')}>
      <CalendarSettings />
    </SettingsPageWrapper>
  );
}
