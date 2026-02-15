'use client';

import { useMemo } from 'react';

import { format, getWeek, isToday } from 'date-fns';

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore';
import { cn } from '@/lib/utils';

import { CalendarViewAnimation } from '../../animations/ViewTransition';
import {
  CalendarDateHeader,
  DailyUsageStrip,
  DateDisplay,
  ScrollableCalendarLayout,
  useMultiDayPlanPositions,
  usePlanStyles,
} from '../shared';
import { useResponsiveHourHeight } from '../shared/hooks/useResponsiveHourHeight';

import { MultiDayContent } from './components';
import { useMultiDayView } from './hooks/useMultiDayView';
import type { MultiDayViewProps } from './MultiDayView.types';

/**
 * MultiDayView - N日間表示の汎用コンポーネント（2〜9日間）
 */
export function MultiDayView({
  dayCount,
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
  onDeletePlan: _onDeletePlan,
  onRestorePlan: _onRestorePlan,
  onEmptyClick,
  onTimeRangeSelect,
  onViewChange: _onViewChange,
  onNavigatePrev: _onNavigatePrev,
  onNavigateNext: _onNavigateNext,
  onNavigateToday: _onNavigateToday,
  onEmptyAreaContextMenu,
}: MultiDayViewProps) {
  const timezone = useCalendarSettingsStore((state) => state.timezone);

  const HOUR_HEIGHT = useResponsiveHourHeight({
    mobile: 48,
    tablet: 60,
    desktop: 72,
  });

  const displayCenterDate = useMemo(() => {
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [currentDate]);

  const { displayDates, isCurrentDay } = useMultiDayView({
    centerDate: displayCenterDate,
    dayCount,
    events: plans,
    showWeekends,
  });

  const { planPositions } = useMultiDayPlanPositions({
    displayDates,
    plans,
    hourHeight: HOUR_HEIGHT,
  });

  const planStyles = usePlanStyles(planPositions);

  const weekNumber = useMemo(() => {
    return getWeek(displayCenterDate, { weekStartsOn: 1 });
  }, [displayCenterDate]);

  const viewMode = `${dayCount}day`;

  const headerComponent = (
    <div className="bg-background flex h-8">
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
    <CalendarViewAnimation viewType={viewMode}>
      <div className={cn('bg-background flex min-h-0 flex-1 flex-col', className)}>
        <CalendarDateHeader header={headerComponent} showTimezone={false} weekNumber={weekNumber} />

        <DailyUsageStrip dates={displayDates} plans={allPlans || plans} timezone={timezone} />

        <ScrollableCalendarLayout
          timezone={timezone}
          scrollToHour={isCurrentDay ? undefined : 8}
          displayDates={displayDates}
          viewMode={viewMode}
          plans={plans}
          enableKeyboardNavigation={true}
        >
          {displayDates.map((date, dayIndex) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayPlans = plans.filter((plan) => {
              const planDate = plan.startDate || new Date();
              return format(planDate, 'yyyy-MM-dd') === dateKey;
            });

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  'relative flex-1',
                  dayIndex < displayDates.length - 1 && 'border-border border-r',
                )}
                style={{ width: `${100 / displayDates.length}%` }}
              >
                <MultiDayContent
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
                            return onUpdatePlan({ ...plan, ...updates });
                          }
                        }
                      : undefined
                  }
                  onTimeRangeSelect={onTimeRangeSelect}
                  onEmptyAreaContextMenu={onEmptyAreaContextMenu}
                  disabledPlanId={disabledPlanId}
                  className="h-full"
                  dayIndex={dayIndex}
                  displayDates={displayDates}
                  viewMode={viewMode}
                />
              </div>
            );
          })}
        </ScrollableCalendarLayout>
      </div>
    </CalendarViewAnimation>
  );
}
