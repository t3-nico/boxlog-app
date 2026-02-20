'use client';

/**
 * パネルからのドラッグ時にカレンダーグリッド上に表示するプレビュー
 *
 * useCalendarDragStore の状態を読み取り、
 * dragSource === 'panel' かつ対象 dayIndex のときにプレビューを描画
 */

import { memo } from 'react';

import { Circle } from 'lucide-react';

import { useCalendarDragStore } from '@/features/calendar/stores/useCalendarDragStore';
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { formatInTimezone } from '@/lib/date/timezone';
import { cn } from '@/lib/utils';

import { calendarStyles } from '../../../../theme/styles';
import { useResponsiveHourHeight } from '../hooks/useResponsiveHourHeight';

interface PanelDragPreviewProps {
  /** このコンテンツの日付インデックス */
  dayIndex: number;
}

export const PanelDragPreview = memo(function PanelDragPreview({
  dayIndex,
}: PanelDragPreviewProps) {
  const hourHeight = useResponsiveHourHeight();
  const dragSource = useCalendarDragStore((s) => s.dragSource);
  const targetDateIndex = useCalendarDragStore((s) => s.targetDateIndex);
  const snappedPosition = useCalendarDragStore((s) => s.snappedPosition);
  const previewTime = useCalendarDragStore((s) => s.previewTime);
  const planData = useCalendarDragStore((s) => s.draggedPlanData);

  const timezone = useCalendarSettingsStore((s) => s.timezone);

  // パネルドラッグ中 && この日のカラム && 位置データあり
  if (dragSource !== 'panel' || targetDateIndex !== dayIndex || !snappedPosition || !previewTime) {
    return null;
  }

  const height = snappedPosition.height ?? hourHeight;
  const title = planData?.title || '';

  // previewTime はUTC（convertFromTimezone済み）なのでカレンダーTZで表示
  const startTimeStr = formatInTimezone(previewTime.start, timezone, 'H:mm');
  const endTimeStr = formatInTimezone(previewTime.end, timezone, 'H:mm');

  return (
    <div
      className={cn(
        'pointer-events-none absolute left-0 w-full',
        'bg-plan-box',
        'after:bg-state-selected after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit]',
        calendarStyles.event.borderRadius,
      )}
      style={{
        top: `${snappedPosition.top}px`,
        height: `${height}px`,
        zIndex: 1000,
      }}
    >
      <div className="relative flex h-full flex-col overflow-hidden p-2">
        {/* チェックボックスアイコン */}
        <div className="flex flex-shrink-0 items-start gap-1">
          <Circle className="text-muted-foreground mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span className="text-foreground line-clamp-2 text-sm leading-tight font-normal">
            {title}
          </span>
        </div>

        {/* 時間 */}
        <div className="text-muted-foreground mt-auto text-xs tabular-nums">
          {startTimeStr} - {endTimeStr}
        </div>
      </div>
    </div>
  );
});
