'use client'

import { useState } from 'react'
import { Heading, Subheading } from '@/components/heading'
import { Button } from '@/components/ui/button'
import { SettingSection, ToggleItem } from '@/components/settings-section'
import { Input } from '@/components/ui/input'
import { SettingsLayout } from './settings-layout'

export default function IntegrationSettings() {
  const [googleSync, setGoogleSync] = useState(false)
  const [calendarView, setCalendarView] = useState('month')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to backend
  }

  return (
    <SettingsLayout>
      <Heading>Calendar & Integration</Heading>

      <SettingSection title="Google Calendar" description="Sync with your Google Calendar.">
        <div className="px-4 py-4 space-y-4">
          <ToggleItem label="Enable Google Sync" value={googleSync} onChange={setGoogleSync} />
          {googleSync && (
            <Button type="button">Connect Account</Button>
          )}
        </div>
      </SettingSection>

      <SettingSection title="Calendar Display" description="Default view settings.">
        <form onSubmit={handleSave} className="space-y-4 px-4 py-4">
          <Input
            aria-label="Default view"
            value={calendarView}
            onChange={(e) => setCalendarView(e.target.value)}
            placeholder="month"
          />
          <div className="flex justify-end">
            <Button type="submit">Save preferences</Button>
          </div>
        </form>
      </SettingSection>
    </SettingsLayout>
  )
}

