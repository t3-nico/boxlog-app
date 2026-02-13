'use client';

/**
 * ドラッグ選択のプレビュー表示コンポーネント
 *
 * PlanCardContentを使用してPlanCard Draftと同じ見た目を実現。
 * 重複時のみ独自スタイリング（赤背景 + 白テキスト）を適用。
 */

import { memo, useMemo } from 'react';

import { Ban, Circle } from 'lucide-react';

import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { calendarStyles } from '@/features/calendar/theme/styles';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { HOUR_HEIGHT } from '../../constants/grid.constants';
import { PlanCardContent } from '../PlanCard/PlanCardContent';

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
 * - PlanCardContentを使用してPlanCard Draftと同じ見た目
 * - リアルタイムで時間範囲を表示
 * - モバイルでは大きく表示して視認性を向上
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

  // 重複時は赤、通常時はPlanCard Draftと同じスタイル（視覚的一貫性）
  const className = cn(
    'relative',
    isOverlapping ? 'bg-destructive' : 'bg-plan-box',
    // state-selected オーバーレイ（ドラフトであることを視覚的に示す）
    !isOverlapping &&
      'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-state-selected',
    calendarStyles.event.borderRadius,
    calendarStyles.event.shadow.default,
    'pointer-events-none',
  );

  // 時間幅を計算
  const totalMinutes =
    (selection.endHour - selection.startHour) * 60 + (selection.endMinute - selection.startMinute);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const durationText =
    hours > 0 ? (minutes > 0 ? `${hours}時間${minutes}分` : `${hours}時間`) : `${minutes}分`;

  // PlanCardContent用のCalendarPlanオブジェクトを生成
  const previewPlan = useMemo<CalendarPlan>(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(selection.startHour, selection.startMinute, 0, 0);
    const endDate = new Date(now);
    endDate.setHours(selection.endHour, selection.endMinute, 0, 0);

    return {
      id: '__drag_preview__',
      title: '新しい予定',
      startDate,
      endDate,
      displayStartDate: startDate,
      displayEndDate: endDate,
      duration: totalMinutes,
      status: 'open',
      color: 'var(--primary)',
      createdAt: now,
      updatedAt: now,
      isMultiDay: false,
      isRecurring: false,
      type: 'plan',
      isDraft: true,
    };
  }, [
    selection.startHour,
    selection.startMinute,
    selection.endHour,
    selection.endMinute,
    totalMinutes,
  ]);

  // 重複時は独自レンダリング（エラー表示）
  if (isOverlapping) {
    return (
      <div style={style} className={className}>
        <div
          className={cn(
            'relative flex h-full flex-col gap-1 overflow-hidden',
            isMobile ? 'p-4' : 'p-2',
          )}
        >
          {/* タイトル + Banアイコン */}
          <div className="flex flex-shrink-0 items-baseline gap-1 text-sm leading-tight font-normal">
            <Ban className={cn('flex-shrink-0 text-white', isMobile ? 'size-4' : 'size-3')} />
            <span className="line-clamp-2 text-white">時間が重複しています</span>
          </div>

          {/* 時間表示 */}
          <div className="flex flex-shrink-0 items-center gap-1 text-xs leading-tight text-white/75 tabular-nums">
            {formatTime(selection.startHour, selection.startMinute)} -{' '}
            {formatTime(selection.endHour, selection.endMinute)}
          </div>

          {/* 時間幅 */}
          <div className="mt-auto text-xs text-white/60 tabular-nums">{durationText}</div>
        </div>
      </div>
    );
  }

  // 通常時はPlanCardContentを使用
  return (
    <div style={style} className={className}>
      {/* Circleアイコン（PlanCardと同じ絶対配置） */}
      {!isMobile && (
        <div className="absolute top-2 left-2 flex items-center justify-center">
          <Circle className="text-muted-foreground h-4 w-4" />
        </div>
      )}

      {/* コンテンツ（PlanCardContentを使用） */}
      <div className={cn('h-full', isMobile ? 'p-4' : 'p-2')}>
        <PlanCardContent
          plan={previewPlan}
          hasCheckbox={!isMobile}
          isMobile={isMobile}
          previewMode={{ durationText }}
        />
      </div>
    </div>
  );
});
