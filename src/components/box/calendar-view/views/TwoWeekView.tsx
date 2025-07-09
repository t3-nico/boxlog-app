'use client'

import React, { useMemo } from 'react'
import { isWeekend, isToday, format, startOfWeek, addDays } from 'date-fns'
import { TimeGrid } from '../TimeGrid'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { CalendarTask } from '../utils/time-grid-helpers'
import { 
  formatShortDate, 
  formatShortWeekday, 
  filterTasksForDate, 
  getPriorityColorClass,
  cn
} from '../utils/view-helpers'
import type { ViewDateRange, Task } from '../types'

interface TwoWeekViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  showWeekends?: boolean
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
}

export function TwoWeekView({ 
  dateRange, 
  tasks, 
  currentDate,
  showWeekends = true,
  onTaskClick,
  onEmptyClick,
  onTaskDrag 
}: TwoWeekViewProps) {
  // 2週間分の日付を第1週と第2週に分割
  const { firstWeek, secondWeek } = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    
    const first = []
    const second = []
    
    // 第1週（0-6日目）
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i)
      if (showWeekends || !isWeekend(date)) {
        first.push(date)
      }
    }
    
    // 第2週（7-13日目）
    for (let i = 7; i < 14; i++) {
      const date = addDays(weekStart, i)
      if (showWeekends || !isWeekend(date)) {
        second.push(date)
      }
    }
    
    return { firstWeek: first, secondWeek: second }
  }, [currentDate, showWeekends])

  // Task[]をCalendarTask[]に変換
  const calendarTasks: CalendarTask[] = useMemo(() => {
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start || ''),
      endTime: new Date(task.planned_end || task.planned_start || ''),
      color: getPriorityColorClass(task.priority || 'medium').split(' ')[0],
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium'
    }))
  }, [tasks])

  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  const handleEmptyClick = (date: Date, time: string) => {
    onEmptyClick?.(date, time)
  }

  const handleTaskDrop = (task: CalendarTask, newStartTime: Date) => {
    onTaskDrag?.(task.id, newStartTime)
  }


  return (
    <CalendarViewAnimation viewType="2week">
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* 統合ヘッダー - 2週間分の日付を横並びで表示 */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex">
            <div className="w-16 flex-shrink-0 bg-white dark:bg-gray-900"></div>
            {/* 第1週の日付 */}
            {firstWeek.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-1 px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700",
                  "transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                  isToday(day) && "bg-blue-50 dark:bg-blue-900/20",
                  isWeekend(day) && "bg-gray-50/50 dark:bg-gray-800/50"
                )}
              >
                <div className={cn(
                  "text-xs font-medium uppercase tracking-wide mb-1",
                  isToday(day) 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {formatShortWeekday(day)}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday(day) 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                    : "text-gray-900 dark:text-white"
                )}>
                  {format(day, 'd')}
                </div>
                {/* タスク数表示 */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {filterTasksForDate(calendarTasks, day).length}件
                </div>
              </div>
            ))}
            {/* 第2週の日付 */}
            {secondWeek.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex-1 px-2 py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                  "transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                  isToday(day) && "bg-blue-50 dark:bg-blue-900/20",
                  isWeekend(day) && "bg-gray-50/50 dark:bg-gray-800/50"
                )}
              >
                <div className={cn(
                  "text-xs font-medium uppercase tracking-wide mb-1",
                  isToday(day) 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {formatShortWeekday(day)}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday(day) 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                    : "text-gray-900 dark:text-white"
                )}>
                  {format(day, 'd')}
                </div>
                {/* タスク数表示 */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {filterTasksForDate(calendarTasks, day).length}件
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Googleカレンダー風の2週間グリッド */}
        <div className="flex-1 overflow-hidden">
          <TimeGrid
            dates={[...firstWeek, ...secondWeek]} // 2週間分をまとめて渡す
            tasks={calendarTasks}
            gridInterval={60} // 2週表示は1時間グリッド
            scrollToTime="08:00"
            showAllDay={false} // 2週表示では全日イベントを非表示
            showCurrentTime={[...firstWeek, ...secondWeek].some(day => isToday(day))}
            showWeekends={showWeekends}
            showDateHeader={false} // 独自ヘッダーを使用
            businessHours={{ start: 9, end: 18 }}
            onTaskClick={handleTaskClick}
            onEmptyClick={handleEmptyClick}
            onTaskDrop={handleTaskDrop}
            className="h-full"
          />
        </div>
      </div>
    </CalendarViewAnimation>
  )
}