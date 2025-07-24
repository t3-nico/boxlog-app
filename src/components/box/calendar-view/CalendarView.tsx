'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { CalendarLayout } from './CalendarLayout'
import { DayView } from './views/DayView'
import { SplitDayView } from './views/SplitDayView'
import { ThreeDayView } from './views/ThreeDayView'
import { WeekView } from './views/WeekView'
import { TwoWeekView } from './views/TwoWeekView'
import { ScheduleView } from './views/ScheduleView'
import { TaskReviewModal } from './components/TaskReviewModal'
import { EventModal } from './components/EventModal'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { useCalendarSettingsStore } from '@/stores/useCalendarSettingsStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEventStore } from '@/stores/useEventStore'
import { 
  calculateViewDateRange, 
  getNextPeriod, 
  getPreviousPeriod,
  filterTasksForDateRange,
  isValidViewType
} from './utils/calendar-helpers'
import type { CalendarViewType, CalendarViewProps, Task } from './types'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/types/events'

export function CalendarView({ className }: CalendarViewProps) {
  const [viewType, setViewType] = useState<CalendarViewType>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventDefaultDate, setEventDefaultDate] = useState<Date | undefined>(undefined)
  const [eventDefaultTime, setEventDefaultTime] = useState<string | undefined>(undefined)
  
  
  const { createRecordFromTask, fetchRecords } = useRecordsStore()
  const { planRecordMode } = useCalendarSettingsStore()
  const { 
    tasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    updateTaskStatus,
    getTasksForDateRange 
  } = useTaskStore()
  
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByDateRange
  } = useEventStore()
  
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

  // recordsの初期ロード（将来的にstatsビューで使用）
  // useEffect(() => {
  //   fetchRecords(viewDateRange)
  // }, [viewDateRange, fetchRecords])
  
  // 表示範囲のタスクを取得
  const filteredTasks = useMemo(() => {
    return getTasksForDateRange(viewDateRange.start, viewDateRange.end)
  }, [getTasksForDateRange, viewDateRange])
  
  // 表示範囲のイベントを取得
  const filteredEvents = useMemo(() => {
    return getEventsByDateRange(viewDateRange.start, viewDateRange.end)
  }, [getEventsByDateRange, viewDateRange.start, viewDateRange.end, events])
  
  // イベントの初期ロードと更新
  useEffect(() => {
    fetchEvents({
      startDate: viewDateRange.start,
      endDate: viewDateRange.end
    })
  }, [viewDateRange, fetchEvents])

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

  // タスククリックハンドラー
  const handleTaskClick = useCallback((task: any) => {
    // CalendarTaskをTaskストア形式に変換
    const storeTask = {
      id: task.id,
      title: task.title,
      planned_start: task.startTime || new Date(task.planned_start || ''),
      planned_duration: task.planned_duration || Math.round((new Date(task.endTime || '').getTime() - new Date(task.startTime || '').getTime()) / (1000 * 60)),
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      description: task.description,
      tags: task.tags,
      created_at: task.created_at || new Date(),
      updated_at: task.updated_at || new Date()
    }
    setSelectedTask(storeTask)
    setIsReviewModalOpen(true)
  }, [])
  
  // タスクレビューモーダルのハンドラー
  const handleTaskSave = useCallback((task: any) => {
    // カレンダータスクからストアタスクへ変換
    const storeTask = {
      ...task,
      planned_start: typeof task.planned_start === 'string' ? new Date(task.planned_start) : task.planned_start,
      created_at: task.created_at || new Date(),
      updated_at: new Date()
    }
    updateTask(task.id, storeTask)
    setIsReviewModalOpen(false)
  }, [updateTask])
  
  const handleTaskDelete = useCallback((taskId: string) => {
    deleteTask(taskId)
    setIsReviewModalOpen(false)
  }, [deleteTask])
  
  const handleStatusChange = useCallback((taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    updateTaskStatus(taskId, status)
    setIsReviewModalOpen(false)
  }, [updateTaskStatus])
  
  // イベント関連のハンドラー
  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])
  
  const handleCreateEvent = useCallback((date?: Date, time?: string) => {
    setSelectedEvent(null)
    setEventDefaultDate(date)
    setEventDefaultTime(time)
    setIsEventModalOpen(true)
  }, [])
  
  const handleEventSave = useCallback(async (eventData: CreateEventRequest | UpdateEventRequest) => {
    try {
      if ('id' in eventData) {
        await updateEvent(eventData as UpdateEventRequest)
      } else {
        await createEvent(eventData as CreateEventRequest)
      }
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }, [createEvent, updateEvent])
  
  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      await deleteEvent(eventId)
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }, [deleteEvent])
  
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
      events: filteredEvents,
      currentDate,
      onCreateTask: handleCreateTask,
      onCreateRecord: handleCreateRecord,
      onTaskClick: handleTaskClick,
      onEventClick: handleEventClick,
      onCreateEvent: handleCreateEvent
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
            onTaskClick={handleTaskClick}
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
            onTaskClick={handleTaskClick}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            onEmptySlotClick={(date, time) => {
              // Handle empty slot click - could create new task or event
              handleCreateEvent(date, time)
            }}
            onDateClick={handleDateSelect}
            useSplitLayout={planRecordMode === 'both'} // Auto-enable split when in 'both' mode
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
    const newTask = createTask(taskData)
    console.log('Created new task:', newTask)
  }, [createTask])

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
    <>
      <CalendarLayout
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onViewChange={handleViewChange}
        onCreateEvent={() => handleCreateEvent()}
      >
        <div className="h-full overflow-hidden bg-white dark:bg-gray-800">
          {renderView()}
        </div>
      </CalendarLayout>
      
      {/* タスクレビューモーダル */}
      <TaskReviewModal
        task={selectedTask}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSave={handleTaskSave}
        onDelete={handleTaskDelete}
        onStatusChange={handleStatusChange}
      />
      
      {/* イベントモーダル */}
      <EventModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        defaultDate={eventDefaultDate}
        defaultTime={eventDefaultTime}
      />
    </>
  )
}