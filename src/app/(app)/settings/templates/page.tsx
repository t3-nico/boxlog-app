'use client'

import { SettingsLayout } from '@/features/settings/components'
import TemplatesSettings from '@/features/settings/components/templates-settings'

export default function TemplatesPage() {
  return (
    <SettingsLayout
      title="テンプレート"
      description="よく使用するフォームやタスクのテンプレートを管理します"
    >
      <TemplatesSettings />
    </SettingsLayout>
  )
}
