'use client'

import { useCallback } from 'react'

import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

import { useI18n } from '@/features/i18n/lib/hooks'
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { formatHour } from '@/features/settings/utils/timezone-utils'

import { SettingField } from './fields/SettingField'
import { SettingsCard } from './SettingsCard'

interface CalendarAutoSaveSettings {
  timezone: string
  timeFormat: '12h' | '24h'
  weekStartsOn: 0 | 1 | 6
  showWeekNumbers: boolean
  showDeclinedEvents: boolean
  defaultDuration: number
  snapInterval: 5 | 10 | 15 | 30
  businessHours: {
    start: number
    end: number
  }
}

export function CalendarSettings() {
  const settings = useCalendarSettingsStore()
  const { t } = useI18n()

  const formatTimeWithSettings = (date: Date, timeFormat: '12h' | '24h') => {
    const formatString = timeFormat === '24h' ? 'HH:mm' : 'h:mm a'
    return format(date, formatString)
  }

  // 自動保存システム
  const autoSave = useAutoSaveSettings<CalendarAutoSaveSettings>({
    initialValues: {
      timezone: settings.timezone,
      timeFormat: settings.timeFormat,
      weekStartsOn: settings.weekStartsOn,
      showWeekNumbers: settings.showWeekNumbers,
      showDeclinedEvents: settings.showDeclinedEvents,
      defaultDuration: settings.defaultDuration,
      snapInterval: settings.snapInterval,
      businessHours: settings.businessHours,
    },
    onSave: async (values) => {
      // カレンダー設定更新API呼び出しシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('Saving calendar settings:', values)
      // 実際のstore更新
      settings.updateSettings(values)
    },
    successMessage: t('settings.calendar.settingsSaved'),
    debounceMs: 800,
  })

  // jsx-no-bind optimization: Reset settings handler
  const handleResetSettings = useCallback(() => {
    if (confirm('カレンダー設定をすべてデフォルトに戻しますか？')) {
      settings.resetSettings()
      // 自動保存の値もリセット
      autoSave.updateValues({
        timezone: 'Asia/Tokyo',
        timeFormat: '24h',
        weekStartsOn: 1,
        showWeekNumbers: false,
        showDeclinedEvents: false,
        defaultDuration: 60,
        snapInterval: 15,
        businessHours: { start: 9, end: 18 },
      })
    }
  }, [settings, autoSave])

  // Handler functions
  const handleTimezoneChange = useCallback(
    (value: string) => {
      autoSave.updateValue('timezone', value)
    },
    [autoSave]
  )

  const handleTimeFormatChange = useCallback(
    (value: string) => {
      autoSave.updateValue('timeFormat', value as '12h' | '24h')
    },
    [autoSave]
  )

  const handleWeekStartsOnChange = useCallback(
    (value: string) => {
      autoSave.updateValue('weekStartsOn', Number(value) as 0 | 1 | 6)
    },
    [autoSave]
  )

  const handleShowWeekNumbersChange = useCallback(
    (checked: boolean) => {
      autoSave.updateValue('showWeekNumbers', checked)
    },
    [autoSave]
  )

  const handleShowDeclinedEventsChange = useCallback(
    (checked: boolean) => {
      autoSave.updateValue('showDeclinedEvents', checked)
    },
    [autoSave]
  )

  const handleDefaultDurationChange = useCallback(
    (value: string) => {
      autoSave.updateValue('defaultDuration', Number(value))
    },
    [autoSave]
  )

  const handleSnapIntervalChange = useCallback(
    (value: string) => {
      autoSave.updateValue('snapInterval', Number(value) as 5 | 10 | 15 | 30)
    },
    [autoSave]
  )

  const handleBusinessHoursStartChange = useCallback(
    (value: string) => {
      autoSave.updateValue('businessHours', {
        ...autoSave.values.businessHours,
        start: Number(value),
      })
    },
    [autoSave]
  )

  const handleBusinessHoursEndChange = useCallback(
    (value: string) => {
      autoSave.updateValue('businessHours', {
        ...autoSave.values.businessHours,
        end: Number(value),
      })
    },
    [autoSave]
  )

  return (
    <div className="space-y-6">
      {/* Time & Timezone Section */}
      <SettingsCard
        title={t('settings.calendar.timeAndTimezone')}
        description={t('settings.calendar.timeAndTimezoneDesc')}
        isSaving={autoSave.isSaving}
      >
        <div className="space-y-4">
          <SettingField label={t('settings.calendar.timezone')} description={t('settings.calendar.timezoneDesc')}>
            <Select value={autoSave.values.timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectTimezone')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Tokyo">🇯🇵 東京 (GMT+9)</SelectItem>
                <SelectItem value="America/New_York">🇺🇸 ニューヨーク (GMT-5)</SelectItem>
                <SelectItem value="Europe/London">🇬🇧 ロンドン (GMT+0)</SelectItem>
                <SelectItem value="America/Los_Angeles">🇺🇸 ロサンゼルス (GMT-8)</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField label={t('settings.calendar.timeFormat')} description={t('settings.calendar.timeFormatDesc')}>
            <Select value={autoSave.values.timeFormat} onValueChange={handleTimeFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectTimeFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('settings.calendar.timeFormat24h')}</SelectItem>
                <SelectItem value="12h">{t('settings.calendar.timeFormat12h')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          {/* プレビュー表示 */}
          <div className="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">{t('settings.calendar.preview')}</p>
            <div className="space-y-1">
              <p className="font-medium">
                {t('settings.calendar.currentTime', {
                  time: formatTimeWithSettings(new Date(), autoSave.values.timeFormat),
                })}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t('settings.calendar.fullFormat', { time: format(new Date(), 'yyyy/MM/dd HH:mm') })}
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Week & Calendar Display Section */}
      <SettingsCard
        title={t('settings.calendar.weekAndCalendar')}
        description={t('settings.calendar.weekAndCalendarDesc')}
        isSaving={autoSave.isSaving}
      >
        <div className="space-y-4">
          <SettingField
            label={t('settings.calendar.weekStartsOn')}
            description={t('settings.calendar.weekStartsOnDesc')}
          >
            <Select value={String(autoSave.values.weekStartsOn)} onValueChange={handleWeekStartsOnChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectStartDay')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('settings.calendar.sunday')}</SelectItem>
                <SelectItem value="1">{t('settings.calendar.monday')}</SelectItem>
                <SelectItem value="6">{t('settings.calendar.saturday')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField
            label={t('settings.calendar.showWeekNumbers')}
            description={t('settings.calendar.showWeekNumbersDesc')}
          >
            <Switch checked={autoSave.values.showWeekNumbers} onCheckedChange={handleShowWeekNumbersChange} />
          </SettingField>

          <SettingField
            label={t('settings.calendar.showDeclinedEvents')}
            description={t('settings.calendar.showDeclinedEventsDesc')}
          >
            <Switch checked={autoSave.values.showDeclinedEvents} onCheckedChange={handleShowDeclinedEventsChange} />
          </SettingField>
        </div>
      </SettingsCard>

      {/* Default Task Settings Section */}
      <SettingsCard
        title={t('settings.calendar.defaultTaskSettings')}
        description={t('settings.calendar.defaultTaskSettingsDesc')}
        isSaving={autoSave.isSaving}
      >
        <div className="space-y-4">
          <SettingField
            label={t('settings.calendar.defaultDuration')}
            description={t('settings.calendar.defaultDurationDesc')}
          >
            <Select value={String(autoSave.values.defaultDuration)} onValueChange={handleDefaultDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectDuration')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">{t('settings.calendar.duration15min')}</SelectItem>
                <SelectItem value="30">{t('settings.calendar.duration30min')}</SelectItem>
                <SelectItem value="60">{t('settings.calendar.duration1hour')}</SelectItem>
                <SelectItem value="90">{t('settings.calendar.duration1hour30min')}</SelectItem>
                <SelectItem value="120">{t('settings.calendar.duration2hours')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField
            label={t('settings.calendar.snapInterval')}
            description={t('settings.calendar.snapIntervalDesc')}
          >
            <Select value={String(autoSave.values.snapInterval)} onValueChange={handleSnapIntervalChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectInterval')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t('settings.calendar.interval5min')}</SelectItem>
                <SelectItem value="10">{t('settings.calendar.interval10min')}</SelectItem>
                <SelectItem value="15">{t('settings.calendar.interval15min')}</SelectItem>
                <SelectItem value="30">{t('settings.calendar.interval30min')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
        </div>
      </SettingsCard>

      {/* Business Hours Section */}
      <SettingsCard
        title={t('settings.calendar.businessHours')}
        description={t('settings.calendar.businessHoursDesc')}
        isSaving={autoSave.isSaving}
      >
        <div className="space-y-4">
          <SettingField
            label={t('settings.calendar.businessHoursStart')}
            description={t('settings.calendar.businessHoursStartDesc')}
          >
            <Select value={String(autoSave.values.businessHours.start)} onValueChange={handleBusinessHoursStartChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectStartTime')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, autoSave.values.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField
            label={t('settings.calendar.businessHoursEnd')}
            description={t('settings.calendar.businessHoursEndDesc')}
          >
            <Select value={String(autoSave.values.businessHours.end)} onValueChange={handleBusinessHoursEndChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectEndTime')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, autoSave.values.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingField>

          {/* 営業時間プレビュー */}
          <div className="rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
            <p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
              {t('settings.calendar.businessHoursPreview')}
            </p>
            <p className="font-medium">
              {formatHour(autoSave.values.businessHours.start, autoSave.values.timeFormat)} -{' '}
              {formatHour(autoSave.values.businessHours.end, autoSave.values.timeFormat)}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Reset Settings Section */}
      <SettingsCard title={t('settings.calendar.resetSettings')} description={t('settings.calendar.resetSettingsDesc')}>
        <Button variant="destructive" onClick={handleResetSettings}>
          {t('settings.calendar.resetToDefault')}
        </Button>
      </SettingsCard>
    </div>
  )
}

