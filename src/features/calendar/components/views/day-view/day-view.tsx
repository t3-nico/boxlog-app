'use client'

import React, { useMemo } from 'react'
import { FullDayCalendarLayout } from '../../calendar-grid/FullDayCalendarLayout'
import { CalendarViewAnimation } from '../../calendar-grid/ViewTransition'
import type { 
  ViewDateRange, 
  Task, 
  TaskRecord, 
  CalendarViewType,
  CreateTaskInput,
  CreateRecordInput
} from '../../../types/calendar.types'
import type { CalendarEvent } from '@/types/events'

interface DayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  events: CalendarEvent[]
  currentDate: Date
  onTaskClick?: (task: any) => void
  onEventClick?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date, time?: string) => void
  onUpdateEvent?: (event: CalendarEvent) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onViewChange?: (viewType: CalendarViewType) => void
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
}

export function DayView({ 
  dateRange, 
  tasks, 
  events,
  currentDate,
  onTaskClick,
  onEventClick,
  onCreateEvent,
  onUpdateEvent,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday
}: DayViewProps) {
  // DayView専用の簡潔なデバッグログ
  console.log('📅 DayView - Events:', events.length, 'Current Date:', currentDate.toDateString())
  
  // 修正候補1: currentDateの時刻をリセット
  const normalizedCurrentDate = useMemo(() => {
    const normalized = new Date(currentDate);
    normalized.setHours(0, 0, 0, 0);
    console.log('🔧 DayView - Normalized currentDate:', {
      original: currentDate.toISOString(),
      normalized: normalized.toISOString()
    });
    return normalized;
  }, [currentDate])
  
  return (
    <CalendarViewAnimation viewType="day">
      <div 
        className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
        style={{ overscrollBehavior: 'none' }}
      >
        {/* スクロール可能なメインコンテンツ */}
        <div 
          className="flex-1 min-h-0" 
          style={{ overscrollBehavior: 'none' }}
        >
          <FullDayCalendarLayout
            dates={[normalizedCurrentDate]}
            tasks={tasks}
            events={events}
            dateRange={dateRange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
            onUpdateEvent={onUpdateEvent}
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}