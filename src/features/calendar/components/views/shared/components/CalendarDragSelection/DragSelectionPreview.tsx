'use client';

/**
 * ドラッグ選択のプレビュー表示コンポーネント
 */

import { memo } from 'react';

import { Ban } from 'lucide-react';

import { getEventColor } from '@/features/calendar/theme';
import { calendarStyles } from '@/features/calendar/theme/styles';
import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../../constants/grid.constants';

import type { TimeRange } from './types';

interface DragSelectionPreviewProps {
  selection: TimeRange;
  formatTime: (hour: number, minute: number) => string;
  /** 既存プランと重複しているか */
  isOverlapping?: boolean;
}

/**
 * ドラッグ選択範囲のプレビュー表示
 * - イベントカードと同じスタイルを使用
 * - リアルタイムで時間範囲を表示
 */
export const DragSelectionPreview = memo(function DragSelectionPreview({
  selection,
  formatTime,
  isOverlapping = false,
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

  // 重複時は赤、通常時はscheduledカラー
  const className = cn(
    isOverlapping ? 'bg-destructive/60' : getEventColor('scheduled', 'background'),
    calendarStyles.event.borderRadius,
    calendarStyles.event.shadow.default,
    'pointer-events-none',
    isOverlapping ? 'opacity-90' : 'opacity-80',
  );

  // 時間幅を計算
  const totalMinutes =
    (selection.endHour - selection.startHour) * 60 + (selection.endMinute - selection.startMinute);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const durationText =
    hours > 0 ? (minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`) : `${minutes}分`;

  // テキスト色（重複時は白）
  const textColorClass = isOverlapping ? 'text-white' : getEventColor('scheduled', 'text');

  return (
    <div style={style} className={className}>
      <div className={cn('flex h-full flex-col', calendarStyles.event.padding)}>
        {/* タイトル行 */}
        <div className="mb-1 flex items-center gap-1">
          {/* 重複時は⊘アイコンを表示 */}
          {isOverlapping && <Ban className="size-3 flex-shrink-0 text-white" />}
          <div
            className={cn(
              textColorClass,
              calendarStyles.event.fontSize.title,
              'leading-tight font-medium',
            )}
          >
            {isOverlapping ? '時間が重複しています' : '新しいイベント'}
          </div>
        </div>

        {/* 時間表示（ドラッグ中にリアルタイム更新） */}
        <div
          className={cn(
            textColorClass,
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
            textColorClass,
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
