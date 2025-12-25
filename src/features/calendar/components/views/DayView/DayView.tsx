'use client';

import React, { useMemo } from 'react';

import { getWeek } from 'date-fns';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';
import {
  CalendarDateHeader,
  DateDisplay,
  OverdueSectionSingle,
  ScrollableCalendarLayout,
} from '../shared';

import { DayContent } from './components/DayContent';
import type { DayViewProps } from './DayView.types';
import { useDayView } from './hooks/useDayView';

export const DayView = ({
  dateRange: _dateRange,
  plans,
  allPlans,
  currentDate,
  showWeekends: _showWeekends = true,
  className,
  disabledPlanId,
  onPlanClick,
  onPlanContextMenu,
  onCreatePlan: _onCreatePlan,
  onUpdatePlan,
  onDeletePlan: _onDeletePlan,
  onRestorePlan: _onRestorePlan,
  onEmptyClick,
  onTimeRangeSelect,
  onViewChange: _onViewChange,
  onNavigatePrev: _onNavigatePrev,
  onNavigateNext: _onNavigateNext,
  onNavigateToday,
}: DayViewProps) => {
  const { timezone } = useCalendarSettingsStore();

  // 表示する日付
  const displayDates = useMemo(() => {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);
    return [date];
  }, [currentDate]);

  // 最初の日付を使用（Day表示なので1日のみ）
  const date = displayDates[0];
  if (!date) {
    throw new Error('Display date is undefined');
  }

  // ドラッグイベント用のハンドラー（プラン時間更新）
  const handleEventTimeUpdate = React.useCallback(
    async (eventId: string, updates: { startTime: Date; endTime: Date }) => {
      if (onUpdatePlan) {
        await onUpdatePlan(eventId, updates);
      }
    },
    [onUpdatePlan],
  );

  // DayView専用ロジック（CalendarControllerから渡されたプランデータを使用）
  const {
    dayPlans: dayEvents,
    planStyles: eventStyles,
    isToday,
    timeSlots: _timeSlots,
  } = useDayView({
    date,
    plans: plans || [],
    ...(onUpdatePlan && { onPlanUpdate: onUpdatePlan }),
  });

  // 週番号を計算
  const weekNumber = useMemo(() => {
    return getWeek(date, { weekStartsOn: 1 });
  }, [date]);

  // 日付ヘッダーのクリックハンドラー（DayViewでは日付変更のみ）
  const handleDateHeaderClick = React.useCallback(
    (_clickedDate: Date) => {
      // DayViewで日付ヘッダーをクリックした場合、その日付に移動
      onNavigateToday?.();
    },
    [onNavigateToday],
  );

  const headerComponent = (
    <div className="bg-background flex h-8 items-center justify-center px-2">
      <DateDisplay
        date={date}
        className="text-center"
        showDayName={true}
        showMonthYear={false}
        dayNameFormat="short"
        dateFormat="d"
        isToday={isToday}
        isSelected={false}
        onClick={handleDateHeaderClick}
      />
    </div>
  );

  return (
    <CalendarViewAnimation viewType="day">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* 固定日付ヘッダー */}
        <CalendarDateHeader header={headerComponent} showTimezone={false} weekNumber={weekNumber} />

        {/* タイムゾーン＋未完了プランバッジエリア */}
        <OverdueSectionSingle date={date} plans={allPlans || plans || []} timezone={timezone} />

        {/* スクロール可能コンテンツ */}
        <ScrollableCalendarLayout
          timezone={timezone}
          {...(isToday && { scrollToHour: 8 })}
          displayDates={displayDates}
          viewMode="day"
          // onTimeClickは削除: CalendarDragSelectionがクリック処理を担当
        >
          {/* 日のコンテンツ */}
          <DayContent
            date={date}
            events={dayEvents}
            eventStyles={eventStyles}
            onPlanClick={onPlanClick}
            onPlanContextMenu={onPlanContextMenu}
            onEmptyClick={onEmptyClick}
            onEventUpdate={handleEventTimeUpdate}
            onTimeRangeSelect={onTimeRangeSelect}
            disabledPlanId={disabledPlanId}
            className="absolute inset-y-0 right-0 left-0"
          />
        </ScrollableCalendarLayout>
      </div>
    </CalendarViewAnimation>
  );
};
