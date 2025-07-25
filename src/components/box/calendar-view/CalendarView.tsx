'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
import { CalendarLayout } from './CalendarLayout'
import { UnifiedCalendarHeader } from './components/UnifiedCalendarHeader'
import { DayView } from './views/DayView'
import { SplitDayView } from './views/SplitDayView'
import { ThreeDayView } from './views/ThreeDayView'
import { WeekView } from './views/WeekView'
import { TwoWeekView } from './views/TwoWeekView'
import { ScheduleView } from './views/ScheduleView'
import { TaskReviewModal } from './components/TaskReviewModal'
import { EventModal } from './components/EventModal'
import { AddPopup, useAddPopup } from '@/components/add-popup'
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
import { convertEventsToCalendarEvents } from './utils/event-converters'
import type { CalendarViewType, CalendarViewProps, Task, CalendarEvent } from './types'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/types/events'

interface CalendarViewExtendedProps extends CalendarViewProps {
  initialViewType?: CalendarViewType
  initialDate?: Date
}

export function CalendarView({ 
  className,
  initialViewType = 'day',
  initialDate = new Date()
}: CalendarViewExtendedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [viewType, setViewType] = useState<CalendarViewType>(initialViewType)
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventDefaultDate, setEventDefaultDate] = useState<Date | undefined>(undefined)
  const [eventDefaultTime, setEventDefaultTime] = useState<string | undefined>(undefined)
  
  // AddPopup hook
  const { isOpen: isAddPopupOpen, openPopup, closePopup } = useAddPopup()
  
  const { createRecordFromTask, fetchRecords } = useRecordsStore()
  const { planRecordMode } = useCalendarSettingsStore()
  const taskStore = useTaskStore()
  const { 
    tasks, 
    createTask, 
    updateTask, 
    deleteTask, 
    updateTaskStatus,
    getTasksForDateRange 
  } = taskStore
  
  const eventStore = useEventStore()
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsByDateRange
  } = eventStore
  
  // LocalStorageからビュータイプを復元
  useEffect(() => {
    const saved = localStorage.getItem('calendar-view-type')
    if (saved && isValidViewType(saved)) {
      setViewType(saved as CalendarViewType)
    }
  }, [])
  
  // URLパラメータの日付変更を検知
  useEffect(() => {
    if (initialDate && (!currentDate || initialDate.getTime() !== currentDate.getTime())) {
      setCurrentDate(initialDate)
    }
  }, [initialDate, currentDate])

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
    return taskStore.getTasksForDateRange(viewDateRange.start, viewDateRange.end)
  }, [taskStore.getTasksForDateRange, viewDateRange.start, viewDateRange.end])
  
  // 表示範囲のイベントを取得してCalendarEvent型に変換
  const filteredEvents = useMemo(() => {
    const events = eventStore.getEventsByDateRange(viewDateRange.start, viewDateRange.end)
    console.log('Date range:', { start: viewDateRange.start, end: viewDateRange.end })
    console.log('Events from store:', eventStore.events)
    console.log('Filtered events:', events)
    const calendarEvents = convertEventsToCalendarEvents(events)
    console.log('Calendar events:', calendarEvents)
    return calendarEvents
  }, [eventStore.getEventsByDateRange, viewDateRange.start, viewDateRange.end, eventStore.events])
  
  // イベントの初期ロードと更新
  const fetchEventsCallback = useCallback(() => {
    eventStore.fetchEvents({
      startDate: viewDateRange.start,
      endDate: viewDateRange.end
    })
  }, [eventStore.fetchEvents, viewDateRange.start, viewDateRange.end])

  useEffect(() => {
    fetchEventsCallback()
  }, [fetchEventsCallback])

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
    taskStore.updateTask(task.id, storeTask)
    setIsReviewModalOpen(false)
  }, [taskStore])
  
  const handleTaskDelete = useCallback((taskId: string) => {
    taskStore.deleteTask(taskId)
    setIsReviewModalOpen(false)
  }, [taskStore])
  
  const handleStatusChange = useCallback((taskId: string, status: 'pending' | 'in_progress' | 'completed') => {
    taskStore.updateTaskStatus(taskId, status)
    setIsReviewModalOpen(false)
  }, [taskStore])
  
  // イベント関連のハンドラー
  const handleEventClick = useCallback((event: CalendarEvent) => {
    console.log('🎯 Event clicked:', event)
    
    // AddPopupで編集するためにselectedEventを設定
    const eventData: Event = {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      priority: event.priority,
      color: event.color,
      location: event.location,
      url: event.url,
      tags: event.tags,
      items: event.items || [],
      isRecurring: event.isRecurring || false,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }
    
    console.log('📋 Setting selected event data:', eventData)
    setSelectedEvent(eventData)
    
    // AddPopupを開く（編集モード）
    openPopup('event')
  }, [openPopup])
  
  const handleCreateEvent = useCallback((date?: Date, time?: string) => {
    // AddPopupを開く（eventタブをデフォルトで開く）
    openPopup('event')
  }, [openPopup])
  
  const handleEventSave = useCallback(async (eventData: CreateEventRequest | UpdateEventRequest) => {
    try {
      if ('id' in eventData) {
        await eventStore.updateEvent(eventData as UpdateEventRequest)
      } else {
        await eventStore.createEvent(eventData as CreateEventRequest)
      }
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }, [eventStore])
  
  const handleEventDelete = useCallback(async (eventId: string) => {
    try {
      await eventStore.deleteEvent(eventId)
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }, [eventStore])
  
  // URLを更新する関数
  const updateURL = useCallback((newViewType: CalendarViewType, newDate?: Date) => {
    const dateToUse = newDate || currentDate
    const dateString = format(dateToUse, 'yyyy-MM-dd')
    router.push(`/calendar/${newViewType}?date=${dateString}`)
  }, [router, currentDate])

  // ナビゲーション関数
  const handleNavigate = useCallback((direction: 'prev' | 'next' | 'today') => {
    let newDate: Date
    switch (direction) {
      case 'prev':
        newDate = getPreviousPeriod(viewType, currentDate)
        setCurrentDate(newDate)
        updateURL(viewType, newDate)
        break
      case 'next':
        newDate = getNextPeriod(viewType, currentDate)
        setCurrentDate(newDate)
        updateURL(viewType, newDate)
        break
      case 'today':
        newDate = new Date()
        setCurrentDate(newDate)
        updateURL(viewType, newDate)
        break
    }
  }, [viewType, currentDate, updateURL])

  // ビュー切り替え
  const handleViewChange = useCallback((newView: CalendarViewType) => {
    setViewType(newView)
    updateURL(newView)
  }, [updateURL])

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
      onCreateEvent: handleCreateEvent,
      onViewChange: handleViewChange,
      onNavigatePrev: () => handleNavigate('prev'),
      onNavigateNext: () => handleNavigate('next'),
      onNavigateToday: () => handleNavigate('today')
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
            onViewChange={handleViewChange}
            onNavigatePrev={() => handleNavigate('prev')}
            onNavigateNext={() => handleNavigate('next')}
            onNavigateToday={() => handleNavigate('today')}
            onCreateEvent={handleCreateEvent}
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
            dateRange={viewDateRange}
            tasks={filteredTasks}
            events={filteredEvents}
            currentDate={currentDate}
            onTaskClick={handleTaskClick}
            onEventClick={handleEventClick}
            onCreateEvent={handleCreateEvent}
            onViewChange={handleViewChange}
            onNavigatePrev={() => handleNavigate('prev')}
            onNavigateNext={() => handleNavigate('next')}
            onNavigateToday={() => handleNavigate('today')}
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
    const newTask = taskStore.createTask(taskData)
  }, [taskStore])

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
    // TODO: 実際の記録作成処理を実装
    // ここで Supabase やローカルストレージに記録を保存
  }, [])

  // 表示される日付の配列を計算
  const displayDates = useMemo(() => {
    return viewDateRange.days
  }, [viewDateRange.days])

  return (
    <>
      <CalendarLayout>
        {/* 共通ヘッダー - すべてのビューで同じインスタンス */}
        <UnifiedCalendarHeader
          viewType={viewType}
          currentDate={currentDate}
          dates={displayDates}
          planRecordMode={planRecordMode}
          onNavigate={handleNavigate}
          onViewChange={handleViewChange}
        />
        
        {/* ビュー固有のコンテンツ */}
        <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-800" style={{ paddingRight: 0, paddingLeft: 0, padding: 0 }}>
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
      
      {/* AddPopup */}
      <AddPopup 
        open={isAddPopupOpen} 
        onOpenChange={(open) => {
          if (!open) {
            closePopup()
            setSelectedEvent(null) // クローズ時にselectedEventをクリア
          }
        }}
        defaultTab="event"
        editingEvent={selectedEvent}
      />
    </>
  )
}