'use client'

import { useI18n } from '@/features/i18n/lib/hooks'

import { AccountDeletionDialog } from '../account-deletion-dialog'
import { SettingsCard } from '../SettingsCard'

/**
 * デンジャーゾーンセクション
 *
 * アカウント削除などの危険な操作
 */
export function DangerZoneSection() {
  const { t } = useI18n()

  return (
    <SettingsCard title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}>
      <AccountDeletionDialog />
    </SettingsCard>
  )
}
