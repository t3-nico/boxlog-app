'use client'

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { isToday, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { RefinedTimeGrid } from '../components/RefinedTimeGrid'
import { RefinedCalendarTask } from '../components/RefinedCalendarTask'
import { SplitQuickCreator } from '../components/SplitQuickCreator'
import { TaskCreatedAnimation } from '../components/MicroInteractions'
import { CalendarViewAnimation } from '../components/ViewTransition'
import { UnifiedCalendarHeader, ViewType } from './UnifiedCalendarHeader'
import { useSplitDragToCreate } from '../hooks/useSplitDragToCreate'
import { CalendarTask } from '../utils/time-grid-helpers'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { scrollToCurrentTime, cn } from '../utils/view-helpers'
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

interface UnifiedCalendarLayoutProps {
  /** 表示するビューの種類 */
  viewType: ViewType
  /** 表示する日付配列 */
  dates: Date[]
  /** タスクデータ */
  tasks: Task[]
  /** 現在の基準日 */
  currentDate: Date
  /** 日付範囲 */
  dateRange: ViewDateRange
  /** ヘッダーコンポーネント（オプション） */
  header?: React.ReactNode
  /** タスククリック時のハンドラ */
  onTaskClick?: (task: CalendarTask) => void
  /** 空の時間スロットクリック時のハンドラ */
  onEmptyClick?: (date: Date, time: string) => void
  /** タスクドラッグ時のハンドラ */
  onTaskDrag?: (taskId: string, newDate: Date) => void
  /** タスク作成時のハンドラ */
  onCreateTask?: (task: CreateTaskInput) => void
  /** 記録作成時のハンドラ */
  onCreateRecord?: (record: CreateRecordInput) => void
  /** ビュー切り替え時のハンドラ */
  onViewChange?: (viewType: ViewType) => void
  /** 日付ナビゲーション */
  onNavigatePrev?: () => void
  onNavigateNext?: () => void
  onNavigateToday?: () => void
  /** 追加のクラス名 */
  className?: string
}

export function UnifiedCalendarLayout({
  viewType,
  dates,
  tasks,
  currentDate,
  dateRange,
  header,
  onTaskClick,
  onEmptyClick,
  onTaskDrag,
  onCreateTask,
  onCreateRecord,
  onViewChange,
  onNavigatePrev,
  onNavigateNext,
  onNavigateToday,
  className
}: UnifiedCalendarLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { planRecordMode } = useCalendarSettingsStore()
  const { records, fetchRecords } = useRecordsStore()
  const [activeCreation, setActiveCreation] = useState<{
    type: 'task' | 'record'
    start: Date
    end: Date
    side: 'left' | 'right'
    dateIndex: number
  } | null>(null)
  const [showTaskCreated, setShowTaskCreated] = useState(false)

  // Recordsの取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(dateRange)
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
          side: item.side,
          dateIndex: 0
        })
      }
    }
  })

  // 初回表示時に現在時刻へスクロール
  useEffect(() => {
    if (containerRef.current && dates.some(date => isToday(date))) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          scrollToCurrentTime(containerRef.current)
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [dates])

  // レスポンシブ対応: 最小カラム幅200pxを確保
  const responsiveDates = useMemo(() => {
    if (typeof window !== 'undefined') {
      const availableWidth = window.innerWidth - 64 // 時間軸の幅を差し引く
      const maxColumns = Math.floor(availableWidth / 200) // 最小カラム幅200px
      
      // モバイル（768px未満）: 強制的に1日表示
      if (window.innerWidth < 768) {
        return [currentDate]
      }
      
      // タブレット（1024px未満）: 最大3列
      if (window.innerWidth < 1024 && dates.length > 3) {
        return dates.slice(0, Math.min(3, maxColumns))
      }
      
      // デスクトップ: カラム幅制限に基づいて調整
      if (dates.length > maxColumns) {
        return dates.slice(0, maxColumns)
      }
    }
    return dates
  }, [dates, currentDate])

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

  // 日付ヘッダーの生成
  const renderDateHeader = () => {
    if (!header) {
      return (
        <UnifiedCalendarHeader
          viewType={viewType}
          dates={responsiveDates}
          currentDate={currentDate}
          onViewChange={onViewChange}
          onNavigatePrev={onNavigatePrev}
          onNavigateNext={onNavigateNext}
          onNavigateToday={onNavigateToday}
        />
      )
    }
    return header
  }

  // タスクを日付別にフィルタリング
  const getTasksForDate = (date: Date, tasks: CalendarTask[]) => {
    return tasks.filter(task => 
      task.startTime.toDateString() === date.toDateString()
    )
  }

  // ViewTypeの変換
  const getAnimationViewType = (viewType: ViewType) => {
    switch (viewType) {
      case 'three-day': return '3day'
      case 'weekday': return 'week-no-weekend'
      default: return viewType
    }
  }

  return (
    <CalendarViewAnimation viewType={getAnimationViewType(viewType)}>
      <div className={cn("h-full flex flex-col", className)}>
        {/* ヘッダー */}
        {renderDateHeader()}

        {/* メインコンテンツエリア */}
        <div ref={containerRef} className="flex-1 overflow-hidden">
          {planRecordMode === 'both' ? (
            // 分割表示モード - 左右50%で計画と記録を分割
            <div 
              className="relative h-full bg-background"
              onMouseDown={handleMouseDown}
              style={{ height: '100%' }}
            >
              <RefinedTimeGrid
                dates={responsiveDates}
                gridInterval={15}
                showCurrentTime={responsiveDates.some(date => isToday(date))}
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
                  {responsiveDates.map((date, dateIndex) => {
                    const dayWidth = 100 / responsiveDates.length
                    const dayPlanTasks = getTasksForDate(date, planTasks)
                    const dayRecordTasks = getTasksForDate(date, recordTasks)
                    
                    return (
                      <div 
                        key={date.toISOString()}
                        className="relative flex border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                        style={{ width: `${dayWidth}%`, minWidth: '200px' }}
                      >
                        {/* 左側：計画タスク */}
                        <div className="w-1/2 relative bg-blue-50/20 dark:bg-blue-900/10">
                          <div className="absolute top-2 left-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                            予定
                          </div>
                          {dayPlanTasks.map(task => {
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
                                view={viewType === 'three-day' || viewType === 'weekday' ? 'day' : viewType}
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
                                  console.log('Plan status change:', taskId, status)
                                }}
                              />
                            )
                          })}
                        </div>
                        
                        {/* 各日付の中央区切り線 */}
                        <div className="w-px bg-[var(--color-neutral-300)] dark:bg-[var(--color-neutral-600)] z-20" style={{ boxShadow: '0 0 1px rgba(0,0,0,0.1)' }} />
                        
                        {/* 右側：記録タスク */}
                        <div className="w-1/2 relative bg-green-50/20 dark:bg-green-900/10">
                          <div className="absolute top-2 right-2 text-xs text-green-600 dark:text-green-400 font-medium">
                            記録
                          </div>
                          {dayRecordTasks.map(task => {
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
                                view={viewType === 'three-day' || viewType === 'weekday' ? 'day' : viewType}
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
                                  console.log('Record status change:', taskId, status)
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
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
            // 通常表示モード - 単一列表示
            <RefinedTimeGrid
              dates={responsiveDates}
              gridInterval={15}
              showCurrentTime={responsiveDates.some(date => isToday(date))}
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
              <div className="absolute inset-0 flex">
                {responsiveDates.map((date, dateIndex) => {
                  const dayWidth = 100 / responsiveDates.length
                  const dayTasks = getTasksForDate(date, calendarTasks)
                  
                  return (
                    <div 
                      key={date.toISOString()}
                      className="relative"
                      style={{ width: `${dayWidth}%`, minWidth: '200px' }}
                    >
                      {dayTasks.map(task => {
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
                            view={viewType === 'three-day' || viewType === 'weekday' ? 'day' : viewType}
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