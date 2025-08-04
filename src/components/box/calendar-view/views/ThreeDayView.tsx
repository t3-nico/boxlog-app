'use client'

import React, { useMemo } from 'react'
import { addDays, subDays } from 'date-fns'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { GoogleLikeCalendar } from '../components/GoogleLikeCalendar'
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

interface ThreeDayViewProps {
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

export function ThreeDayView({ 
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
}: ThreeDayViewProps) {
  const { planRecordMode } = useCalendarSettingsStore()
  const { records } = useRecordsStore()

  // 3日間の日付を計算（昨日、今日、明日）
  const days = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    return [yesterday, today, tomorrow];
  }, [currentDate])

  return (
    <CalendarViewAnimation viewType="3day">
      <div className="h-full">
        <GoogleLikeCalendar
          events={events}
          currentDate={currentDate}
          onEventClick={onEventClick}
          onCreateEvent={onCreateEvent}
          onUpdateEvent={onUpdateEvent}
          initialView="timeGridWeek" // 3日表示に最も近い
          planRecordMode={planRecordMode}
          tasks={records}
        />
      </div>
    </CalendarViewAnimation>
  )
}