'use client'

import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper'
import { PreferencesSettings } from '@/features/settings/components/preferences-settings'
import { useTranslations } from 'next-intl'

/**
 * 一般設定ページ
 *
 * 言語、テーマ、起動画面などの一般的な設定
 */
export default function GeneralSettingsPage() {
  const t = useTranslations()

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.general')}>
      <PreferencesSettings />
    </SettingsPageWrapper>
  )
}
