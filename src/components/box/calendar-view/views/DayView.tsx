'use client'

import React, { useMemo } from 'react'
import { GoogleLikeCalendar } from '../components/GoogleLikeCalendar'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import type { ViewDateRange, Task, TaskRecord, CalendarViewType } from '../types'
import type { CalendarEvent } from '@/types/events'

interface CreateTaskInput {
  title: string
  planned_start: Date
  planned_duration: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  description?: string
  tags?: string[]
}

interface CreateRecordInput {
  title: string
  actual_start: Date
  actual_end: Date
  actual_duration: number
  satisfaction?: number
  focus_level?: number
  energy_level?: number
  memo?: string
  interruptions?: number
}

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
  
  // FullCalendarを使用（クリーンアップ済み）
  
  // BoxLog設定とレコードデータ
  const { planRecordMode } = useCalendarSettingsStore()
  const { records } = useRecordsStore()
  
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
      <div className="h-full">
        <GoogleLikeCalendar
          events={events}
          currentDate={normalizedCurrentDate}
          onEventClick={onEventClick}
          onCreateEvent={onCreateEvent}
          onUpdateEvent={onUpdateEvent}
          initialView="timeGridDay"
          planRecordMode={planRecordMode}
          tasks={records}
        />
      </div>
    </CalendarViewAnimation>
  )
}