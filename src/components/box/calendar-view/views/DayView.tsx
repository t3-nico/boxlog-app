'use client'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { isToday, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { RefinedTimeGrid } from '../components/RefinedTimeGrid'
import { RefinedCalendarTask } from '../components/RefinedCalendarTask'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { TaskCreatedAnimation } from '../components/MicroInteractions'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { CalendarTask } from '../utils/time-grid-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { scrollToCurrentTime } from '../utils/view-helpers'
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
  const [showTaskCreated, setShowTaskCreated] = useState(false)

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
      startTime: task.planned_start,
      endTime: new Date(task.planned_start.getTime() + task.planned_duration * 60000),
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
      }, 100)

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
    setShowTaskCreated(true)
  }

  const handleSaveRecord = (data: CreateRecordInput) => {
    onCreateRecord?.(data)
    setActiveCreation(null)
    setShowTaskCreated(true)
  }

  const handleCancel = () => {
    setActiveCreation(null)
  }

  return (
    <CalendarViewAnimation viewType="day">
      <div className="h-full flex flex-col">
        {/* 日付ヘッダー */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex">
            <div className="w-16 flex-shrink-0 bg-white dark:bg-gray-800"></div>
            <div className="flex-1 px-2 py-2 text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(currentDate, 'E', { locale: ja })}
              </div>
              <div className="text-sm text-gray-900 dark:text-white">
                {format(currentDate, 'd')}
              </div>
            </div>
          </div>
        </div>

        {/* 時間グリッド */}
        <div ref={containerRef} className="flex-1 overflow-hidden">
          {planRecordMode === 'both' ? (
            // 分割表示モード
            <div 
              className="relative h-full bg-white dark:bg-gray-900"
              onMouseDown={handleMouseDown}
              style={{ height: '100%' }}
            >
              <RefinedTimeGrid
                dates={[currentDate]}
                gridInterval={15}
                showCurrentTime={isToday(currentDate)}
                showBusinessHours={true}
                businessHours={{ start: 9, end: 18 }}
                onTimeSlotClick={(date, time, x, y) => {
                  const [hours, minutes] = time.split(':').map(Number)
                  const clickDate = new Date(date)
                  clickDate.setHours(hours, minutes, 0, 0)
                  handleEmptyClick(clickDate, time)
                }}
              >
                <div className="absolute inset-0 flex">
                  {/* 左側：計画タスク */}
                  <div className="w-1/2 pr-0.5 relative">
                    {planTasks.map(task => {
                      const startMinutes = task.startTime.getHours() * 60 + task.startTime.getMinutes()
                      const endMinutes = task.endTime.getHours() * 60 + task.endTime.getMinutes()
                      const duration = endMinutes - startMinutes
                      
                      return (
                        <RefinedCalendarTask
                          key={task.id}
                          task={{
                            ...task,
                            status: (task.status === 'pending' || task.status === 'scheduled') ? 'scheduled' : 
                                   task.status === 'in_progress' ? 'in_progress' : 'completed',
                            priority: task.priority || 'medium'
                          }}
                          view="day"
                          style={{
                            position: 'absolute',
                            top: `${(startMinutes / 60) * 60}px`,
                            height: `${Math.max((duration / 60) * 60, 24)}px`,
                            left: '2px',
                            right: '2px',
                            zIndex: 10
                          }}
                          onClick={handleTaskClick}
                          onStatusChange={(taskId, status) => {
                            console.log('Plan status change:', taskId, status)
                          }}
                        />
                      )
                    })}
                  </div>
                  
                  {/* 中央区切り線 */}
                  <div className="w-px bg-gray-300 dark:bg-gray-600 z-20" />
                  
                  {/* 右側：記録タスク */}
                  <div className="w-1/2 pl-0.5 relative">
                    {recordTasks.map(task => {
                      const startMinutes = task.startTime.getHours() * 60 + task.startTime.getMinutes()
                      const endMinutes = task.endTime.getHours() * 60 + task.endTime.getMinutes()
                      const duration = endMinutes - startMinutes
                      
                      return (
                        <RefinedCalendarTask
                          key={task.id}
                          task={{
                            ...task,
                            status: (task.status === 'pending' || task.status === 'scheduled') ? 'scheduled' : 
                                   task.status === 'in_progress' ? 'in_progress' : 'completed',
                            priority: task.priority || 'medium'
                          }}
                          view="day"
                          style={{
                            position: 'absolute',
                            top: `${(startMinutes / 60) * 60}px`,
                            height: `${Math.max((duration / 60) * 60, 24)}px`,
                            left: '2px',
                            right: '2px',
                            zIndex: 10
                          }}
                          onClick={handleTaskClick}
                          onStatusChange={(taskId, status) => {
                            console.log('Record status change:', taskId, status)
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </RefinedTimeGrid>

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
            <RefinedTimeGrid
              dates={[currentDate]}
              gridInterval={15}
              showCurrentTime={isToday(currentDate)}
              showBusinessHours={true}
              businessHours={{ start: 9, end: 18 }}
              onTimeSlotClick={(date, time, x, y) => {
                const [hours, minutes] = time.split(':').map(Number)
                const clickDate = new Date(date)
                clickDate.setHours(hours, minutes, 0, 0)
                handleEmptyClick(clickDate, time)
              }}
            >
              {/* タスク表示 */}
              <div className="absolute inset-0">
                {calendarTasks.map(task => {
                  const startMinutes = task.startTime.getHours() * 60 + task.startTime.getMinutes()
                  const endMinutes = task.endTime.getHours() * 60 + task.endTime.getMinutes()
                  const duration = endMinutes - startMinutes
                  
                  return (
                    <RefinedCalendarTask
                      key={task.id}
                      task={{
                        ...task,
                        status: (task.status === 'pending' || task.status === 'scheduled') ? 'scheduled' : 
                               task.status === 'in_progress' ? 'in_progress' : 'completed',
                        priority: task.priority || 'medium'
                      }}
                      view="day"
                      style={{
                        position: 'absolute',
                        top: `${(startMinutes / 60) * 60}px`,
                        height: `${Math.max((duration / 60) * 60, 24)}px`,
                        left: '4px',
                        right: '4px',
                        zIndex: 10
                      }}
                      onClick={handleTaskClick}
                      onStatusChange={(taskId, status) => {
                        console.log('Status change:', taskId, status)
                      }}
                    />
                  )
                })}
              </div>
            </RefinedTimeGrid>
          )}
        </div>
      </div>
      
      {/* タスク作成成功アニメーション */}
      <TaskCreatedAnimation
        isVisible={showTaskCreated}
        onComplete={() => setShowTaskCreated(false)}
      />
    </CalendarViewAnimation>
  )
}