'use client'

import React, { useMemo } from 'react'
import { isToday, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarTask } from '../utils/time-grid-helpers'
import { 
  filterTasksForDate, 
  getPriorityColorClass,
  getTaskColorClass,
  getTaskDisplayText,
  cn
} from '../utils/view-helpers'
import type { ViewDateRange, Task } from '../types'

interface TwoWeekViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onDayClick?: (date: Date) => void
}

export function TwoWeekView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onDayClick 
}: TwoWeekViewProps) {
  // 2週間を2つのグループに分割
  const weeks = useMemo(() => [
    dateRange.days.slice(0, 7),
    dateRange.days.slice(7, 14)
  ], [dateRange.days])

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

  const handleDayClick = (date: Date) => {
    onDayClick?.(date)
  }

  const renderWeek = (week: Date[], weekIndex: number) => (
    <div key={weekIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* 週ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          第{weekIndex + 1}週 ({format(week[0], 'M/d', { locale: ja })} - {format(week[6], 'M/d', { locale: ja })})
        </h4>
      </div>

      {/* 日グリッド */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 p-px">
        {week.map(day => {
          const dayTasks = filterTasksForDate(calendarTasks, day)
          const isCurrentDay = isToday(day)
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={cn(
                "bg-white dark:bg-gray-800 p-2 min-h-[120px] cursor-pointer",
                "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                isCurrentDay && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              {/* 日付ヘッダー */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-medium",
                    isCurrentDay && "text-blue-600 dark:text-blue-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(day, 'E', { locale: ja })}
                  </span>
                </div>
                
                {dayTasks.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {dayTasks.length}件
                  </span>
                )}
              </div>

              {/* タスクリスト（最大3件表示） */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTaskClick(task)
                    }}
                    className={cn(
                      "text-xs p-1.5 rounded border cursor-pointer transition-colors",
                      "hover:opacity-80",
                      getTaskColorClass(task.status || 'scheduled')
                    )}
                    title={task.title}
                  >
                    <div className="font-medium truncate">
                      {getTaskDisplayText(task, 15)}
                    </div>
                    {task.startTime && (
                      <div className="text-xs opacity-75 mt-0.5">
                        {format(task.startTime, 'HH:mm')}
                      </div>
                    )}
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                    +{dayTasks.length - 3}件
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-6xl mx-auto">
        {/* 2週間のヘッダー */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            2週間ビュー
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {format(dateRange.start, 'yyyy年M月d日', { locale: ja })} - {format(dateRange.end, 'M月d日', { locale: ja })}
          </div>
        </div>

        {/* 2週間グリッド */}
        <div className="space-y-4">
          {weeks.map((week, weekIndex) => renderWeek(week, weekIndex))}
        </div>
      </div>
    </div>
  )
}