'use client';

import { useCallback, useMemo } from 'react';

import { Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAutoSaveSettings } from '@/features/settings/hooks/useAutoSaveSettings';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

import { SettingsCard } from './SettingsCard';

interface SleepScheduleAutoSaveSettings {
  sleepSchedule: {
    enabled: boolean;
    bedtime: number;
    wakeTime: number;
  };
}

/**
 * 時間フォーマット（例：23:00）
 */
function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * 睡眠時間を計算
 */
function calculateSleepHours(bedtime: number, wakeTime: number): number {
  if (bedtime >= wakeTime) {
    // 日跨ぎ（例：23:00-7:00）
    return 24 - bedtime + wakeTime;
  } else {
    // 同日（例：1:00-9:00）
    return wakeTime - bedtime;
  }
}

/**
 * 24時間タイムラインバーコンポーネント（睡眠時間帯用）
 */
function SleepTimelineBar({ bedtime, wakeTime }: { bedtime: number; wakeTime: number }) {
  const segments = useMemo(() => {
    const result: Array<{ hour: number; isSleep: boolean }> = [];
    const isCrossingMidnight = bedtime >= wakeTime;

    for (let hour = 0; hour < 24; hour++) {
      let isSleep: boolean;
      if (isCrossingMidnight) {
        // 日跨ぎ（例：23:00-7:00）
        isSleep = hour >= bedtime || hour < wakeTime;
      } else {
        // 同日（例：1:00-9:00）
        isSleep = hour >= bedtime && hour < wakeTime;
      }

      result.push({ hour, isSleep });
    }

    return result;
  }, [bedtime, wakeTime]);

  return (
    <div className="space-y-2">
      {/* 時間ラベル */}
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>

      {/* タイムラインバー */}
      <div className="flex h-6 overflow-hidden rounded-md">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={cn(
              'flex-1 transition-colors',
              segment.isSleep ? 'bg-accent' : 'bg-muted/50',
            )}
            title={`${segment.hour}:00`}
          />
        ))}
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="bg-accent h-3 w-3 rounded" />
          <span className="text-muted-foreground">睡眠</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="bg-muted/50 h-3 w-3 rounded" />
          <span className="text-muted-foreground">活動</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 時間選択オプションを生成
 */
function generateHourOptions(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

/**
 * 睡眠スケジュール設定コンポーネント
 */
export function SleepScheduleSettings() {
  const settings = useCalendarSettingsStore();
  const t = useTranslations();

  // 自動保存システム
  const autoSave = useAutoSaveSettings<SleepScheduleAutoSaveSettings>({
    initialValues: {
      sleepSchedule: {
        enabled: settings.sleepSchedule.enabled,
        bedtime: settings.sleepSchedule.bedtime,
        wakeTime: settings.sleepSchedule.wakeTime,
      },
    },
    onSave: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      settings.updateSettings({ sleepSchedule: values.sleepSchedule });
    },
    successMessage: t('settings.sleepSchedule.settingsSaved'),
    debounceMs: 500,
  });

  // トグルハンドラー
  const handleToggle = useCallback(
    (enabled: boolean) => {
      autoSave.updateValue('sleepSchedule', {
        ...autoSave.values.sleepSchedule,
        enabled,
      });
    },
    [autoSave],
  );

  // 就寝時刻変更ハンドラー
  const handleBedtimeChange = useCallback(
    (value: string) => {
      autoSave.updateValue('sleepSchedule', {
        ...autoSave.values.sleepSchedule,
        bedtime: parseInt(value, 10),
      });
    },
    [autoSave],
  );

  // 起床時刻変更ハンドラー
  const handleWakeTimeChange = useCallback(
    (value: string) => {
      autoSave.updateValue('sleepSchedule', {
        ...autoSave.values.sleepSchedule,
        wakeTime: parseInt(value, 10),
      });
    },
    [autoSave],
  );

  const { enabled, bedtime, wakeTime } = autoSave.values.sleepSchedule;
  const sleepHours = calculateSleepHours(bedtime, wakeTime);
  const hourOptions = generateHourOptions();

  return (
    <SettingsCard title={t('settings.sleepSchedule.title')} isSaving={autoSave.isSaving}>
      <div className="space-y-6">
        {/* 有効/無効トグル */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="text-muted-foreground size-4" />
            <Label htmlFor="sleep-schedule-enabled" className="cursor-pointer">
              {t('settings.sleepSchedule.enabled')}
            </Label>
          </div>
          <Switch id="sleep-schedule-enabled" checked={enabled} onCheckedChange={handleToggle} />
        </div>

        {/* 時刻設定（有効時のみ表示） */}
        {enabled && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {/* 就寝時刻 */}
              <div className="space-y-2">
                <Label htmlFor="bedtime">{t('settings.sleepSchedule.bedtime')}</Label>
                <Select value={bedtime.toString()} onValueChange={handleBedtimeChange}>
                  <SelectTrigger id="bedtime">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {formatHour(hour)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 起床時刻 */}
              <div className="space-y-2">
                <Label htmlFor="wake-time">{t('settings.sleepSchedule.wakeTime')}</Label>
                <Select value={wakeTime.toString()} onValueChange={handleWakeTimeChange}>
                  <SelectTrigger id="wake-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((hour) => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {formatHour(hour)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 睡眠時間表示 */}
            <div className="bg-accent/20 flex items-center gap-2 rounded-lg p-3">
              <Moon className="text-accent-foreground size-4" />
              <div>
                <span className="text-sm font-medium">{t('settings.sleepSchedule.duration')}</span>
                <span className="text-muted-foreground ml-2 text-sm">
                  {t('settings.sleepSchedule.hours', { hours: sleepHours })}
                </span>
              </div>
            </div>

            {/* 24時間タイムライン */}
            <div className="pt-2">
              <h5 className="mb-3 text-sm font-medium">{t('settings.sleepSchedule.preview')}</h5>
              <SleepTimelineBar bedtime={bedtime} wakeTime={wakeTime} />
            </div>
          </>
        )}
      </div>
    </SettingsCard>
  );
}
