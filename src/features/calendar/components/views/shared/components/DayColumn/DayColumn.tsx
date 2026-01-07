/**
 * 1日分の列コンポーネント（再利用可能）
 */

'use client';

import { Calendar } from 'lucide-react';
import React, { memo, useMemo } from 'react';

import { EmptyState } from '@/components/common';
import { GRID_BACKGROUND, HOUR_HEIGHT } from '../../constants/grid.constants';
import { usePlanPosition } from '../../hooks/usePlanPosition';
import type { DayColumnProps } from '../../types/view.types';
import { isWeekend } from '../../utils/dateHelpers';

import { filterPlansByDate, sortTimedPlans } from '../../utils/planPositioning';
import { PlanCard } from '../PlanCard/PlanCard';

export const DayColumn = memo<DayColumnProps>(function DayColumn({
  date,
  events,
  hourHeight = HOUR_HEIGHT,
  isToday: _isTodayProp,
  isWeekend: isWeekendProp,
  onTimeClick,
  onEventClick,
  onEventContextMenu,
  className = '',
}) {
  // 今日・週末の判定（propsで上書き可能）
  const isWeekendActual = isWeekendProp ?? isWeekend(date);

  // この日のプランをフィルタリング
  const dayPlans = useMemo(() => {
    // CalendarPlanをTimedPlanに変換
    const timedPlans = events.map((plan) => ({
      ...plan,
      start: plan.startDate || new Date(),
      end: plan.endDate || new Date(),
    }));
    const filtered = filterPlansByDate(timedPlans, date);
    return sortTimedPlans(filtered);
  }, [events, date]);

  // プランの位置を計算
  const planPositions = usePlanPosition(dayPlans, { hourHeight });

  // グリッド高さ
  const columnHeight = 24 * hourHeight;

  // 時間クリックハンドラー
  const handleTimeClick = (e: React.MouseEvent) => {
    if (!onTimeClick) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // 時間計算（15分単位で丸める）
    const totalMinutes = (y * 60) / hourHeight;
    const hour = Math.floor(totalMinutes / 60);
    const minute = Math.floor((totalMinutes % 60) / 15) * 15;
    onTimeClick(date, hour, minute);
  };

  // カラムのスタイル
  const columnClasses = [
    'relative flex-1 min-w-0',
    GRID_BACKGROUND,
    'border-r border-border last:border-r-0',
    isWeekendActual ? 'bg-surface-container/50' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={columnClasses}>
      {/* イベント表示エリア */}
      <div
        role="button"
        tabIndex={0}
        className="relative flex-1 cursor-pointer"
        onClick={handleTimeClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTimeClick(e as unknown as React.MouseEvent<Element, MouseEvent>);
          }
        }}
        style={{
          minHeight: `${columnHeight}px`,
        }}
        aria-label={`Day column for ${date.toDateString()}`}
      >
        {/* 現在時刻線はScrollableCalendarLayoutで統一表示 */}

        {/* プラン */}
        {dayPlans.map((plan) => {
          const position = planPositions.get(plan.id);
          // positionが見つからない場合は、デフォルト位置を使用してレンダリング

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              position={position} // undefinedでも大丈夫（PlanCard側で対応済み）
              onClick={onEventClick}
              onContextMenu={onEventContextMenu}
            />
          );
        })}

        {/* 空状態（プランがない場合） */}
        {dayPlans.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <EmptyState title="" icon={Calendar} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
});
