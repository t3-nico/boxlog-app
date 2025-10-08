'use client'

import { useI18n } from '@/features/i18n/lib/hooks'
import { SettingsLayout } from '@/features/settings/components'
import DataExportSettings from '@/features/settings/components/data-export-settings'

const DataExportPage = () => {
  const { t } = useI18n()

  return (
    <SettingsLayout title={t('settings.dataExport.title')} description={t('settings.dataExport.description')}>
      <DataExportSettings />
    </SettingsLayout>
  )
}

export default DataExportPage
