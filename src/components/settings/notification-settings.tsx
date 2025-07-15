'use client'

import { useState } from 'react'
import { Heading } from '@/components/heading'
import { SettingSection, ToggleItem } from '@/components/settings-section'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function NotificationSettings() {
  const [emailReminders, setEmailReminders] = useState(true)
  const [inAppReminders, setInAppReminders] = useState(true)
  const [dndStart, setDndStart] = useState('22:00')
  const [dndEnd, setDndEnd] = useState('07:00')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: connect to backend
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-10">
      <Heading>Notifications</Heading>

      <SettingSection title="Email" description="Control email notifications.">
        <ToggleItem label="Send updates" value={emailReminders} onChange={setEmailReminders} />
      </SettingSection>

      <SettingSection title="Reminders" description="In-app notification settings.">
        <ToggleItem label="Enable reminders" value={inAppReminders} onChange={setInAppReminders} />
      </SettingSection>

      <SettingSection title="Do Not Disturb" description="Silence notifications during certain hours.">
        <form onSubmit={handleSave} className="space-y-4 px-4 py-4">
          <div className="flex gap-4">
            <Input type="time" aria-label="Start" value={dndStart} onChange={(e) => setDndStart(e.target.value)} />
            <Input type="time" aria-label="End" value={dndEnd} onChange={(e) => setDndEnd(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </SettingSection>
    </div>
  )
}

