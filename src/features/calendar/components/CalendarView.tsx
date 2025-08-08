'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
import { DayView } from './views/day-view'
import { ThreeDayView } from './views/three-day-view'
import { WeekView } from './views/week-view'
import { MonthView } from './views/month-view'
import { AddPopup, useAddPopup } from '@/components/add-popup'
import { DnDProvider } from './calendar-grid/dnd/DnDProvider'
import { TrashView } from './calendar-grid/TrashView'
import { useRecordsStore } from '@/stores/useRecordsStore'
import { useCalendarSettingsStore } from '@/features/calendar/stores/useCalendarSettingsStore'
import { useTaskStore } from '@/stores/useTaskStore'
import { useEventStore } from '@/stores/useEventStore'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationDisplay } from '@/components/ui/notification-display'
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
  
  // ゴミ箱の状態
  const [isTrashViewOpen, setIsTrashViewOpen] = useState(false)
  
  // AddPopup hook（編集時のみ使用）
  const { isOpen: isAddPopupOpen, openPopup, closePopup, openEventPopup } = useAddPopup()
  
  
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
  
  // 通知機能の統合
  const {
    permission: notificationPermission,
    hasRequested: hasRequestedNotification,
    visibleNotifications,
    requestPermission: requestNotificationPermission,
    dismissNotification,
    clearAllNotifications
  } = useNotifications({
    events,
    onReminderTriggered: (event, reminder) => {
      console.log('🔔 Reminder triggered:', event.title, reminder.minutesBefore + '分前')
    }
  })
  
  // LocalStorageからビュータイプを復元
  useEffect(() => {
    const saved = localStorage.getItem('calendar-view-type')
    if (saved && isValidViewType(saved)) {
      setViewType(saved as CalendarViewType)
    }
  }, [])
  
  // 通知許可のリクエスト（初回のみ）
  useEffect(() => {
    if (!hasRequestedNotification && (notificationPermission as string) === 'default') {
      requestNotificationPermission()
    }
  }, [hasRequestedNotification, notificationPermission, requestNotificationPermission])
  
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

  // 表示範囲のタスクを取得
  const filteredTasks = useMemo(() => {
    return taskStore.getTasksForDateRange(viewDateRange.start, viewDateRange.end)
  }, [taskStore, viewDateRange.start, viewDateRange.end])
  
  // 表示範囲のイベントを取得してCalendarEvent型に変換（削除済みを除外）
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
      // 削除済みイベントを除外
      if (event.isDeleted) {
        return false
      }
      
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
    // AddPopupを開く（日付と時刻を渡す）
    openEventPopup({
      dueDate: date || new Date(),
      status: 'Todo'
    })
    
    // デフォルト値を設定（AddPopupが開いた後に使用される）
    let startTime: string | undefined
    let endTime: string | undefined
    
    if (time) {
      // time が "HH:mm-HH:mm" 形式の場合は分割
      if (time.includes('-')) {
        [startTime, endTime] = time.split('-')
      } else {
        startTime = time
        endTime = undefined
      }
    }
    
    setEventDefaultDate(date || undefined)
    setEventDefaultTime(startTime || '09:00')
    setEventDefaultEndTime(endTime)
    setSelectedEvent(null)
  }, [openEventPopup])
  
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
      // 物理削除（実際にデータから削除）
      const eventToDelete = eventStore.events.find(e => e.id === eventId)
      if (eventToDelete) {
        await eventStore.deleteEvent(eventId)
        console.log('🗑️ Event permanently deleted:', eventToDelete.title)
      }
      
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }, [eventStore])
  
  const handleEventRestore = useCallback(async (event: CalendarEvent) => {
    try {
      const createRequest: CreateEventRequest = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        description: event.description,
        color: event.color
      }
      
      await eventStore.createEvent(createRequest)
      console.log('🔄 Event restored:', event.title)
    } catch (error) {
      console.error('Failed to restore event:', error)
    }
  }, [eventStore])
  
  // ゴミ箱関連のハンドラー
  const handleTrashOpen = useCallback(() => {
    setIsTrashViewOpen(true)
  }, [])
  
  const handleTrashClose = useCallback(() => {
    setIsTrashViewOpen(false)
  }, [])
  
  const handleRestore = useCallback(async (eventId: string) => {
    try {
      const eventToRestore = events.find(e => e.id === eventId)
      if (eventToRestore) {
        const updateRequest: UpdateEventRequest = {
          ...eventToRestore,
          isDeleted: false,
          deletedAt: null
        }
        await eventStore.updateEvent(updateRequest)
        console.log('🔄 Event restored:', eventToRestore.title)
      }
    } catch (error) {
      console.error('Failed to restore event:', error)
    }
  }, [events, eventStore])
  
  const handleDeletePermanently = useCallback(async (eventIds: string[]) => {
    try {
      await Promise.all(eventIds.map(id => eventStore.deleteEvent(id)))
      console.log('💀 Events permanently deleted:', eventIds.length)
    } catch (error) {
      console.error('Failed to permanently delete events:', error)
    }
  }, [eventStore])
  
  // 削除済みイベントを取得
  const trashedEvents = useMemo(() => {
    return events
      .filter(event => event.isDeleted && event.deletedAt)
      .map(event => ({
        ...event,
        startDate: event.startDate || new Date(),
        endDate: event.endDate || new Date(),
        displayStartDate: event.startDate || new Date(),
        displayEndDate: event.endDate || new Date(),
        duration: event.endDate && event.startDate 
          ? (event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60)
          : 60,
        isMultiDay: event.startDate && event.endDate 
          ? event.startDate.toDateString() !== event.endDate.toDateString()
          : false,
        isRecurring: event.isRecurring || false,
        type: event.type || 'event' as any
      }))
  }, [events])
  
  // 30日経過した予定を自動削除
  useEffect(() => {
    const checkAndCleanup = async () => {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const expiredEvents = events.filter(event => 
        event.isDeleted && 
        event.deletedAt && 
        event.deletedAt < thirtyDaysAgo
      )
      
      if (expiredEvents.length > 0) {
        console.log('🧹 Auto-deleting expired events:', expiredEvents.length)
        await Promise.all(expiredEvents.map(event => eventStore.deleteEvent(event.id)))
      }
    }
    
    // 1日1回チェック
    const interval = setInterval(checkAndCleanup, 24 * 60 * 60 * 1000)
    checkAndCleanup() // 初回実行
    
    return () => clearInterval(interval)
  }, [events, eventStore])

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
      onDeleteEvent: handleEventDelete,
      onRestoreEvent: handleEventRestore,
      onEmptyClick: handleEmptyClick,
      onViewChange: handleViewChange,
      onNavigatePrev: () => handleNavigate('prev'),
      onNavigateNext: () => handleNavigate('next'),
      onNavigateToday: () => handleNavigate('today')
    }

    switch (viewType) {
      case 'day':
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

  // 空き時間クリック用のハンドラー
  const handleEmptyClick = useCallback((date: Date, time: string) => {
    openEventPopup({
      dueDate: date,
      status: 'Todo'
    })
    
    setEventDefaultDate(date)
    setEventDefaultTime(time)
    setEventDefaultEndTime(undefined)
    setSelectedEvent(null)
  }, [openEventPopup])

  // 表示される日付の配列を計算
  const displayDates = useMemo(() => {
    return viewDateRange.days
  }, [viewDateRange.days])

  return (
    <DnDProvider>
      <>
        <div className="h-full flex flex-col bg-background">
          
          {/* ビュー固有のコンテンツ */}
          <div className="flex-1 min-h-0 bg-background" style={{ paddingRight: 0, paddingLeft: 0, padding: 0 }}>
            {renderView()}
          </div>
        </div>
      
      {/* AddPopup - useAddPopupフックで管理 */}
      <AddPopup 
        open={isAddPopupOpen} 
        onOpenChange={(open) => {
          if (!open) {
            closePopup()
            setSelectedEvent(null)
            // デフォルト値もクリア
            setEventDefaultDate(undefined)
            setEventDefaultTime(undefined)
            setEventDefaultEndTime(undefined)
          }
        }}
        defaultTab="event"
        editingEvent={selectedEvent}
        defaultDate={eventDefaultDate}
        defaultTime={eventDefaultTime}
        defaultEndTime={eventDefaultEndTime}
      />
      
      {/* 通知表示 */}
      <NotificationDisplay
        notifications={visibleNotifications}
        onDismiss={dismissNotification}
        onClearAll={clearAllNotifications}
      />
      
      {/* ゴミ箱ビュー */}
      {isTrashViewOpen && (
        <TrashView
          onClose={handleTrashClose}
          trashedEvents={trashedEvents}
          onRestore={handleRestore}
          onDeletePermanently={handleDeletePermanently}
        />
      )}
      </>
    </DnDProvider>
  )
}