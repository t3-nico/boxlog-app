'use client';

import { useMemo } from 'react';

import { format, getWeek, isToday } from 'date-fns';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';
import {
  CalendarDateHeader,
  DateDisplay,
  OverdueSection,
  ScrollableCalendarLayout,
  useMultiDayPlanPositions,
  usePlanStyles,
} from '../shared';
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight';

import { ThreeDayContent } from './components';
import { useThreeDayView } from './hooks/useThreeDayView';
import type { ThreeDayViewProps } from './ThreeDayView.types';

/**
 * ThreeDayView - 3-day view component
 */
export const ThreeDayView = ({
  dateRange: _dateRange,
  plans,
  allPlans,
  currentDate,
  centerDate: _centerDate,
  showWeekends = true,
  className,
  disabledPlanId,
  onPlanClick,
  onPlanContextMenu,
  onCreatePlan: _onCreatePlan,
  onUpdatePlan,
  onTimeRangeSelect,
  onDeletePlan: _onDeletePlan,
  onRestorePlan: _onRestorePlan,
  onEmptyClick,
  onViewChange: _onViewChange,
  onNavigatePrev: _onNavigatePrev,
  onNavigateNext: _onNavigateNext,
  onNavigateToday: _onNavigateToday,
  onEmptyAreaContextMenu,
}: ThreeDayViewProps) => {
  const { timezone } = useCalendarSettingsStore();

  // レスポンシブな時間高さ
  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  });

  // ThreeDayViewではcurrentDateを中心とした3日間を表示
  const displayCenterDate = useMemo(() => {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [currentDate]);

  // ThreeDayView specific logic
  const { threeDayDates, isCurrentDay } = useThreeDayView({
    centerDate: displayCenterDate,
    events: plans,
    showWeekends,
  });

  // 統一された日付配列を使用（週末表示設定も考慮済み）
  const displayDates = useMemo(() => {
    return threeDayDates;
  }, [threeDayDates]);

  // プラン位置計算（共通フック使用 - 重複プランのカラム配置を正しく計算）
  const { planPositions } = useMultiDayPlanPositions({
    displayDates,
    plans,
    hourHeight: HOUR_HEIGHT,
  });

  // 共通フック使用してスタイル計算
  const planStyles = usePlanStyles(planPositions);

  // 週番号を計算（中央の日付から）
  const weekNumber = useMemo(() => {
    return getWeek(displayCenterDate, { weekStartsOn: 1 });
  }, [displayCenterDate]);

  // TimeGrid が空き時間クリック処理を担当するため、この関数は不要

  // Scroll to current time on initial render (only if center date is today)
  // 初期スクロールはScrollableCalendarLayoutに委譲

  const headerComponent = (
    <div className="bg-background flex h-8">
      {/* 表示日数分のヘッダー（週末フィルタリング対応） */}
      {displayDates.map((date) => (
        <div key={date.toISOString()} className="flex flex-1 items-center justify-center px-1">
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
    <CalendarViewAnimation viewType="3day">
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        {/* 固定日付ヘッダー */}
        <CalendarDateHeader header={headerComponent} showTimezone={false} weekNumber={weekNumber} />

        {/* タイムゾーン＋未完了プランバッジエリア */}
        <OverdueSection dates={displayDates} plans={allPlans || plans} timezone={timezone} />

        {/* スクロール可能コンテンツ */}
        <ScrollableCalendarLayout
          timezone={timezone}
          scrollToHour={isCurrentDay ? undefined : 8}
          displayDates={displayDates}
          viewMode="3day"
          plans={plans}
          enableKeyboardNavigation={true}
        >
          {/* 3日分のグリッド */}
          {displayDates.map((date, dayIndex) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            // 統一フィルタリング済みの日付に対応するプランを取得
            const dayPlans = plans.filter((plan) => {
              const planDate = plan.startDate || new Date();
              return format(planDate, 'yyyy-MM-dd') === dateKey;
            });

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'relative flex-1',
                  dayIndex < displayDates.length - 1 ? 'border-border border-r' : '',
                )}
                style={{ width: `${100 / displayDates.length}%` }}
              >
                <ThreeDayContent
                  date={date}
                  plans={dayPlans}
                  allEventsForOverlapCheck={plans}
                  planStyles={planStyles}
                  onPlanClick={onPlanClick}
                  onPlanContextMenu={onPlanContextMenu}
                  onEmptyClick={onEmptyClick}
                  onPlanUpdate={
                    onUpdatePlan
                      ? (planId, updates) => {
                          const plan = plans.find((p) => p.id === planId);
                          if (plan) {
                            // 返り値を伝播（繰り返しプラン編集時の skipToast フラグ用）
                            return onUpdatePlan({ ...plan, ...updates });
                          }
                        }
                      : undefined
                  }
                  onTimeRangeSelect={(selectedDate, startTime, endTime) => {
                    // 時間範囲選択時の処理
                    const [startHour = 0, startMinute = 0] = startTime.split(':').map(Number);
                    const [endHour = 0, endMinute = 0] = endTime.split(':').map(Number);

                    // DateTimeSelection形式で親に伝播
                    onTimeRangeSelect?.({
                      date: selectedDate,
                      startHour,
                      startMinute,
                      endHour,
                      endMinute,
                    });
                  }}
                  onEmptyAreaContextMenu={onEmptyAreaContextMenu}
                  disabledPlanId={disabledPlanId}
                  className="h-full"
                  dayIndex={dayIndex}
                  displayDates={displayDates}
                />
              </div>
            );
          })}
        </ScrollableCalendarLayout>
      </div>
    </CalendarViewAnimation>
  );
};
