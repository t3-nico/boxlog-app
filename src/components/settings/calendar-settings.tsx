'use client'

import { Heading } from '@/components/heading'
import { SettingSection, ToggleItem, SelectItem } from '@/components/settings-section'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { getTimeZones, formatInTimeZone, formatHour } from '@/utils/timezone-utils'
import { format } from 'date-fns'

export default function CalendarSettingsPage() {
  const settings = useCalendarSettingsStore()
  const timezones = getTimeZones()
  
  const formatTimeWithSettings = (date: Date, timeFormat: '12h' | '24h') => {
    const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'
    return format(date, formatString)
  }
  
  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <Heading>Calendar Settings</Heading>
      
      <SettingSection 
        title="Time & Timezone" 
        description="Configure how dates and times are displayed in your calendar."
      >
        {/* タイムゾーン設定 */}
        <SelectItem
          label="Timezone"
          description="Select your timezone for calendar display"
          value={settings.timezone}
          onChange={(e) => settings.updateSettings({ timezone: e.target.value })}
        >
          {/* 主要なタイムゾーンを上部に表示 */}
          <option value="Asia/Tokyo">🇯🇵 Tokyo (GMT+9)</option>
          <option value="America/New_York">🇺🇸 New York (GMT-5)</option>
          <option value="Europe/London">🇬🇧 London (GMT+0)</option>
          <option value="America/Los_Angeles">🇺🇸 Los Angeles (GMT-8)</option>
          
          <option disabled>───────────────</option>
          
          {/* その他のタイムゾーン */}
          {timezones.map(tz => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </SelectItem>
        
        {/* 時間表示形式 */}
        <SelectItem
          label="Time format"
          description="Choose between 12-hour or 24-hour time display"
          value={settings.timeFormat}
          onChange={(e) => settings.updateSettings({ timeFormat: e.target.value as '12h' | '24h' })}
        >
          <option value="24h">24-hour (13:00)</option>
          <option value="12h">12-hour (1:00 PM)</option>
        </SelectItem>
        
        {/* プレビュー表示 */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
          <div className="space-y-2">
            <p className="font-medium">
              Current time: {formatTimeWithSettings(new Date(), settings.timeFormat)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Full format: {formatInTimeZone(new Date(), settings.timezone, 'yyyy/MM/dd HH:mm')}
            </p>
          </div>
        </div>
      </SettingSection>
      
      <SettingSection 
        title="Week & Calendar Display" 
        description="Customize how weeks and calendar views are displayed."
      >
        {/* 週の開始曜日 */}
        <SelectItem
          label="Week starts on"
          description="Choose which day your calendar week starts on"
          value={String(settings.weekStartsOn)}
          onChange={(e) => settings.updateSettings({ weekStartsOn: Number(e.target.value) as 0 | 1 | 6 })}
        >
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
          <option value="6">Saturday</option>
        </SelectItem>
        
        {/* 週番号表示 */}
        <ToggleItem
          label="Show week numbers"
          description="Display week numbers in calendar views"
          value={settings.showWeekNumbers}
          onChange={(checked) => settings.updateSettings({ showWeekNumbers: checked })}
        />
        
        {/* 辞退したイベント表示 */}
        <ToggleItem
          label="Show declined events"
          description="Display events that have been declined"
          value={settings.showDeclinedEvents}
          onChange={(checked) => settings.updateSettings({ showDeclinedEvents: checked })}
        />
      </SettingSection>
      
      <SettingSection 
        title="Default Task Settings" 
        description="Set default behavior for new tasks and events."
      >
        {/* デフォルトのタスク時間 */}
        <SelectItem
          label="Default task duration"
          description="Default duration when creating new tasks"
          value={String(settings.defaultDuration)}
          onChange={(e) => settings.updateSettings({ defaultDuration: Number(e.target.value) })}
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1 hour 30 minutes</option>
          <option value="120">2 hours</option>
        </SelectItem>
      </SettingSection>
      
      <SettingSection 
        title="Business Hours" 
        description="Define your working hours for calendar display."
      >
        {/* 営業開始時間 */}
        <SelectItem
          label="Business hours start"
          description="When your business hours begin"
          value={String(settings.businessHours.start)}
          onChange={(e) => 
            settings.updateSettings({ 
              businessHours: { ...settings.businessHours, start: Number(e.target.value) }
            })
          }
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={String(i)}>
              {formatHour(i, settings.timeFormat)}
            </option>
          ))}
        </SelectItem>
        
        {/* 営業終了時間 */}
        <SelectItem
          label="Business hours end"
          description="When your business hours end"
          value={String(settings.businessHours.end)}
          onChange={(e) => 
            settings.updateSettings({ 
              businessHours: { ...settings.businessHours, end: Number(e.target.value) }
            })
          }
        >
          {Array.from({ length: 24 }, (_, i) => (
            <option key={i} value={String(i)}>
              {formatHour(i, settings.timeFormat)}
            </option>
          ))}
        </SelectItem>
        
        {/* 営業時間プレビュー */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Business hours:</p>
          <p className="font-medium">
            {formatHour(settings.businessHours.start, settings.timeFormat)} - {formatHour(settings.businessHours.end, settings.timeFormat)}
          </p>
        </div>
      </SettingSection>
      
      {/* リセットボタン */}
      <SettingSection 
        title="Reset Settings" 
        description="Restore all calendar settings to their default values."
      >
        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all calendar settings to their defaults?')) {
                settings.resetSettings()
              }
            }}
            className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors border border-red-200 dark:border-red-800"
          >
            Reset to Defaults
          </button>
        </div>
      </SettingSection>
    </div>
  )
}