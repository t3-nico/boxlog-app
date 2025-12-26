'use client';

/**
 * ドラッグ選択のプレビュー表示コンポーネント
 */

import { memo } from 'react';

import { getEventColor } from '@/features/calendar/theme';
import { calendarStyles } from '@/features/calendar/theme/styles';
import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../../constants/grid.constants';

import type { TimeRange } from './types';

interface DragSelectionPreviewProps {
  selection: TimeRange;
  formatTime: (hour: number, minute: number) => string;
}

/**
 * ドラッグ選択範囲のプレビュー表示
 * - イベントカードと同じスタイルを使用
 * - リアルタイムで時間範囲を表示
 */
export const DragSelectionPreview = memo(function DragSelectionPreview({
  selection,
  formatTime,
}: DragSelectionPreviewProps) {
  // 選択範囲のスタイルを計算
  const startMinutes = selection.startHour * 60 + selection.startMinute;
  const endMinutes = selection.endHour * 60 + selection.endMinute;
  const top = startMinutes * (HOUR_HEIGHT / 60);
  const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    top: `${top}px`,
    height: `${height}px`,
    pointerEvents: 'none',
    zIndex: 1000,
  };

  // scheduledカラーベースのクラス名を生成（イベントカードと同じスタイル）
  const className = cn(
    getEventColor('scheduled', 'background'),
    calendarStyles.event.borderRadius,
    calendarStyles.event.shadow.default,
    'pointer-events-none',
    'opacity-80',
  );

  // 時間幅を計算
  const totalMinutes =
    (selection.endHour - selection.startHour) * 60 + (selection.endMinute - selection.startMinute);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const durationText =
    hours > 0 ? (minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`) : `${minutes}分`;

  return (
    <div style={style} className={className}>
      <div className={cn('flex h-full flex-col', calendarStyles.event.padding)}>
        {/* タイトル */}
        <div
          className={cn(
            getEventColor('scheduled', 'text'),
            calendarStyles.event.fontSize.title,
            'mb-1 leading-tight font-medium',
          )}
        >
          新しいイベント
        </div>

        {/* 時間表示（ドラッグ中にリアルタイム更新） */}
        <div
          className={cn(
            getEventColor('scheduled', 'text'),
            calendarStyles.event.fontSize.time,
            'leading-tight opacity-75',
          )}
        >
          {formatTime(selection.startHour, selection.startMinute)} -{' '}
          {formatTime(selection.endHour, selection.endMinute)}
        </div>

        {/* 時間幅の表示 */}
        <div
          className={cn(
            getEventColor('scheduled', 'text'),
            calendarStyles.event.fontSize.duration,
            'mt-auto opacity-60',
          )}
        >
          {durationText}
        </div>
      </div>
    </div>
  );
});
