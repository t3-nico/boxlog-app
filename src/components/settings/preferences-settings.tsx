'use client'

import { useState, useEffect } from 'react'
import { Heading } from '@/components/heading'
import { SettingSection, ToggleItem, SelectItem, DatePickerItem } from '@/components/settings-section'
import { useTheme } from '@/contexts/theme-context'
import { 
  loadLifeCounterSettings, 
  saveLifeCounterSettings, 
  validateBirthDate, 
  getLifeCounterDebugInfo,
  type LifeCounterSettings 
} from '@/lib/life-counter'

export default function PreferencesSettings() {
  const [notifications, setNotifications] = useState(true)
  const [duration, setDuration] = useState('30')
  const [segment, setSegment] = useState('30')
  const { theme, setTheme } = useTheme()
  
  // Life counter settings
  const [lifeCounter, setLifeCounter] = useState<LifeCounterSettings>({
    enabled: false,
    birthDate: null
  })
  const [birthDateError, setBirthDateError] = useState<string>('')
  const [isLifeCounterLoaded, setIsLifeCounterLoaded] = useState(false)

  // Load life counter settings on mount
  useEffect(() => {
    const settings = loadLifeCounterSettings()
    setLifeCounter(settings)
    setIsLifeCounterLoaded(true)
  }, [])

  // Save life counter settings when they change (but only after initial load)
  useEffect(() => {
    if (isLifeCounterLoaded) {
      saveLifeCounterSettings(lifeCounter)
    }
  }, [lifeCounter, isLifeCounterLoaded])

  const handleLifeCounterToggle = (enabled: boolean) => {
    setLifeCounter(prev => ({ ...prev, enabled }))
    if (!enabled) {
      setBirthDateError('')
    }
  }

  const handleBirthDateChange = (birthDate: string) => {
    const validation = validateBirthDate(birthDate)
    
    if (!validation.isValid) {
      setBirthDateError(validation.error || '')
    } else {
      setBirthDateError('')
    }
    
    setLifeCounter(prev => ({ ...prev, birthDate }))
  }
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
      <SettingSection title="Life Counter" description="Display remaining days until age 100 in the header.">
        <ToggleItem
          label="Show life counter in header"
          description="Display remaining days until age 100 in the main header"
          value={lifeCounter.enabled}
          onChange={handleLifeCounterToggle}
        />
        {lifeCounter.enabled && (
          <div className="border-t border-zinc-950/5 dark:border-white/10">
            <DatePickerItem
              label="Date of birth"
              description="Your birth date for calculating remaining days"
              value={lifeCounter.birthDate}
              onChange={handleBirthDateChange}
            />
            {birthDateError && (
              <div className="px-4 pb-3">
                <p className="text-sm text-red-600 dark:text-red-400">{birthDateError}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Temporary debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="border-t border-zinc-950/5 dark:border-white/10">
            <div className="px-4 py-3">
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-500 dark:text-gray-400 mb-2">
                  Debug Info (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {JSON.stringify(getLifeCounterDebugInfo(), null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </SettingSection>
    </div>
  )
}

