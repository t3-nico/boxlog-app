'use client'

import React, { useState, useRef, useMemo, useEffect } from 'react'
import { isSameDay, isToday, differenceInMinutes, addMinutes } from 'date-fns'
import { CalendarTask } from '../components/CalendarTask'
import { TimeAxisLabels } from '../components/TimeAxisLabels'
import { CurrentTimeLine } from '../CurrentTimeLine'
import { SplitGridBackground } from '../components/SplitGridBackground'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { SplitDayHeader } from '../components/SplitDayHeader'
import { DragPreview } from '../components/DragPreview'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { HOUR_HEIGHT } from '../constants/grid-constants'
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
  onTaskClick?: (task: Task) => void
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
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const [activeCreation, setActiveCreation] = useState<{
    type: 'task' | 'record'
    start: Date
    end: Date
    side: 'left' | 'right'
  } | null>(null)


  // その日のタスクと記録をフィルタリング
  const dayTasks = useMemo(() => 
    tasks.filter(task => 
      task.planned_start && isSameDay(new Date(task.planned_start), date)
    ), [tasks, date]
  )

  const dayRecords = useMemo(() => 
    records.filter(record => 
      isSameDay(new Date(record.actual_start), date)
    ), [records, date]
  )

  // ドラッグで作成（左右判定付き）
  const { dragState, handleMouseDown, dragPreview } = useSplitDragToCreate({
    containerRef,
    gridInterval: 15,
    onCreateItem: (item) => {
      setActiveCreation({
        type: item.side === 'left' ? 'task' : 'record',
        start: item.start,
        end: item.end,
        side: item.side
      })
    }
  })

  // タスクの位置計算
  const calculateTaskStyle = (task: Task): React.CSSProperties => {
    if (!task.planned_start) return {}
    
    const startTime = new Date(task.planned_start)
    const endTime = task.planned_end 
      ? new Date(task.planned_end) 
      : addMinutes(startTime, task.planned_duration || 60)
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const duration = differenceInMinutes(endTime, startTime)
    
    return {
      position: 'absolute',
      top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max((duration / 60) * HOUR_HEIGHT, 20)}px`,
      left: '4px',
      right: '4px',
      zIndex: 10
    }
  }

  // 記録の位置計算
  const calculateRecordStyle = (record: TaskRecord): React.CSSProperties => {
    const startTime = new Date(record.actual_start)
    const endTime = new Date(record.actual_end)
    
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes()
    const duration = differenceInMinutes(endTime, startTime)
    
    return {
      position: 'absolute',
      top: `${(startMinutes / 60) * HOUR_HEIGHT}px`,
      height: `${Math.max((duration / 60) * HOUR_HEIGHT, 20)}px`,
      left: '4px',
      right: '4px',
      zIndex: 10
    }
  }

  // タスクを CalendarTask 形式に変換
  const calendarTasks = useMemo(() => {
    return dayTasks.map(task => ({
      id: task.id,
      title: task.title,
      startTime: new Date(task.planned_start!),
      endTime: task.planned_end 
        ? new Date(task.planned_end) 
        : addMinutes(new Date(task.planned_start!), task.planned_duration || 60),
      color: '#3b82f6',
      description: task.description || '',
      status: task.status || 'scheduled',
      priority: task.priority || 'medium',
      isPlan: true
    }))
  }, [dayTasks])

  // 記録を CalendarTask 形式に変換
  const calendarRecords = useMemo(() => {
    return dayRecords.map(record => ({
      id: record.id,
      title: record.title,
      startTime: new Date(record.actual_start),
      endTime: new Date(record.actual_end),
      color: '#10b981',
      description: record.memo || '',
      status: 'completed' as const,
      priority: 'medium' as const,
      isRecord: true,
      satisfaction: record.satisfaction,
      focusLevel: record.focus_level,
      energyLevel: record.energy_level
    }))
  }, [dayRecords])

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
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* ヘッダー */}
      <SplitDayHeader 
        date={date} 
        tasks={dayTasks} 
        records={dayRecords} 
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 時間軸ラベル */}
        <TimeAxisLabels 
          startHour={0} 
          endHour={24} 
          interval={15}
          className="z-10"
        />

        {/* 2週デザインパターンを適用した統一レイアウト */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden"
          onMouseDown={handleMouseDown}
        >
          {planRecordMode === 'both' ? (
            /* 分割表示モード - 2週デザインパターン */
            <div className="flex h-full">
              {/* 時間軸 */}
              <TimeAxisLabels 
                startHour={0} 
                endHour={24} 
                interval={15}
                className="z-10"
              />
              
              {/* 日付カラム */}
              <div className="flex-1 flex overflow-y-auto">
                <div className="flex-1 relative border-r border-gray-200 dark:border-gray-700">
                  {/* 時間グリッド背景 */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 * 4 }, (_, quarter) => (
                      <div
                        key={quarter}
                        className="border-b border-gray-100 dark:border-gray-800"
                        style={{ height: `${HOUR_HEIGHT / 4}px` }}
                      />
                    ))}
                  </div>
                  
                  {/* 中央分割線 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-600 z-10 -translate-x-0.5"></div>
                  
                  {/* 左側：予定 */}
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 pr-0.5">
                    {calendarTasks.map(task => {
                      const originalTask = dayTasks.find(t => t.id === task.id)!
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
                          onClick={() => onTaskClick?.(originalTask)}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* 右側：記録 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-1/2 pl-0.5">
                    {calendarRecords.map(record => {
                      const originalRecord = dayRecords.find(r => r.id === record.id)!
                      const startHour = record.startTime.getHours()
                      const startMinute = record.startTime.getMinutes()
                      const endHour = record.endTime.getHours()
                      const endMinute = record.endTime.getMinutes()
                      const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                      const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                      
                      return (
                        <div
                          key={record.id}
                          className="absolute left-1 right-1 bg-green-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-green-600 z-20"
                          style={{
                            top: `${topPosition}px`,
                            height: `${Math.max(height, 20)}px`
                          }}
                          onClick={() => onRecordClick?.(originalRecord)}
                        >
                          {record.title}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* 現在時刻線 */}
                  {isToday(date) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-red-500 z-30"
                      style={{
                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : planRecordMode === 'plan' ? (
            /* 予定のみ - 2週デザインパターン */
            <div className="flex h-full">
              <TimeAxisLabels 
                startHour={0} 
                endHour={24} 
                interval={15}
                className="z-10"
              />
              <div className="flex-1 flex overflow-y-auto">
                <div className="flex-1 relative">
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 * 4 }, (_, quarter) => (
                      <div
                        key={quarter}
                        className="border-b border-gray-100 dark:border-gray-800"
                        style={{ height: `${HOUR_HEIGHT / 4}px` }}
                      />
                    ))}
                  </div>
                  {calendarTasks.map(task => {
                    const originalTask = dayTasks.find(t => t.id === task.id)!
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
                        onClick={() => onTaskClick?.(originalTask)}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                  {isToday(date) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-red-500 z-30"
                      style={{
                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* 記録のみ - 2週デザインパターン */
            <div className="flex h-full">
              <TimeAxisLabels 
                startHour={0} 
                endHour={24} 
                interval={15}
                className="z-10"
              />
              <div className="flex-1 flex overflow-y-auto">
                <div className="flex-1 relative">
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 * 4 }, (_, quarter) => (
                      <div
                        key={quarter}
                        className="border-b border-gray-100 dark:border-gray-800"
                        style={{ height: `${HOUR_HEIGHT / 4}px` }}
                      />
                    ))}
                  </div>
                  {calendarRecords.map(record => {
                    const originalRecord = dayRecords.find(r => r.id === record.id)!
                    const startHour = record.startTime.getHours()
                    const startMinute = record.startTime.getMinutes()
                    const endHour = record.endTime.getHours()
                    const endMinute = record.endTime.getMinutes()
                    const topPosition = (startHour + startMinute / 60) * HOUR_HEIGHT
                    const height = ((endHour + endMinute / 60) - (startHour + startMinute / 60)) * HOUR_HEIGHT
                    
                    return (
                      <div
                        key={record.id}
                        className="absolute left-1 right-1 bg-green-500 text-white text-xs p-1 rounded cursor-pointer hover:bg-green-600 z-20"
                        style={{
                          top: `${topPosition}px`,
                          height: `${Math.max(height, 20)}px`
                        }}
                        onClick={() => onRecordClick?.(originalRecord)}
                      >
                        {record.title}
                      </div>
                    )
                  })}
                  {isToday(date) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-red-500 z-30"
                      style={{
                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) * HOUR_HEIGHT}px`
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}