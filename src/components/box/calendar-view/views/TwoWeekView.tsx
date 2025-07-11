'use client'

import React, { useMemo, useEffect, useState, useRef } from 'react'
import { isWeekend, isToday, format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { TimeGrid } from '../TimeGrid'
import { TimeAxisLabels } from '../components/TimeAxisLabels'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { SplitGridBackground } from '../components/SplitGridBackground'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { CalendarTask } from '../utils/time-grid-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
import { 
  formatShortDate, 
  formatShortWeekday, 
  filterTasksForDate, 
  getPriorityColorClass,
  cn
} from '../utils/view-helpers'
import type { ViewDateRange, Task, TaskRecord } from '../types'

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

interface TwoWeekViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  showWeekends?: boolean
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
}

export function TwoWeekView({ 
  dateRange, 
  tasks, 
  currentDate,
  showWeekends = true,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord
}: TwoWeekViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  const [activeCreation, setActiveCreation] = useState<{
    type: 'task' | 'record'
    start: Date
    end: Date
    side: 'left' | 'right'
  } | null>(null)

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

  // Recordsの取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords({ start: dateRange.start, end: dateRange.end })
    }
  }, [planRecordMode, dateRange, fetchRecords])

  // Task[]をCalendarTask[]に変換（計画用）
  const planTasks: CalendarTask[] = useMemo(() => {
    if (planRecordMode === 'record') return []
    
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start || ''),
      endTime: new Date(task.planned_end || task.planned_start || ''),
      color: '#3b82f6', // 計画は青色
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium',
      isPlan: true
    }))
  }, [tasks, planRecordMode])

  // TaskRecord[]をCalendarTask[]に変換（実績用）
  const recordTasks: CalendarTask[] = useMemo(() => {
    if (planRecordMode === 'plan') return []
    
    return records.map(record => ({
      id: record.id,
      title: record.title,
      startTime: new Date(record.actual_start),
      endTime: new Date(record.actual_end),
      color: '#10b981', // 実績は緑色
      description: record.memo || '',
      status: 'completed' as const,
      priority: 'medium' as const,
      isRecord: true,
      satisfaction: record.satisfaction,
      focusLevel: record.focus_level,
      energyLevel: record.energy_level
    }))
  }, [records, planRecordMode])

  // 分割ドラッグ機能（'both'モードでのみ有効）
  const { dragState, handleMouseDown, dragPreview } = useSplitDragToCreate({
    containerRef,
    gridInterval: 15,
    onCreateItem: (item) => {
      if (planRecordMode === 'both') {
        setActiveCreation({
          type: item.side === 'left' ? 'task' : 'record',
          start: item.start,
          end: item.end,
          side: item.side
        })
      }
    }
  })

  // 表示するタスクを決定
  const calendarTasks: CalendarTask[] = useMemo(() => {
    switch (planRecordMode) {
      case 'plan':
        return planTasks
      case 'record':
        return recordTasks
      case 'both':
        return [...planTasks, ...recordTasks]
      default:
        return planTasks
    }
  }, [planTasks, recordTasks, planRecordMode])

  const handleTaskClick = (task: CalendarTask) => {
    onTaskClick?.(task)
  }

  const handleEmptyClick = (date: Date, time: string) => {
    onEmptyClick?.(date, time)
  }

  const handleTaskDrop = (task: CalendarTask, newStartTime: Date) => {
    onTaskDrag?.(task.id, newStartTime)
  }

  const handleSaveTask = (data: CreateTaskInput) => {
    onCreateTask?.(data)
    setActiveCreation(null)
  }

  const handleSaveRecord = (data: CreateRecordInput) => {
    onCreateRecord?.(data)
    setActiveCreation(null)
  }

  const handleCancel = () => {
    setActiveCreation(null)
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
              </div>
            ))}
          </div>
        </div>

        {/* Googleカレンダー風の2週間グリッド */}
        <div ref={containerRef} className="flex-1 overflow-hidden">
          {planRecordMode === 'both' ? (
            // 分割表示モード
            <div 
              className="relative h-full"
              onMouseDown={handleMouseDown}
              style={{ height: '100%' }}
            >

              {/* 分割表示のためのカスタムレイアウト */}
              <div className="flex h-full">
                {/* 時間軸 */}
                <TimeAxisLabels 
                  startHour={0} 
                  endHour={24} 
                  interval={60}
                  className="z-10"
                />
                
                {/* 日付別グリッド */}
                <div className="flex-1 flex overflow-y-auto">
                  {[...firstWeek, ...secondWeek].map((day, dayIndex) => {
                    const dayPlanTasks = planTasks.filter(task => 
                      isSameDay(task.startTime, day)
                    )
                    const dayRecordTasks = recordTasks.filter(task => 
                      isSameDay(task.startTime, day)
                    )
                    
                    return (
                      <div key={day.toISOString()} className="flex-1 relative border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                        {/* 時間グリッド背景 */}
                        <div className="absolute inset-0">
                          {Array.from({ length: 24 }, (_, hour) => (
                            <div
                              key={hour}
                              className="border-b border-gray-100 dark:border-gray-800"
                              style={{ height: `${HOUR_HEIGHT}px` }}
                            />
                          ))}
                        </div>
                        
                        {/* 中央分割線 */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 z-10 -translate-x-0.5"></div>
                        
                        {/* 左側：予定 */}
                        <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-0.5">
                          {dayPlanTasks.map(task => {
                            const startHour = task.startTime.getHours()
                            const startMinute = task.startTime.getMinutes()
                            const endHour = task.endTime.getHours()
                            const endMinute = task.endTime.getMinutes()
                            const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                            const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                            
                            return (
                              <div
                                key={task.id}
                                className="absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-blue-600 z-20"
                                style={{
                                  top: `${topPosition}px`,
                                  height: `${Math.max(height, 20)}px`
                                }}
                                onClick={() => handleTaskClick(task)}
                              >
                                {task.title}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* 右側：記録 */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1/2 pl-0.5">
                          {dayRecordTasks.map(task => {
                            const startHour = task.startTime.getHours()
                            const startMinute = task.startTime.getMinutes()
                            const endHour = task.endTime.getHours()
                            const endMinute = task.endTime.getMinutes()
                            const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                            const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                            
                            return (
                              <div
                                key={task.id}
                                className="absolute left-1 right-1 bg-green-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-green-600 z-20"
                                style={{
                                  top: `${topPosition}px`,
                                  height: `${Math.max(height, 20)}px`
                                }}
                                onClick={() => handleTaskClick(task)}
                              >
                                {task.title}
                              </div>
                            )
                          })}
                        </div>
                        
                        {/* 現在時刻線 */}
                        {isToday(day) && (
                          <div
                            className="absolute left-0 right-0 h-px bg-red-500 z-30"
                            style={{
                              top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* インライン作成フォーム */}
              {activeCreation && (
                <SplitQuickCreator
                  type={activeCreation.type}
                  side={activeCreation.side}
                  initialStart={activeCreation.start}
                  initialEnd={activeCreation.end}
                  onSave={(data) => {
                    if (activeCreation.type === 'task') {
                      handleSaveTask(data as CreateTaskInput)
                    } else {
                      handleSaveRecord(data as CreateRecordInput)
                    }
                  }}
                  onCancel={handleCancel}
                />
              )}
            </div>
          ) : (
            // 通常表示モード
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
          )}
        </div>
      </div>
    </CalendarViewAnimation>
  )
}