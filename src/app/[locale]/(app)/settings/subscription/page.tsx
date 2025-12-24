'use client'

import { SettingsPageWrapper } from '@/features/settings/components/page/SettingsPageWrapper'
import { PlanBillingSettings } from '@/features/settings/components/plan-billing-settings'
import { useTranslations } from 'next-intl'

/**
 * サブスクリプション設定ページ
 *
 * プラン、課金管理
 */
export default function SubscriptionSettingsPage() {
  const t = useTranslations()

  return (
    <SettingsPageWrapper title={t('settings.dialog.categories.subscription')}>
      <PlanBillingSettings />
    </SettingsPageWrapper>
  )
}
