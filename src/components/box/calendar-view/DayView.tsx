'use client'

import React from 'react'
import { TimeGrid } from './TimeGrid'
import { CalendarTask } from './utils/time-grid-helpers'

export interface DayViewProps {
  currentDate: Date
  tasks?: CalendarTask[]
  onTaskClick?: (task: CalendarTask) => void
  onDateClick?: (date: Date, time: string) => void
  gridInterval?: 15 | 30 | 60
  className?: string
}

export function DayView({
  currentDate,
  tasks = [],
  onTaskClick,
  onDateClick,
  gridInterval = 15,
  className = ''
}: DayViewProps) {
  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* 日付ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {currentDate.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </h3>
      </div>

      {/* タイムグリッド */}
      <div className="flex-1 overflow-hidden">
        <TimeGrid
          date={currentDate}
          tasks={tasks}
          gridInterval={gridInterval}
          onTaskClick={onTaskClick}
          onEmptyClick={onDateClick}
          showCurrentTime={true}
        />
      </div>
    </div>
  )
}