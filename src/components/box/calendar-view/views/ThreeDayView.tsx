'use client'

import React, { useMemo, useEffect, useState, useRef } from 'react'
import { addDays, subDays, isToday, format } from 'date-fns'
import { TimeGrid } from '../TimeGrid'
import { SplitGridBackground } from '../components/SplitGridBackground'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { CalendarTask } from '../utils/time-grid-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
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

interface ThreeDayViewProps {
  dateRange: ViewDateRange
  tasks: Task[]
  currentDate: Date
  onTaskClick?: (task: CalendarTask) => void
  onEmptyClick?: (date: Date, time: string) => void
  onTaskDrag?: (taskId: string, newDate: Date) => void
  onCreateTask?: (task: CreateTaskInput) => void
  onCreateRecord?: (record: CreateRecordInput) => void
}

export function ThreeDayView({ 
  dateRange, 
  tasks, 
  currentDate,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord 
}: ThreeDayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  const [activeCreation, setActiveCreation] = useState<{
    type: 'task' | 'record'
    start: Date
    end: Date
    side: 'left' | 'right'
  } | null>(null)
  
  // 3日間の日付を計算（昨日、今日、明日）
  const days = useMemo(() => [
    subDays(currentDate, 1),
    currentDate,
    addDays(currentDate, 1)
  ], [currentDate])

  // Recordsの取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      const threeDayRange = {
        start: days[0],
        end: addDays(days[2], 1) // 次の日の0時まで
      }
      fetchRecords(threeDayRange)
    }
  }, [planRecordMode, days, fetchRecords])

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
    gridInterval: 60,
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
    <div className="h-full flex flex-col">
      
      {/* 簡潔な日付ヘッダー */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex">
          <div className="w-16 flex-shrink-0 bg-white dark:bg-gray-800"></div>
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={cn(
                "flex-1 px-2 py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                isToday(day) && "bg-blue-50 dark:bg-blue-900/20",
                index === 1 && "font-medium" // 中央（今日）を強調
              )}
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatShortWeekday(day)}
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3日分のTimeGrid */}
      <div ref={containerRef} className="flex-1 overflow-hidden">
        {planRecordMode === 'both' ? (
          // 分割表示モード
          <div 
            className="relative h-full"
            onMouseDown={handleMouseDown}
            style={{ height: '100%' }}
          >
            {/* 分割グリッド背景 */}
            <SplitGridBackground />
            
            {/* 各日の中央に区切り線 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {days.map((day, index) => {
                const dayWidth = 100 / days.length
                const dayStart = index * dayWidth
                const centerLine = dayStart + (dayWidth / 2)
                
                return (
                  <div
                    key={day.toISOString()}
                    className="absolute top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600"
                    style={{
                      left: `${centerLine}%`
                    }}
                  />
                )
              })}
            </div>

            {/* 分割TimeGrid - 予定と記録を統合 */}
            <TimeGrid
              dates={days}
              tasks={[...planTasks, ...recordTasks]}
              gridInterval={60}
              scrollToTime="08:00"
              showAllDay={true}
              showCurrentTime={days.some(day => isToday(day))}
              showDateHeader={false}
              businessHours={{ start: 9, end: 18 }}
              onTaskClick={handleTaskClick}
              onEmptyClick={handleEmptyClick}
              onTaskDrop={handleTaskDrop}
              className="h-full"
              splitMode={true}
            />

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
            dates={days}
            tasks={calendarTasks}
            gridInterval={60} // 1時間グリッド
            onTaskClick={handleTaskClick}
            onEmptyClick={handleEmptyClick}
            showCurrentTime={days.some(day => isToday(day))}
            showDateHeader={false} // 曜日ヘッダーを非表示（上に独自ヘッダーがあるため）
            className="h-full"
          />
        )}
      </div>
    </div>
  )
}