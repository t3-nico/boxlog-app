'use client';

/**
 * ドラッグ選択のプレビュー表示コンポーネント
 */

import { memo } from 'react';

import { Ban, Pencil } from 'lucide-react';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { calendarStyles } from '@/features/calendar/theme/styles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
 * - モバイルでは大きく表示して視認性を向上
 */
export const DragSelectionPreview = memo(function DragSelectionPreview({
  selection,
  formatTime,
  isOverlapping = false,
}: DragSelectionPreviewProps) {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // 選択範囲のスタイルを計算
  const startMinutes = selection.startHour * 60 + selection.startMinute;
  const endMinutes = selection.endHour * 60 + selection.endMinute;
  const top = startMinutes * (HOUR_HEIGHT / 60);
  const height = (endMinutes - startMinutes) * (HOUR_HEIGHT / 60);

  // モバイルでは最小高さを確保して視認性を向上
  const minHeight = isMobile ? 80 : 40;
  const actualHeight = Math.max(height, minHeight);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: '100%',
    top: `${top}px`,
    height: `${actualHeight}px`,
    pointerEvents: 'none',
    zIndex: 1000,
  };

  // 重複時は赤、通常時は控えめなprimaryカラー
  const className = cn(
    isOverlapping ? 'bg-destructive/60' : 'bg-primary/20 border border-primary/40',
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

  // テキスト色（重複時は白、通常時はforeground）
  const textColorClass = isOverlapping ? 'text-white' : 'text-foreground';

  return (
    <div style={style} className={className}>
      <div
        className={cn(
          'flex h-full flex-col',
          // モバイルでは大きめのパディング
          isMobile ? 'p-4' : calendarStyles.event.padding,
        )}
      >
        {/* アイコン + タイトル: PlanCardのドラフトと統一 */}
        <div className="mb-1 flex items-center gap-1">
          {isOverlapping ? (
            <Ban className={cn('flex-shrink-0 text-white', isMobile ? 'size-4' : 'size-3')} />
          ) : (
            <Pencil className={cn('text-primary flex-shrink-0', isMobile ? 'size-4' : 'size-3')} />
          )}
          <span
            className={cn(textColorClass, isMobile ? 'text-sm' : 'text-xs', 'truncate font-bold')}
          >
            {isOverlapping ? '時間が重複しています' : '新しい予定'}
          </span>
        </div>

        {/* 時間表示（ドラッグ中にリアルタイム更新） */}
        <div
          className={cn(
            textColorClass,
            // モバイルでは大きめのフォント
            isMobile ? 'text-sm' : calendarStyles.event.fontSize.time,
            'leading-tight tabular-nums opacity-75',
          )}
        >
          {formatTime(selection.startHour, selection.startMinute)} -{' '}
          {formatTime(selection.endHour, selection.endMinute)}
        </div>

        {/* 時間幅の表示 */}
        <div
          className={cn(
            textColorClass,
            // モバイルでは大きめのフォント
            isMobile ? 'text-xs' : calendarStyles.event.fontSize.duration,
            'mt-auto tabular-nums opacity-60',
          )}
        >
          {durationText}
        </div>
      </div>
    </div>
  );
});
