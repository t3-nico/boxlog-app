'use client'

import React, { useMemo } from 'react'
import { CalendarViewAnimation } from '../../calendar-grid/ViewTransition'
import { TestDayView } from './TestDayView'
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
  
  // currentDateの時刻をリセット
  const normalizedCurrentDate = useMemo(() => {
    const normalized = new Date(currentDate);
    normalized.setHours(0, 0, 0, 0);
    console.log('🔧 DayView - Normalized currentDate:', {
      original: currentDate.toISOString(),
      normalized: normalized.toISOString()
    });
    return normalized;
  }, [currentDate])

  // TestDayViewを使用
  return (
    <CalendarViewAnimation viewType="day">
      <TestDayView 
        currentDate={normalizedCurrentDate}
        events={events}
      />
    </CalendarViewAnimation>
  )
}