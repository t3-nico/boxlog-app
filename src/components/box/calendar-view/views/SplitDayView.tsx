'use client'

import React from 'react'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { SplitCalendarLayout } from '../components/SplitCalendarLayout'
import { SplitDayHeader } from '../components/SplitDayHeader'
import { DateHeader } from '../components/DateHeader'
import type { Task, TaskRecord } from '../types'

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

interface SplitDayViewProps {
  date: Date
  tasks: Task[]
  records: TaskRecord[]
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
  onTaskClick?: (task: any) => void
  onRecordClick?: (record: TaskRecord) => void
}

export function SplitDayView({
  date,
  tasks,
  records,
  onCreateTask,
  onCreateRecord,
  onTaskClick,
  onRecordClick
}: SplitDayViewProps) {

  return (
    <CalendarViewAnimation viewType="day">
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* 統計ヘッダー */}
        <SplitDayHeader 
          date={date} 
          tasks={tasks} 
          records={records} 
        />

        {/* 日付ヘッダー */}
        <DateHeader dates={[date]} />

        {/* 共通SplitCalendarLayoutコンポーネントを使用 */}
        <SplitCalendarLayout
          dates={[date]}
          tasks={tasks}
          dateRange={{ start: date, end: date, days: [date] }}
          onTaskClick={onTaskClick}
          onCreateTask={onCreateTask}
          onCreateRecord={onCreateRecord}
        />
      </div>
    </CalendarViewAnimation>
  )
}