'use client'

import { useState, useEffect } from 'react'
import { Heading } from '@/components/heading'
import { SettingSection, ToggleItem, SelectItem, DatePickerItem } from '@/components/settings-section'
import { SelectItem as ShadcnSelectItem } from '@/components/ui/select'
import { useTheme } from '@/contexts/theme-context'
import { 
  loadLifeCounterSettings, 
  saveLifeCounterSettings, 
  validateBirthDate, 
  getLifeCounterDebugInfo,
  type LifeCounterSettings 
} from '@/lib/life-counter'
import { 
  SUPPORTED_TIMEZONES, 
  getCurrentTimezone, 
  setUserTimezone, 
  formatTimezoneInfo,
  type TimezoneValue 
} from '@/utils/timezone'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'

export default function PreferencesSettings() {
  const [notifications, setNotifications] = useState(true)
  const [duration, setDuration] = useState('30')
  const [segment, setSegment] = useState('30')
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h')
  const [timezone, setTimezone] = useState<string>('')
  const { theme, setTheme } = useTheme()
  
  // Calendar settings store for timezone sync
  const { updateSettings: updateCalendarSettings, showUTCOffset, timezone: calendarTimezone } = useCalendarSettingsStore()
  
  
  // Life counter settings
  const [lifeCounter, setLifeCounter] = useState<LifeCounterSettings>({
    enabled: false,
    birthDate: null
  })
  const [birthDateError, setBirthDateError] = useState<string>('')
  const [isLifeCounterLoaded, setIsLifeCounterLoaded] = useState(false)

  // Load settings on mount
  useEffect(() => {
    const settings = loadLifeCounterSettings()
    setLifeCounter(settings)
    setIsLifeCounterLoaded(true)
    
    // Load time format from localStorage
    const savedTimeFormat = localStorage.getItem('timeFormat') as '12h' | '24h'
    if (savedTimeFormat) {
      setTimeFormat(savedTimeFormat)
    }
    
    // Load current timezone
    const currentTimezone = getCurrentTimezone()
    setTimezone(currentTimezone)
    console.log('現在のタイムゾーン設定:', currentTimezone)
  }, [])

  // Save settings when they change (but only after initial load)
  useEffect(() => {
    if (isLifeCounterLoaded) {
      saveLifeCounterSettings(lifeCounter)
    }
  }, [lifeCounter, isLifeCounterLoaded])

  // Save time format when it changes
  useEffect(() => {
    localStorage.setItem('timeFormat', timeFormat)
  }, [timeFormat])

  // Handle timezone change
  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone)
    setUserTimezone(newTimezone)
    // Calendar settings store も同期
    updateCalendarSettings({ timezone: newTimezone })
    console.log('タイムゾーン設定を更新:', newTimezone)
  }

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
    <div className="mx-auto max-w-4xl space-y-8 p-8">
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
          onChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
        >
          <ShadcnSelectItem value="light">Light</ShadcnSelectItem>
          <ShadcnSelectItem value="dark">Dark</ShadcnSelectItem>
          <ShadcnSelectItem value="system">System</ShadcnSelectItem>
        </SelectItem>
      </SettingSection>
      <SettingSection title="Time & Tags" description="Default behaviors.">
        <SelectItem
          label="Timezone"
          description="Select your timezone for accurate event display"
          value={timezone}
          onChange={handleTimezoneChange}
        >
          {SUPPORTED_TIMEZONES.map((tz) => (
            <ShadcnSelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </ShadcnSelectItem>
          ))}
        </SelectItem>
        <SelectItem
          label="Time format"
          description="Choose between 12-hour (AM/PM) or 24-hour time format"
          value={timeFormat}
          onChange={(value) => setTimeFormat(value as '12h' | '24h')}
        >
          <ShadcnSelectItem value="12h">12-hour (AM/PM)</ShadcnSelectItem>
          <ShadcnSelectItem value="24h">24-hour</ShadcnSelectItem>
        </SelectItem>
        <ToggleItem
          label="Show timezone offset in calendar"
          description="Display UTC offset (e.g., UTC+9) in the calendar header"
          value={showUTCOffset}
          onChange={(enabled) => updateCalendarSettings({ showUTCOffset: enabled })}
        />
        <SelectItem
          label="Default block duration"
          value={duration}
          onChange={(value) => setDuration(value)}
        >
          <ShadcnSelectItem value="15">15 minutes</ShadcnSelectItem>
          <ShadcnSelectItem value="30">30 minutes</ShadcnSelectItem>
          <ShadcnSelectItem value="60">60 minutes</ShadcnSelectItem>
        </SelectItem>
        <SelectItem
          label="Time segmentation"
          value={segment}
          onChange={(value) => setSegment(value)}
        >
          <ShadcnSelectItem value="15">15 minutes</ShadcnSelectItem>
          <ShadcnSelectItem value="30">30 minutes</ShadcnSelectItem>
          <ShadcnSelectItem value="60">60 minutes</ShadcnSelectItem>
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

