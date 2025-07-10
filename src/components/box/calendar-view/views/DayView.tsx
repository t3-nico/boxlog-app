'use client'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { isToday } from 'date-fns'
import { SingleDayTimeGrid } from '../TimeGrid'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { PlanRecordToggle } from '../components/PlanRecordToggle'
import { SplitGridBackground } from '../components/SplitGridBackground'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { CalendarTask } from '../utils/time-grid-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { formatFullDate, scrollToCurrentTime, getPriorityColorClass } from '../utils/view-helpers'
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

interface DayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
}

export function DayView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord 
}: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  const [activeCreation, setActiveCreation] = useState<{
    type: 'task' | 'record'
    start: Date
    end: Date
    side: 'left' | 'right'
  } | null>(null)

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

  // 初回表示時に現在時刻へスクロール
  useEffect(() => {
    if (containerRef.current && isToday(currentDate)) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          scrollToCurrentTime(containerRef.current)
        }
      }, 100) // 少し遅延してスクロール

      return () => clearTimeout(timer)
    }
  }, [currentDate])

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
    <CalendarViewAnimation viewType="day">
      <div className="h-full bg-white dark:bg-gray-900">
        {/* Plan/Record切り替えヘッダー */}
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">日表示</h3>
          <PlanRecordToggle />
        </div>
        
        {/* Google Calendar風のシンプルなヘッダー */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-normal text-gray-900 dark:text-white">
            {formatFullDate(currentDate)}
          </h2>
        </div>
        
        {/* 詳細な時間グリッド */}
        <div ref={containerRef} className="h-full overflow-hidden">
          {planRecordMode === 'both' ? (
            // 分割表示モード
            <div 
              className="relative h-full"
              onMouseDown={handleMouseDown}
              style={{ height: '100%' }}
            >
              {/* 分割グリッド背景 */}
              <SplitGridBackground />
              
              {/* 中央の区切り線 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 z-20">
                {/* ラベル */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-8 text-sm font-medium">
                  <span className="text-blue-600 dark:text-blue-400">← 予定</span>
                  <span className="text-green-600 dark:text-green-400">記録 →</span>
                </div>
              </div>

              {/* 左側：予定タスク */}
              <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-1">
                <SingleDayTimeGrid
                  date={currentDate}
                  tasks={planTasks}
                  gridInterval={15}
                  scrollToTime={isToday(currentDate) ? "current" : "09:00"}
                  showAllDay={true}
                  showCurrentTime={isToday(currentDate)}
                  businessHours={{ start: 9, end: 18 }}
                  enableDragToCreate={false} // 分割ドラッグを使用
                  onTaskClick={handleTaskClick}
                  onEmptyClick={handleEmptyClick}
                  onTaskDrop={handleTaskDrop}
                />
              </div>

              {/* 右側：記録タスク */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1/2 pl-1">
                <SingleDayTimeGrid
                  date={currentDate}
                  tasks={recordTasks}
                  gridInterval={15}
                  scrollToTime={isToday(currentDate) ? "current" : "09:00"}
                  showAllDay={true}
                  showCurrentTime={isToday(currentDate)}
                  businessHours={{ start: 9, end: 18 }}
                  enableDragToCreate={false} // 分割ドラッグを使用
                  onTaskClick={handleTaskClick}
                  onEmptyClick={handleEmptyClick}
                  onTaskDrop={handleTaskDrop}
                />
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
            <SingleDayTimeGrid
              date={currentDate}
              tasks={calendarTasks}
              gridInterval={15} // 15分グリッド
              scrollToTime={isToday(currentDate) ? "current" : "09:00"}
              showAllDay={true}
              showCurrentTime={isToday(currentDate)}
              businessHours={{ start: 9, end: 18 }}
              enableDragToCreate={!!onCreateTask}
              onTaskClick={handleTaskClick}
              onEmptyClick={handleEmptyClick}
              onTaskDrop={handleTaskDrop}
              onCreateTask={onCreateTask}
            />
          )}
        </div>
      </div>
    </CalendarViewAnimation>
  )
}