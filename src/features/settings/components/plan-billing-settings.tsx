'use client'

import { memo } from 'react'

export const PlanBillingSettings = memo(function PlanBillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">プラン・課金</h2>
        <p className="text-muted-foreground text-sm">サブスクリプションと支払いを管理します</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">現在、この機能は開発中です</p>
      </div>
    </div>
  )
})
