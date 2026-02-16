'use client';

import React, { useCallback } from 'react';

import { useCalendarDragStore } from '@/features/calendar/stores/useCalendarDragStore';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { cn } from '@/lib/utils';

import {
  calculatePlanGhostStyle,
  calculatePreviewTime,
  CalendarDragSelection,
  type DateTimeSelection,
  PlanCard,
  useGlobalDragCursor,
} from '../../shared';
import { PanelDragPreview } from '../../shared/components/PanelDragPreview';
import { useDragAndDrop } from '../../shared/hooks/useDragAndDrop';
import { useResponsiveHourHeight } from '../../shared/hooks/useResponsiveHourHeight';

interface MultiDayContentProps {
  date: Date;
  plans: CalendarPlan[];
  allEventsForOverlapCheck?: CalendarPlan[] | undefined;
  planStyles: Record<string, React.CSSProperties>;
  onPlanClick?: ((plan: CalendarPlan) => void) | undefined;
  onPlanContextMenu?: ((plan: CalendarPlan, e: React.MouseEvent) => void) | undefined;
  onEmptyClick?: ((date: Date, timeString: string) => void) | undefined;
  onPlanUpdate?: ((planId: string, updates: Partial<CalendarPlan>) => void) | undefined;
  onTimeRangeSelect?: ((selection: DateTimeSelection) => void) | undefined;
  onEmptyAreaContextMenu?:
    | ((date: Date, hour: number, minute: number, e: React.MouseEvent) => void)
    | undefined;
  className?: string | undefined;
  dayIndex: number;
  displayDates?: Date[] | undefined;
  disabledPlanId?: string | null | undefined;
  viewMode: string;
}

export function MultiDayContent({
  date,
  plans,
  allEventsForOverlapCheck,
  planStyles,
  onPlanClick,
  onPlanContextMenu,
  onPlanUpdate,
  onTimeRangeSelect,
  onEmptyAreaContextMenu,
  className,
  dayIndex,
  displayDates,
  disabledPlanId,
  viewMode,
}: MultiDayContentProps) {
  const inspectorPlanId = usePlanInspectorStore((state) => state.planId);
  const isInspectorOpen = usePlanInspectorStore((state) => state.isOpen);

  // レスポンシブな高さ
  const HOUR_HEIGHT = useResponsiveHourHeight();

  const gridHeight = 24 * HOUR_HEIGHT;

  const isGlobalDragging = useCalendarDragStore((s) => s.isDragging);
  const globalDraggedPlan = useCalendarDragStore((s) => s.draggedPlan);
  const globalTargetDateIndex = useCalendarDragStore((s) => s.targetDateIndex);
  const globalOriginalDateIndex = useCalendarDragStore((s) => s.originalDateIndex);

  const handlePlanUpdate = useCallback(
    async (planId: string, updates: { startTime: Date; endTime: Date }) => {
      if (!onPlanUpdate) return;
      return await onPlanUpdate(planId, {
        startDate: updates.startTime,
        endDate: updates.endTime,
      });
    },
    [onPlanUpdate],
  );

  const { dragState, handlers } = useDragAndDrop({
    onPlanUpdate: handlePlanUpdate,
    onPlanClick,
    date,
    events: plans,
    allEventsForOverlapCheck,
    displayDates,
    viewMode,
    disabledPlanId,
  });

  useGlobalDragCursor(dragState, handlers);

  const handlePlanContextMenu = useCallback(
    (plan: CalendarPlan, mouseEvent: React.MouseEvent) => {
      if (dragState.isDragging || dragState.isResizing) {
        return;
      }
      onPlanContextMenu?.(plan, mouseEvent);
    },
    [onPlanContextMenu, dragState.isDragging, dragState.isResizing],
  );

  const timeGrid = React.useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => (
        <div
          key={hour}
          className={`relative ${hour < 23 ? 'border-border border-b' : ''}`}
          style={{ height: HOUR_HEIGHT }}
        />
      )),
    [HOUR_HEIGHT],
  );

  return (
    <div
      className={cn('bg-background relative h-full flex-1 overflow-hidden', className)}
      data-calendar-grid
      data-calendar-day-index={dayIndex}
    >
      <CalendarDragSelection
        date={date}
        className="absolute inset-0"
        onTimeRangeSelect={onTimeRangeSelect}
        onContextMenu={onEmptyAreaContextMenu}
        disabled={dragState.isPending || dragState.isDragging || dragState.isResizing}
        plans={allEventsForOverlapCheck ?? plans}
      >
        <div className="absolute inset-0" style={{ height: gridHeight }}>
          {timeGrid}
        </div>
      </CalendarDragSelection>

      <div className="pointer-events-none absolute inset-0 z-20" style={{ height: gridHeight }}>
        <PanelDragPreview dayIndex={dayIndex} />

        {plans.map((plan) => {
          const style = planStyles[plan.id];
          if (!style) return null;

          const isDragging = dragState.draggedEventId === plan.id && dragState.isDragging;
          const isMovingToOtherDate =
            isGlobalDragging &&
            globalDraggedPlan?.id === plan.id &&
            globalTargetDateIndex !== globalOriginalDateIndex;

          const isResizingThis = dragState.isResizing && dragState.draggedEventId === plan.id;
          const currentTop = parseFloat(style.top?.toString() || '0');
          const currentHeight = parseFloat(style.height?.toString() || '20');

          const adjustedStyle = calculatePlanGhostStyle(style, plan.id, dragState);
          const finalStyle = isMovingToOtherDate
            ? { ...adjustedStyle, opacity: 0.3 }
            : adjustedStyle;

          return (
            <div
              key={plan.id}
              style={finalStyle}
              className="pointer-events-none absolute"
              data-plan-block="true"
            >
              <div
                className="focus:ring-ring pointer-events-auto absolute inset-0 rounded focus:ring-2 focus:ring-offset-1 focus:outline-none"
                role="button"
                tabIndex={0}
                aria-label={`Drag plan: ${plan.title}`}
                data-plan-block="true"
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    handlers.handleMouseDown(
                      plan.id,
                      e,
                      {
                        top: currentTop,
                        left: 0,
                        width: 100,
                        height: currentHeight,
                      },
                      dayIndex,
                    );
                  }
                }}
                onTouchStart={(e) => {
                  handlers.handleTouchStart(
                    plan.id,
                    e,
                    {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    },
                    dayIndex,
                  );
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                  }
                }}
              >
                <PlanCard
                  plan={plan}
                  position={{
                    top: 0,
                    left: 0,
                    width: 100,
                    height:
                      isResizingThis && dragState.snappedPosition
                        ? (dragState.snappedPosition.height ?? currentHeight)
                        : currentHeight,
                  }}
                  onContextMenu={(plan: CalendarPlan, e: React.MouseEvent) =>
                    handlePlanContextMenu(plan, e)
                  }
                  onResizeStart={(
                    plan: CalendarPlan,
                    direction: 'top' | 'bottom',
                    e: React.MouseEvent,
                    _position: { top: number; left: number; width: number; height: number },
                  ) =>
                    handlers.handleResizeStart(plan.id, direction, e, {
                      top: currentTop,
                      left: 0,
                      width: 100,
                      height: currentHeight,
                    })
                  }
                  isDragging={isDragging}
                  isResizing={isResizingThis}
                  isActive={isInspectorOpen && inspectorPlanId === plan.id}
                  previewTime={calculatePreviewTime(plan.id, dragState)}
                  className={`h-full w-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
