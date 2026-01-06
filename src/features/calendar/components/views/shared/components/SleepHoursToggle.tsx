'use client';

import { Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { HoverTooltip } from '@/components/ui/tooltip';
import { useSleepHours } from '@/features/calendar/hooks/useSleepHours';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

interface SleepHoursToggleProps {
  /** 追加のクラス名 */
  className?: string;
}

/**
 * 睡眠時間帯折りたたみトグルボタン
 * カレンダーヘッダーに配置して、睡眠時間帯の表示/非表示を切り替える
 */
export function SleepHoursToggle({ className }: SleepHoursToggleProps) {
  const t = useTranslations('calendar');
  const sleepHours = useSleepHours();
  const sleepHoursCollapsed = useCalendarSettingsStore((state) => state.sleepHoursCollapsed);
  const updateSettings = useCalendarSettingsStore((state) => state.updateSettings);

  // クロノタイプが無効または睡眠時間帯がない場合は非表示
  if (!sleepHours) {
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
            sleepHoursCollapsed ? 'text-primary' : 'text-muted-foreground',
          )}
        />
      </Button>
    </HoverTooltip>
  );
}
