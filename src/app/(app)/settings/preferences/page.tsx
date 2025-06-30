'use client'

import { Heading } from '@/components/heading'
import { SettingSection, ToggleItem, SelectItem } from '@/components/settings-section'
import { useState } from 'react'

export default function PreferencesPage() {
  const [notifications, setNotifications] = useState(true)
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('en')
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Heading>Preferences</Heading>
      <SettingSection title="General" description="Basic application options.">
        <ToggleItem
          label="Enable notifications"
          description="Send email notifications for updates"
          value={notifications}
          onChange={setNotifications}
        />
        <SelectItem
          label="Language"
          description="Interface language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ja">Japanese</option>
        </SelectItem>
      </SettingSection>

      <SettingSection title="Appearance" description="Customize the look and feel.">
        <ToggleItem
          label="Dark theme"
          value={theme === 'dark'}
          onChange={(v) => setTheme(v ? 'dark' : 'light')}
        />
      </SettingSection>
    </div>
  )
}
