'use client'

import { useState } from 'react'
import { Heading } from '@/components/heading'
import { SettingSection, ToggleItem, SelectItem } from '@/components/settings-section'
import { useTheme } from '@/contexts/theme-context'

export default function PreferencesSettings() {
  const [notifications, setNotifications] = useState(true)
  const [duration, setDuration] = useState('30')
  const [segment, setSegment] = useState('30')
  const { theme, setTheme } = useTheme()
  return (
    <div className="mx-auto max-w-4xl space-y-10 p-10">
      <Heading>Preferences</Heading>
      <SettingSection title="General" description="Basic application options.">
        <ToggleItem
          label="Enable notifications"
          description="Send email notifications for updates"
          value={notifications}
          onChange={setNotifications}
        />
      </SettingSection>
      <SettingSection title="Appearance" description="Customize the look and feel.">
        <SelectItem
          label="Theme"
          description="Choose your preferred theme setting"
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </SelectItem>
      </SettingSection>
      <SettingSection title="Time & Tags" description="Default behaviors.">
        <SelectItem
          label="Default block duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
        </SelectItem>
        <SelectItem
          label="Time segmentation"
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">60 minutes</option>
        </SelectItem>
      </SettingSection>
    </div>
  )
}

