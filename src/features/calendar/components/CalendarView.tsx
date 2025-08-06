'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
import { UnifiedCalendarHeader } from './calendar-grid/UnifiedCalendarHeader'
import { DayView } from './views/day-view'
import { ThreeDayView } from './views/three-day-view'
import { WeekView } from './views/week-view'
import { MonthView } from './views/month-view'
import { AddPopup, useAddPopup } from '@/components/add-popup'
import { DnDProvider } from './calendar-grid/dnd/DnDProvider'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEventStore } from '@/stores/useEventStore'
import { 
  calculateViewDateRange, 
  getNextPeriod, 
  getPreviousPeriod,
  filterTasksForDateRange
} from '../lib/view-helpers'
import { isValidViewType } from '../lib/calendar-helpers'
import type { CalendarViewType, CalendarViewProps, Task, CalendarEvent } from '../types/calendar.types'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/types/events'

interface CalendarViewExtendedProps extends CalendarViewProps {
  initialViewType?: CalendarViewType
  initialDate?: Date | null
}

export function CalendarView({ 
  className,
  initialViewType = 'day',
  initialDate
}: CalendarViewExtendedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [viewType, setViewType] = useState<CalendarViewType>(initialViewType)
  const [currentDate, setCurrentDate] = useState<Date>(() => initialDate || new Date())
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [eventDefaultDate, setEventDefaultDate] = useState<Date | undefined>(undefined)
  const [eventDefaultTime, setEventDefaultTime] = useState<string | undefined>(undefined)
  const [eventDefaultEndTime, setEventDefaultEndTime] = useState<string | undefined>(undefined)
  
  // カレンダー専用ポップアップの状態
  const [isCalendarEventPopupOpen, setIsCalendarEventPopupOpen] = useState(false)
  
  // テスト用ポップアップの状態
  const [isTestPopupOpen, setIsTestPopupOpen] = useState(false)
  const [testEvent, setTestEvent] = useState<CalendarEvent | null>(null)
  
  // AddPopup hook（編集時のみ使用）
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
    if (initialDate && initialDate.getTime() !== currentDate.getTime()) {
      setCurrentDate(initialDate)
    }
  }, [initialDate])

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
  }, [taskStore, viewDateRange.start, viewDateRange.end])
  
  // 表示範囲のイベントを取得してCalendarEvent型に変換
  const filteredEvents = useMemo(() => {
    // サーバーサイドでは空配列を返してhydrationエラーを防ぐ
    if (typeof window === 'undefined') {
      return []
    }
    
    console.log('🔍 [' + viewType + '] events.length:', events.length)
    console.log('🔍 [' + viewType + '] dateRange:', { start: viewDateRange.start.toISOString(), end: viewDateRange.end.toISOString() })
    
    // 日付範囲を年月日のみで比較するため、時刻をリセット
    const startDateOnly = new Date(viewDateRange.start.getFullYear(), viewDateRange.start.getMonth(), viewDateRange.start.getDate())
    const endDateOnly = new Date(viewDateRange.end.getFullYear(), viewDateRange.end.getMonth(), viewDateRange.end.getDate())
    
    const filteredByRange = events.filter(event => {
      // startDateがない場合はフィルタリングから除外
      if (!event.startDate) {
        console.log('❌ Event has no startDate:', event.id, event.title)
        return false
      }
      
      // イベントの日付も年月日のみで比較
      const eventStartDateOnly = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate())
      let eventEndDateOnly = eventStartDateOnly
      if (event.endDate) {
        eventEndDateOnly = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate())
      }
      
      const inRange = (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
                     (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
                     (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
      
      if (inRange) {
        console.log('✅ Event in range:', event.id, event.title, `${event.startDate.toDateString()} ${event.startDate.toTimeString().substring(0, 8)}`)
      } else {
        console.log('❌ Event NOT in range:', event.id, event.title, `${event.startDate.toDateString()} ${event.startDate.toTimeString().substring(0, 8)}`)
      }
      
      return inRange
    })
    
    console.log('🔍 Events in date range:', filteredByRange.length, 'Total events in store:', events.length)
    
    // Event[]をCalendarEvent[]に変換
    const calendarEvents = filteredByRange.map(event => ({
      ...event,
      startDate: event.startDate || new Date(),
      endDate: event.endDate || new Date(),
      displayStartDate: event.startDate || new Date(),
      displayEndDate: event.endDate || new Date(),
      duration: event.endDate && event.startDate 
        ? (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60) // minutes
        : 60, // default 1 hour
      isMultiDay: event.startDate && event.endDate 
        ? event.startDate.toDateString() !== event.endDate.toDateString()
        : false,
      isRecurring: event.isRecurring || false,
      type: event.type || 'event' as any
    }))
    console.log('🔍 Final calendar events:', calendarEvents.length)
    return calendarEvents
  }, [events, viewDateRange.start, viewDateRange.end, viewType])
  
  // イベントの初期ロードと更新 - 完全に無効化
  // useEffect(() => {
  //   console.log('🌐 [COMPLETELY DISABLED]')
  // }, [])

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
    console.log('🖱️ Event clicked:', event)
    
    // テスト用ポップアップを開く
    setTestEvent(event)
    setIsTestPopupOpen(true)
  }, [])
  
  const handleCreateEvent = useCallback((date?: Date, time?: string) => {
    // 日付と時間をセット（同期的に実行）
    if (date) {
      setEventDefaultDate(date)
      if (time) {
        // time が "HH:mm-HH:mm" 形式の場合は分割
        if (time.includes('-')) {
          const [startTime, endTime] = time.split('-')
          setEventDefaultTime(startTime)
          setEventDefaultEndTime(endTime)
        } else {
          setEventDefaultTime(time)
          setEventDefaultEndTime(undefined)
        }
      } else {
        // 時間が指定されていない場合はデフォルト値をクリア
        setEventDefaultTime(undefined)
        setEventDefaultEndTime(undefined)
      }
    } else {
      // 日付が指定されていない場合はすべてクリア
      setEventDefaultDate(undefined)
      setEventDefaultTime(undefined)
      setEventDefaultEndTime(undefined)
    }
    
    // カレンダー専用ポップアップを開く（状態の競合なし）
    setIsCalendarEventPopupOpen(true)
  }, [])
  
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

  // イベント更新ハンドラー（ドラッグ&ドロップ用）
  const handleUpdateEvent = useCallback(async (updatedEvent: CalendarEvent) => {
    console.log('🔄 handleUpdateEvent called:', {
      id: updatedEvent.id,
      title: updatedEvent.title,
      originalStart: updatedEvent.startDate?.toISOString(),
      originalEnd: updatedEvent.endDate?.toISOString(),
      startDateString: updatedEvent.startDate?.toDateString(),
      endDateString: updatedEvent.endDate?.toDateString(),
      currentViewDateRange: {
        start: viewDateRange.start.toISOString(),
        end: viewDateRange.end.toISOString()
      }
    })
    
    try {
      const updateRequest: UpdateEventRequest = {
        id: updatedEvent.id,
        title: updatedEvent.title,
        startDate: updatedEvent.startDate,
        endDate: updatedEvent.endDate,
        location: updatedEvent.location,
        description: updatedEvent.description,
        color: updatedEvent.color
      }
      
      console.log('📤 Sending update request:', updateRequest)
      await eventStore.updateEvent(updateRequest)
      console.log('✅ Event updated successfully:', updatedEvent.title)
      
    } catch (error) {
      console.error('❌ Failed to update event:', error)
    }
  }, [eventStore, viewDateRange.start, viewDateRange.end])
  
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
    console.log('🎯 CalendarView handleUpdateEvent:', typeof handleUpdateEvent, !!handleUpdateEvent)
    const commonProps = {
      dateRange: viewDateRange,
      tasks: filteredTasks,
      events: filteredEvents,
      currentDate,
      onCreateTask: handleCreateTask,
      onCreateRecord: handleCreateRecord,
      onTaskClick: handleTaskClick,
      onEventClick: handleEventClick as any,
      onCreateEvent: handleCreateEvent,
      onUpdateEvent: handleUpdateEvent as any,
      onViewChange: handleViewChange,
      onNavigatePrev: () => handleNavigate('prev'),
      onNavigateNext: () => handleNavigate('next'),
      onNavigateToday: () => handleNavigate('today')
    }

    console.log('🎯 Current viewType:', viewType)
    console.log('🎯 ViewDateRange:', viewDateRange)
    switch (viewType) {
      case 'day':
        console.log('🎯 Rendering DayView with events:', filteredEvents.length)
        return <DayView {...commonProps} />
      case 'split-day':
        // Split-day view is currently not available, fallback to day view
        return <DayView {...commonProps} />
      case '3day':
        return <ThreeDayView {...commonProps} />
      case 'week':
        return <WeekView {...commonProps} />
      case 'week-no-weekend':
        return <WeekView {...commonProps} showWeekends={false} />
      case '2week':
        // 2-week view is currently not available, fallback to week view
        return <WeekView {...commonProps} />
      case 'month':
        return <MonthView {...commonProps} />
      case 'schedule':
        // Schedule view is currently not available, fallback to day view
        return <DayView {...commonProps} />
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
    <DnDProvider>
      <>
        <div className="h-full flex flex-col bg-background">
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
          <div className="flex-1 min-h-0 bg-background" style={{ paddingRight: 0, paddingLeft: 0, padding: 0 }}>
            {renderView()}
          </div>
        </div>
      
      {/* モーダルコンポーネントは現在無効化されています */}
      
      {/* AddPopupは残す */}
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
    </DnDProvider>
  )
}