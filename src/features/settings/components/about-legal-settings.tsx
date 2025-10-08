'use client'

import { memo } from 'react'

const AboutLegalSettings = memo(() => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">法的情報</h2>
        <p className="text-muted-foreground text-sm">利用規約やプライバシーポリシーを確認します</p>
      </div>
      <div className="rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">現在、この機能は開発中です</p>
      </div>
    </div>
  )
})

AboutLegalSettings.displayName = 'AboutLegalSettings'

export default AboutLegalSettings
