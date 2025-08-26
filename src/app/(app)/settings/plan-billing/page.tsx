'use client'

import { SettingsLayout } from '@/features/settings/components'
import PlanBillingSettings from '@/features/settings/components/plan-billing-settings'

export default function PlanBillingPage() {
  return (
    <SettingsLayout
      title="プラン・料金"
      description="サブスクリプションと請求情報を管理します"
    >
      <PlanBillingSettings />
    </SettingsLayout>
  )
}

