'use client'

import { SettingsLayout } from '@/features/settings/components'
import DataExportSettings from '@/features/settings/components/data-export-settings'

const DataExportPage = () => {
  return (
    <SettingsLayout
      title="データエクスポート"
      description="あなたのデータをバックアップ・移行用にエクスポートできます"
    >
      <DataExportSettings />
    </SettingsLayout>
  )
}

export default DataExportPage

