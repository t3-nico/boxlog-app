'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { CalendarLayout } from './CalendarLayout'
import { DayView } from './views/DayView'
import { SplitDayView } from './views/SplitDayView'
import { ThreeDayView } from './views/ThreeDayView'
import { WeekView } from './views/WeekView'
import { TwoWeekView } from './views/TwoWeekView'
import { ScheduleView } from './views/ScheduleView'
import { PlanVsRecordView } from './views/PlanVsRecordView'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { 
  calculateViewDateRange, 
  getNextPeriod, 
  getPreviousPeriod,
  filterTasksForDateRange,
  isValidViewType
} from './utils/calendar-helpers'
import type { CalendarViewType, CalendarViewProps, Task } from './types'

export function CalendarView({ className }: CalendarViewProps) {
  const [viewType, setViewType] = useState<CalendarViewType>('split-day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const { createRecordFromTask, fetchRecords } = useRecordsStore()
  const { planRecordMode } = useCalendarSettingsStore()
  
  // LocalStorageからビュータイプを復元
  useEffect(() => {
    const saved = localStorage.getItem('calendar-view-type')
    if (saved && isValidViewType(saved)) {
      setViewType(saved as CalendarViewType)
    }
  }, [])

  // ビュータイプをLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('calendar-view-type', viewType)
  }, [viewType])

  // ビューに応じた期間計算
  const viewDateRange = useMemo(() => {
    return calculateViewDateRange(viewType, currentDate)
  }, [viewType, currentDate])

  // recordsの初期ロード
  useEffect(() => {
    if (viewType === 'plan-vs-record') {
      fetchRecords(viewDateRange)
    }
  }, [viewType, viewDateRange, fetchRecords])
  
  // タスク取得（一時的にモックデータを使用）
  const tasks: Task[] = useMemo(() => [
    {
      id: '1',
      title: 'サンプルタスク1',
      planned_start: new Date().toISOString(),
      planned_end: new Date(Date.now() + 3600000).toISOString(),
      planned_duration: 60,
      status: 'pending',
      priority: 'high'
    },
    {
      id: '2',
      title: 'サンプルタスク2',
      planned_start: new Date(Date.now() + 7200000).toISOString(),
      planned_end: new Date(Date.now() + 10800000).toISOString(),
      planned_duration: 60,
      status: 'in_progress',
      priority: 'medium'
    }
  ], [])

  // レコード取得（一時的にモックデータを使用）
  const records = useMemo(() => [
    {
      id: 'r1',
      user_id: 'user1',
      title: '実績タスク1',
      actual_start: new Date(Date.now() - 1800000).toISOString(),
      actual_end: new Date().toISOString(),
      actual_duration: 30,
      satisfaction: 4 as 1 | 2 | 3 | 4 | 5,
      focus_level: 3 as 1 | 2 | 3 | 4 | 5,
      energy_level: 4 as 1 | 2 | 3 | 4 | 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ], [])

  const filteredTasks = useMemo(() => {
    return filterTasksForDateRange(tasks, viewDateRange)
  }, [tasks, viewDateRange])
  
  // ナビゲーション関数
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    switch (direction) {
      case 'prev':
        setCurrentDate(prev => getPreviousPeriod(viewType, prev))
        break
      case 'next':
        setCurrentDate(prev => getNextPeriod(viewType, prev))
        break
      case 'today':
        setCurrentDate(new Date())
        break
    }
  }, [viewType])
  
  // ビュー切り替え
  const handleViewChange = useCallback((newView: CalendarViewType) => {
    setViewType(newView)
  }, [])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            handleNavigate('prev')
            break
          case 'ArrowRight':
            e.preventDefault()
            handleNavigate('next')
            break
          case 't':
            e.preventDefault()
            handleNavigate('today')
            break
          case '1':
            e.preventDefault()
            handleViewChange('day')
            break
          case '2':
            e.preventDefault()
            handleViewChange('split-day')
            break
          case '3':
            e.preventDefault()
            handleViewChange('3day')
            break
          case '7':
            e.preventDefault()
            handleViewChange('week')
            break
          case '5':
            e.preventDefault()
            handleViewChange('week-no-weekend')
            break
          case '14':
            e.preventDefault()
            handleViewChange('2week')
            break
          case 'a':
            e.preventDefault()
            handleViewChange('schedule')
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [viewType, handleNavigate, handleViewChange])

  // ビューコンポーネントのレンダリング
  const renderView = () => {
    const commonProps = {
      dateRange: viewDateRange,
      tasks: filteredTasks,
      currentDate,
      onCreateTask: handleCreateTask,
      onCreateRecord: handleCreateRecord
    }

    switch (viewType) {
      case 'day':
        return <DayView {...commonProps} />
      case 'split-day':
        return (
          <SplitDayView 
            date={currentDate}
            tasks={filteredTasks}
            records={records}
            onCreateTask={handleCreateTask}
            onCreateRecord={handleCreateRecord}
          />
        )
      case '3day':
        return <ThreeDayView {...commonProps} />
      case 'week':
        return <WeekView {...commonProps} />
      case 'week-no-weekend':
        return <WeekView {...commonProps} showWeekends={false} />
      case '2week':
        return <TwoWeekView {...commonProps} />
      case 'schedule':
        return (
          <ScheduleView 
            {...commonProps}
            onTaskClick={(task) => {
              // Handle task click - could open task details or edit
              console.log('Task clicked:', task)
            }}
            onEmptySlotClick={(date, time) => {
              // Handle empty slot click - could create new task
              handleCreateTask({
                title: '',
                planned_start: new Date(`${format(date, 'yyyy-MM-dd')}T${time}`),
                planned_duration: 60,
                status: 'pending',
                priority: 'medium'
              })
            }}
            onDateClick={handleDateSelect}
            useSplitLayout={planRecordMode === 'both'} // Auto-enable split when in 'both' mode
          />
        )
      case 'plan-vs-record':
        return (
          <PlanVsRecordView 
            date={currentDate}
            tasks={filteredTasks}
            onConvertToRecord={createRecordFromTask}
            onCreateTask={handleCreateTask}
          />
        )
      default:
        return <DayView {...commonProps} />
    }
  }
  
  // 日付選択ハンドラー
  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date)
  }, [])

  // タスク作成ハンドラー
  const handleCreateTask = useCallback((taskData: {
    title: string
    planned_start: Date
    planned_duration: number
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
    description?: string
    tags?: string[]
  }) => {
    console.log('Creating new task:', taskData)
    // TODO: 実際のタスク作成処理を実装
    // ここで Supabase やローカルストレージにタスクを保存
  }, [])

  // 記録作成ハンドラー
  const handleCreateRecord = useCallback((recordData: {
    title: string
    actual_start: Date
    actual_end: Date
    actual_duration: number
    satisfaction?: number
    focus_level?: number
    energy_level?: number
    memo?: string
    interruptions?: number
  }) => {
    console.log('Creating new record:', recordData)
    // TODO: 実際の記録作成処理を実装
    // ここで Supabase やローカルストレージに記録を保存
  }, [])

  return (
    <CalendarLayout
      viewType={viewType}
      currentDate={currentDate}
      onNavigate={handleNavigate}
      onViewChange={handleViewChange}
    >
      <div className="h-full overflow-hidden bg-white dark:bg-gray-800">
        {renderView()}
      </div>
    </CalendarLayout>
  )
}