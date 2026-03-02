'use client';

/**
 * ドラッグ選択のプレビュー表示コンポーネント
 *
 * InlineTagPaletteの選択範囲ハイライトと視覚的に統一。
 * 時間範囲 + durationをシンプルに表示する。
 */

import { memo } from 'react';

import { Ban } from 'lucide-react';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../../constants/grid.constants';

import type { TimeRange } from './types';

interface DragSelectionPreviewProps {
  selection: TimeRange;
  formatTime: (hour: number, minute: number) => string;
  /** 既存プランと重複しているか */
  isOverlapping?: boolean;
  /** 1時間あたりの高さ（px） */
  hourHeight?: number | undefined;
}

/**
 * ドラッグ選択範囲のプレビュー表示
 * - プライマリカラーのシンプルなハイライト
 * - 時間範囲 + duration を1行で表示
 * - InlineTagPaletteの選択ハイライトと視覚的に連続
 */
export const DragSelectionPreview = memo(function DragSelectionPreview({
  selection,
  formatTime,
  isOverlapping = false,
  hourHeight = HOUR_HEIGHT,
}: DragSelectionPreviewProps) {
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // 選択範囲のスタイルを計算
  const startMinutes = selection.startHour * 60 + selection.startMinute;
  const endMinutes = selection.endHour * 60 + selection.endMinute;
  const top = startMinutes * (hourHeight / 60);
  const height = (endMinutes - startMinutes) * (hourHeight / 60);

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

  // 時間幅を計算
  const totalMinutes =
    (selection.endHour - selection.startHour) * 60 + (selection.endMinute - selection.startMinute);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const durationText =
    hours > 0 ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`) : `${minutes}m`;

  const timeText = `${formatTime(selection.startHour, selection.startMinute)} – ${formatTime(selection.endHour, selection.endMinute)}`;

  // 重複時は赤背景
  if (isOverlapping) {
    return (
      <div style={style} className="bg-destructive pointer-events-none rounded-lg">
        <div
          className={cn(
            'flex h-full flex-col justify-between overflow-hidden',
            isMobile ? 'p-3' : 'px-2.5 py-1.5',
          )}
        >
          <div className="flex items-center gap-1.5">
            <Ban className="text-destructive-foreground size-3 flex-shrink-0" />
            <span className="text-destructive-foreground text-xs font-medium">
              時間が重複しています
            </span>
          </div>
          <div className="text-destructive-foreground text-xs tabular-nums opacity-70">
            {timeText}
            <span className="ml-2 opacity-70">{durationText}</span>
          </div>
        </div>
      </div>
    );
  }

  // 通常時: InlineTagPaletteと視覚的に連続するプライマリカラーハイライト
  return (
    <div
      style={style}
      className="bg-plan-box border-plan-border pointer-events-none rounded-lg border"
    >
      <div
        className={cn(
          'flex h-full flex-col justify-between overflow-hidden',
          isMobile ? 'p-3' : 'px-2.5 py-1.5',
        )}
      >
        <div className="text-foreground text-xs font-medium tabular-nums">{timeText}</div>
        <div className="text-muted-foreground text-xs tabular-nums">{durationText}</div>
      </div>
    </div>
  );
});
