'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useRouter, usePathname } from 'next/navigation'
import { DayView } from './views/day-view'
import { ThreeDayView } from './views/three-day-view'
import { WeekView } from './views/week-view'
import { MonthView } from './views/month-view'
import { AddPopup, useAddPopup } from './add-popup'
import { DnDProvider } from './calendar-grid/dnd/DnDProvider'
import { useRecordsStore } from '@/features/calendar/stores/useRecordsStore'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { getCurrentTimezone } from '@/utils/timezone'
import { useTaskStore } from '@/features/tasks/stores/useTaskStore'
import { useEventStore, initializeEventStore } from '@/features/events'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { NotificationDisplay } from '@/features/notifications/components/notification-display'
import { 
  calculateViewDateRange, 
  getNextPeriod, 
  getPreviousPeriod,
  filterTasksForDateRange
} from '../lib/view-helpers'
import { isValidViewType } from '../lib/calendar-helpers'
import type { CalendarViewType, CalendarViewProps, Task, CalendarEvent } from '../types/calendar.types'
import type { Event, CreateEventRequest, UpdateEventRequest } from '@/features/events'

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
  
  
  
  // AddPopup hook（編集時のみ使用）
  const { isOpen: isAddPopupOpen, openPopup, closePopup, openEventPopup } = useAddPopup()
  
  
  const { createRecordFromTask, fetchRecords } = useRecordsStore()
  const { planRecordMode, timezone, updateSettings } = useCalendarSettingsStore()
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
      // Reminder triggered for event
    }
  })
  
  // LocalStorageからビュータイプを復元
  useEffect(() => {
    const saved = localStorage.getItem('calendar-view-type')
    if (saved && isValidViewType(saved)) {
      setViewType(saved as CalendarViewType)
    }
  }, [])
  
  // 🚀 初回ロード時にローカルストレージからイベントを読み込み
  useEffect(() => {
    initializeEventStore()
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

  // タイムゾーン設定の初期化
  useEffect(() => {
    if (timezone === 'Asia/Tokyo') { // デフォルト値の場合のみ実際のタイムゾーンに更新
      const actualTimezone = getCurrentTimezone()
      if (actualTimezone !== 'Asia/Tokyo') {
        updateSettings({ timezone: actualTimezone })
      }
    }
  }, [timezone, updateSettings])

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
    
    // console.log('🔍 [' + viewType + '] events.length:', events.length)
    // console.log('🔍 [' + viewType + '] dateRange:', { start: viewDateRange.start.toISOString(), end: viewDateRange.end.toISOString() })
    
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
        return false
      }
      
      // startDateをDateオブジェクトに変換（文字列の場合に対応）
      const startDate = event.startDate instanceof Date ? event.startDate : new Date(event.startDate)
      if (isNaN(startDate.getTime())) {
        return false
      }
      
      // イベントの日付も年月日のみで比較
      const eventStartDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      let eventEndDateOnly = eventStartDateOnly
      if (event.endDate) {
        const endDate = event.endDate instanceof Date ? event.endDate : new Date(event.endDate)
        if (!isNaN(endDate.getTime())) {
          eventEndDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
        }
      }
      
      return (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
             (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
             (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
    })
    
    // Event[]をCalendarEvent[]に変換（安全な日付処理）
    const calendarEvents = filteredByRange.map(event => {
      // startDate を安全にDateオブジェクトに変換
      const startDate = event.startDate 
        ? (event.startDate instanceof Date ? event.startDate : new Date(event.startDate))
        : new Date()
      
      // endDate を安全にDateオブジェクトに変換
      const endDate = event.endDate 
        ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate))
        : new Date()
      
      // 無効な日付の場合はデフォルト値を使用
      const validStartDate = isNaN(startDate.getTime()) ? new Date() : startDate
      const validEndDate = isNaN(endDate.getTime()) ? new Date() : endDate
      
      return {
        ...event,
        startDate: validStartDate,
        endDate: validEndDate,
        displayStartDate: validStartDate,
        displayEndDate: validEndDate,
        duration: event.endDate && event.startDate 
          ? (validEndDate.getTime() - validStartDate.getTime()) / (1000 * 60) // minutes
          : 60, // default 1 hour
        isMultiDay: event.startDate && event.endDate 
          ? validStartDate.toDateString() !== validEndDate.toDateString()
          : false,
        isRecurring: event.isRecurring || false,
        type: event.type || 'event' as any
      }
    })
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
    // デバッグ用: タイトルバーを一時的に変更
    const originalTitle = document.title
    document.title = `編集: ${event.title}`
    setTimeout(() => {
      document.title = originalTitle
    }, 2000)
    
    // 編集用にselectedEventを設定
    setSelectedEvent(event as any)
    
    // AddPopupを編集モードで開く
    openEventPopup({
      editingEvent: event
    })
  }, [openEventPopup])
  
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
    } catch (error) {
      console.error('Failed to restore event:', error)
    }
  }, [eventStore])
  
  
  const handleRestore = useCallback(async (eventIds: string[]) => {
    try {
      await Promise.all(eventIds.map(async (eventId) => {
        const eventToRestore = events.find(e => e.id === eventId)
        if (eventToRestore) {
          const updateRequest: UpdateEventRequest = {
            ...eventToRestore,
            isDeleted: false,
            deletedAt: null
          }
          await eventStore.updateEvent(updateRequest)
        }
      }))
    } catch (error) {
      console.error('Failed to restore events:', error)
    }
  }, [events, eventStore])
  
  const handleDeletePermanently = useCallback(async (eventIds: string[]) => {
    try {
      await Promise.all(eventIds.map(id => eventStore.deleteEvent(id)))
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
      
      await eventStore.updateEvent(updateRequest)
      
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
      // onRestoreEvent: handleEventRestore,
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
        contextData={{
          editingEvent: selectedEvent
        }}
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
      </>
    </DnDProvider>
  )
}