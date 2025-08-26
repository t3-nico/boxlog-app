'use client'

import { SettingsLayout, CalendarSettings } from '@/features/settings/components'

export default function CalendarPage() {
  return (
    <SettingsLayout
      title="カレンダー"
      description="カレンダー表示設定とタイムゾーンの管理"
    >
      <CalendarSettings />
    </SettingsLayout>
  )
}