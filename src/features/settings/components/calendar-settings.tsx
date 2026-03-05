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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { useTranslations } from 'next-intl';

import type { DateFormatType } from '@/stores/useCalendarSettingsStore';
import { useUserSettings } from '../hooks/useUserSettings';
import { getTimeZones } from '../utils/timezone-utils';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

export function CalendarSettings() {
  const { settings, saveSettings, isPending } = useUserSettings();
  const t = useTranslations();

  // jsx-no-bind optimization: Reset settings handler
  const handleResetSettings = useCallback(() => {
    if (confirm(t('settings.calendar.resetConfirm'))) {
      settings.resetSettings();
      saveSettings({
        timezone: 'Asia/Tokyo',
        timeFormat: '24h',
        dateFormat: 'yyyy/MM/dd',
        weekStartsOn: 1,
        showWeekNumbers: false,
        defaultDuration: 60,
        snapInterval: 15,
      });
    }
  }, [settings, saveSettings, t]);

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

  if (isPending) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }, (_, i) => (
          <SettingsCard key={i}>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </SettingsCard>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time & Timezone Section */}
      <SettingsCard title={t('settings.calendar.timeAndTimezone')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.calendar.timezone')}>
            <Select value={settings.timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.calendar.selectTimezone')} />
              </SelectTrigger>
              <SelectContent>
                {getTimeZones().map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label={t('settings.calendar.timeFormat')}>
            <Select value={settings.timeFormat} onValueChange={handleTimeFormatChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.calendar.selectTimeFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">{t('settings.calendar.timeFormat24h')}</SelectItem>
                <SelectItem value="12h">{t('settings.calendar.timeFormat12h')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label={t('settings.calendar.dateFormat')}>
            <Select value={settings.dateFormat} onValueChange={handleDateFormatChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.calendar.selectDateFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yyyy/MM/dd">{t('settings.calendar.dateFormatJapan')}</SelectItem>
                <SelectItem value="MM/dd/yyyy">{t('settings.calendar.dateFormatUS')}</SelectItem>
                <SelectItem value="dd/MM/yyyy">{t('settings.calendar.dateFormatEU')}</SelectItem>
                <SelectItem value="yyyy-MM-dd">{t('settings.calendar.dateFormatISO')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* Default View Section */}
      <SettingsCard title={t('settings.calendar.defaultViewSection')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.calendar.defaultView')}>
            <Select value={settings.defaultView} onValueChange={handleDefaultViewChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.calendar.selectDefaultView')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t('settings.calendar.viewDay')}</SelectItem>
                <SelectItem value="3day">{t('settings.calendar.view3Day')}</SelectItem>
                <SelectItem value="5day">{t('settings.calendar.view5Day')}</SelectItem>
                <SelectItem value="week">{t('settings.calendar.viewWeek')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </SettingsCard>

      {/* Week & Calendar Display Section */}
      <SettingsCard title={t('settings.calendar.weekAndCalendar')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.calendar.weekStartsOn')}>
            <Select value={String(settings.weekStartsOn)} onValueChange={handleWeekStartsOnChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.calendar.selectStartDay')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('settings.calendar.sunday')}</SelectItem>
                <SelectItem value="1">{t('settings.calendar.monday')}</SelectItem>
                <SelectItem value="6">{t('settings.calendar.saturday')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label={t('settings.calendar.showWeekNumbers')}>
            <Switch
              checked={settings.showWeekNumbers}
              onCheckedChange={handleShowWeekNumbersChange}
            />
          </SettingRow>
        </div>
      </SettingsCard>

      {/* Default Task Settings Section */}
      <SettingsCard title={t('settings.calendar.defaultTaskSettings')}>
        <div className="space-y-0">
          <SettingRow label={t('settings.calendar.defaultDuration')}>
            <Select
              value={String(settings.defaultDuration)}
              onValueChange={handleDefaultDurationChange}
            >
              <SelectTrigger variant="ghost">
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
          </SettingRow>
          <SettingRow label={t('settings.calendar.snapInterval')}>
            <Select value={String(settings.snapInterval)} onValueChange={handleSnapIntervalChange}>
              <SelectTrigger variant="ghost">
                <SelectValue placeholder={t('settings.calendar.selectInterval')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">{t('settings.calendar.interval5min')}</SelectItem>
                <SelectItem value="10">{t('settings.calendar.interval10min')}</SelectItem>
                <SelectItem value="15">{t('settings.calendar.interval15min')}</SelectItem>
                <SelectItem value="30">{t('settings.calendar.interval30min')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
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
