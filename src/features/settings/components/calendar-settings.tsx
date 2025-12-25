'use client';

import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { useUserSettings } from '@/features/settings/hooks/useUserSettings';
import type { DateFormatType } from '@/features/settings/stores/useCalendarSettingsStore';
import { formatHour } from '@/features/settings/utils/timezone-utils';
import { useTranslations } from 'next-intl';

import { SettingField } from './fields/SettingField';
import { SettingsCard } from './SettingsCard';

export function CalendarSettings() {
  const { settings, saveSettings, isSaving, isPending } = useUserSettings();
  const t = useTranslations();

  // jsx-no-bind optimization: Reset settings handler
  const handleResetSettings = useCallback(() => {
    if (confirm('カレンダー設定をすべてデフォルトに戻しますか？')) {
      settings.resetSettings();
      saveSettings({
        timezone: 'Asia/Tokyo',
        timeFormat: '24h',
        dateFormat: 'yyyy/MM/dd',
        weekStartsOn: 1,
        showWeekNumbers: false,
        showDeclinedEvents: false,
        defaultDuration: 60,
        snapInterval: 15,
        businessHours: { start: 9, end: 18 },
      });
    }
  }, [settings, saveSettings]);

  // Handler functions
  const handleTimezoneChange = useCallback(
    (value: string) => {
      saveSettings({ timezone: value });
    },
    [saveSettings],
  );

  const handleTimeFormatChange = useCallback(
    (value: string) => {
      saveSettings({ timeFormat: value as '12h' | '24h' });
    },
    [saveSettings],
  );

  const handleDateFormatChange = useCallback(
    (value: string) => {
      saveSettings({ dateFormat: value as DateFormatType });
    },
    [saveSettings],
  );

  const handleWeekStartsOnChange = useCallback(
    (value: string) => {
      saveSettings({ weekStartsOn: Number(value) as 0 | 1 | 6 });
    },
    [saveSettings],
  );

  const handleShowWeekNumbersChange = useCallback(
    (checked: boolean) => {
      saveSettings({ showWeekNumbers: checked });
    },
    [saveSettings],
  );

  const handleShowDeclinedEventsChange = useCallback(
    (checked: boolean) => {
      saveSettings({ showDeclinedEvents: checked });
    },
    [saveSettings],
  );

  const handleDefaultDurationChange = useCallback(
    (value: string) => {
      saveSettings({ defaultDuration: Number(value) });
    },
    [saveSettings],
  );

  const handleSnapIntervalChange = useCallback(
    (value: string) => {
      saveSettings({ snapInterval: Number(value) as 5 | 10 | 15 | 30 });
    },
    [saveSettings],
  );

  const handleDefaultViewChange = useCallback(
    (value: string) => {
      saveSettings({ defaultView: value as 'day' | '3day' | '5day' | 'week' });
    },
    [saveSettings],
  );

  const handleBusinessHoursStartChange = useCallback(
    (value: string) => {
      saveSettings({
        businessHours: {
          ...settings.businessHours,
          start: Number(value),
        },
      });
    },
    [saveSettings, settings.businessHours],
  );

  const handleBusinessHoursEndChange = useCallback(
    (value: string) => {
      saveSettings({
        businessHours: {
          ...settings.businessHours,
          end: Number(value),
        },
      });
    },
    [saveSettings, settings.businessHours],
  );

  if (isPending) {
    return <div className="animate-pulse space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time & Timezone Section */}
      <SettingsCard title={t('settings.calendar.timeAndTimezone')} isSaving={isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.calendar.timezone')}>
            <Select value={settings.timezone} onValueChange={handleTimezoneChange}>
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

          <SettingField label={t('settings.calendar.timeFormat')}>
            <Select value={settings.timeFormat} onValueChange={handleTimeFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectTimeFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('settings.calendar.timeFormat24h')}</SelectItem>
                <SelectItem value="12h">{t('settings.calendar.timeFormat12h')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField label={t('settings.calendar.dateFormat')}>
            <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectDateFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yyyy/MM/dd">{t('settings.calendar.dateFormatJapan')}</SelectItem>
                <SelectItem value="MM/dd/yyyy">{t('settings.calendar.dateFormatUS')}</SelectItem>
                <SelectItem value="dd/MM/yyyy">{t('settings.calendar.dateFormatEU')}</SelectItem>
                <SelectItem value="yyyy-MM-dd">{t('settings.calendar.dateFormatISO')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
        </div>
      </SettingsCard>

      {/* Default View Section */}
      <SettingsCard title={t('settings.calendar.defaultViewSection')} isSaving={isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.calendar.defaultView')}>
            <Select value={settings.defaultView} onValueChange={handleDefaultViewChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectDefaultView')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t('settings.calendar.viewDay')}</SelectItem>
                <SelectItem value="3day">{t('settings.calendar.view3Day')}</SelectItem>
                <SelectItem value="5day">{t('settings.calendar.view5Day')}</SelectItem>
                <SelectItem value="week">{t('settings.calendar.viewWeek')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingField>
        </div>
      </SettingsCard>

      {/* Week & Calendar Display Section */}
      <SettingsCard title={t('settings.calendar.weekAndCalendar')} isSaving={isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.calendar.weekStartsOn')}>
            <Select value={String(settings.weekStartsOn)} onValueChange={handleWeekStartsOnChange}>
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

          <SettingField label={t('settings.calendar.showWeekNumbers')}>
            <Switch
              checked={settings.showWeekNumbers}
              onCheckedChange={handleShowWeekNumbersChange}
            />
          </SettingField>

          <SettingField label={t('settings.calendar.showDeclinedEvents')}>
            <Switch
              checked={settings.showDeclinedEvents}
              onCheckedChange={handleShowDeclinedEventsChange}
            />
          </SettingField>
        </div>
      </SettingsCard>

      {/* Default Task Settings Section */}
      <SettingsCard title={t('settings.calendar.defaultTaskSettings')} isSaving={isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.calendar.defaultDuration')}>
            <Select
              value={String(settings.defaultDuration)}
              onValueChange={handleDefaultDurationChange}
            >
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

          <SettingField label={t('settings.calendar.snapInterval')}>
            <Select value={String(settings.snapInterval)} onValueChange={handleSnapIntervalChange}>
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
      <SettingsCard title={t('settings.calendar.businessHours')} isSaving={isSaving}>
        <div className="space-y-4">
          <SettingField label={t('settings.calendar.businessHoursStart')}>
            <Select
              value={String(settings.businessHours.start)}
              onValueChange={handleBusinessHoursStartChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectStartTime')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, settings.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingField>

          <SettingField label={t('settings.calendar.businessHoursEnd')}>
            <Select
              value={String(settings.businessHours.end)}
              onValueChange={handleBusinessHoursEndChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('settings.calendar.selectEndTime')} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {formatHour(i, settings.timeFormat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingField>

          {/* 営業時間プレビュー */}
          <div className="bg-surface-container rounded-lg p-4">
            <p className="text-muted-foreground mb-2 text-sm">
              {t('settings.calendar.businessHoursPreview')}
            </p>
            <p className="font-medium">
              {formatHour(settings.businessHours.start, settings.timeFormat)} -{' '}
              {formatHour(settings.businessHours.end, settings.timeFormat)}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Reset Settings Section */}
      <SettingsCard title={t('settings.calendar.resetSettings')}>
        <Button variant="destructive" onClick={handleResetSettings}>
          {t('settings.calendar.resetToDefault')}
        </Button>
      </SettingsCard>
    </div>
  );
}
