'use client'

import { memo } from 'react'

const DataExportSettings = memo(() => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">データエクスポート</h2>
        <p className="text-sm text-muted-foreground">
          データのバックアップやエクスポートを行います
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-muted-foreground">
          現在、この機能は開発中です
        </p>
      </div>
    </div>
  )
})

DataExportSettings.displayName = 'DataExportSettings'

export default DataExportSettings