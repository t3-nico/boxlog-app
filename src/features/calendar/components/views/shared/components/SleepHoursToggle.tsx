'use client';

import { Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

interface SleepHoursToggleProps {
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 睡眠時間帯折りたたみトグルボタン
 * カレンダーヘッダーに配置して、睡眠時間帯の折りたたみ/展開を切り替える
 */
export function SleepHoursToggle({ className }: SleepHoursToggleProps) {
  const t = useTranslations('calendar');
  const sleepScheduleEnabled = useCalendarSettingsStore((state) => state.sleepSchedule.enabled);
  const sleepHoursCollapsed = useCalendarSettingsStore((state) => state.sleepHoursCollapsed);
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

  // 睡眠スケジュールが無効の場合は非表示
  if (!sleepScheduleEnabled) {
    return null;
  }

  const handleToggle = () => {
    updateSettings({ sleepHoursCollapsed: !sleepHoursCollapsed });
  };

  const tooltipText = sleepHoursCollapsed ? t('sleepHours.expand') : t('sleepHours.collapse');

  return (
    <HoverTooltip content={tooltipText} side="bottom">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={cn('size-8', className)}
        aria-label={tooltipText}
        aria-pressed={sleepHoursCollapsed}
      >
        <Moon
          className={cn(
            'size-4 transition-colors',
            sleepHoursCollapsed ? 'text-muted-foreground' : 'text-primary',
          )}
        />
      </Button>
    </HoverTooltip>
  );
}
