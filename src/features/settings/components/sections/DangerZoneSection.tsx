'use client'

import { useTranslations } from 'next-intl'

import { AccountDeletionDialog } from '../account-deletion-dialog'
import { SettingsCard } from '../SettingsCard'

/**
 * デンジャーゾーンセクション
 *
 * アカウント削除などの危険な操作
 */
export function DangerZoneSection() {
  const t = useTranslations()

  return (
    <SettingsCard title={<span className="text-destructive">{t('settings.account.dangerZone')}</span>}>
      <AccountDeletionDialog />
    </SettingsCard>
  )
}
