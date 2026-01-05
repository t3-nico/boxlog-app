'use client';

import React from 'react';

import { getWeek, isToday } from 'date-fns';

import { cn } from '@/lib/utils';

import {
  CalendarDateHeader,
  DateDisplay,
  OverdueSection,
  ScrollableCalendarLayout,
  getDateKey,
} from '../../shared';
import { useResponsiveHourHeight } from '../../shared/hooks/useResponsiveHourHeight';
import { useWeekPlans } from '../hooks/useWeekPlans';

import type { WeekGridProps } from '../WeekView.types';

import { WeekContent } from './WeekContent';

/**
 * WeekGrid - 週表示のメイングリッドコンポーネント
 *
 * @description
 * 7日分のグリッド管理:
 * - 各列の幅を均等分割（100% / 7）
 * - 列間のボーダー
 * - スクロール同期
 * - 現在時刻線の表示
 */
export const WeekGrid = ({
  weekDates,
  events,
  allPlans,
  eventsByDate,
  todayIndex,
  disabledPlanId,
  onEventClick,
  onEventContextMenu,
  onEmptyClick,
  onEventUpdate,
  onTimeRangeSelect,
  timezone,
  className,
}: WeekGridProps) => {
  // レスポンシブな時間高さ（ThreeDayViewと同じパターン）
  useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  });

  // onEventUpdate を WeekContent が期待する型に変換
  const handlePlanUpdate = React.useCallback(
    async (
      planId: string,
      updates: Partial<import('@/features/calendar/types/calendar.types').CalendarPlan>,
    ) => {
      if (!onEventUpdate) return;
      const plan = events.find((e) => e.id === planId);
      if (!plan) return;
      onEventUpdate({ ...plan, ...updates });
    },
    [onEventUpdate, events],
  );

  // プラン位置計算
  const { eventPositions } = useWeekPlans({
    weekDates,
    events,
  });

  // CurrentTimeLine表示のための日付配列（weekDatesをそのまま使用）
  const currentTimeDisplayDates = React.useMemo(() => weekDates, [weekDates]);

  // 週番号を計算（週の最初の日から）
  const weekNumber = React.useMemo(() => {
    const firstDate = weekDates[0];
    if (!firstDate) return undefined;
    return getWeek(firstDate, { weekStartsOn: 1 });
  }, [weekDates]);

  const headerComponent = (
    <div className="bg-background flex h-8 flex-1">
      {/* 7日分の日付ヘッダー */}
      {weekDates.map((date) => (
        <div
          key={date.toISOString()}
          className="flex items-center justify-center px-1"
          style={{ width: `${100 / 7}%` }}
        >
          <DateDisplay
            date={date}
            className="text-center"
            showDayName={true}
            showMonthYear={false}
            dayNameFormat="short"
            dateFormat="d"
            isToday={isToday(date)}
            isSelected={false}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
      {/* 固定日付ヘッダー */}
      <CalendarDateHeader header={headerComponent} showTimezone={false} weekNumber={weekNumber} />

      {/* タイムゾーン＋未完了プランバッジエリア */}
      <OverdueSection dates={weekDates} plans={allPlans || events} timezone={timezone} />

      {/* スクロール可能コンテンツ */}
      <ScrollableCalendarLayout
        timezone={timezone}
        scrollToHour={todayIndex !== -1 ? undefined : 8}
        displayDates={currentTimeDisplayDates}
        viewMode="week"
        // onTimeClickは削除: CalendarDragSelectionがクリック処理を担当
        enableKeyboardNavigation={true}
      >
        {/* 7日分のグリッド */}
        {weekDates.map((date, dayIndex) => {
          const dateKey = getDateKey(date);
          const dayEvents = eventsByDate[dateKey] || [];

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'relative flex-1 overflow-visible',
                dayIndex < weekDates.length - 1 ? 'border-border border-r' : '',
              )}
              style={{ width: `${100 / 7}%` }}
            >
              <WeekContent
                date={date}
                plans={dayEvents}
                allEventsForOverlapCheck={events}
                planPositions={eventPositions}
                onPlanClick={onEventClick}
                onPlanContextMenu={onEventContextMenu}
                onEmptyClick={onEmptyClick}
                onPlanUpdate={handlePlanUpdate}
                onTimeRangeSelect={onTimeRangeSelect}
                disabledPlanId={disabledPlanId}
                className="h-full"
                dayIndex={dayIndex}
                displayDates={weekDates}
              />
            </div>
          );
        })}
      </ScrollableCalendarLayout>
    </div>
  );
};
