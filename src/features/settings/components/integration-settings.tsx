'use client'

import { memo } from 'react'

export const IntegrationSettings = memo(function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">連携設定</h2>
        <p className="text-muted-foreground text-sm">外部サービスとの連携を管理します</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">現在、この機能は開発中です</p>
      </div>
    </div>
  )
})
