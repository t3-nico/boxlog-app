'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns'

import { useCreateEventInspector } from '@/components/layout/inspector/hooks/useCreateEventInspector'
import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import type { UpdateEventRequest } from '@/features/events'
import { useEventStore } from '@/features/events'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { getCurrentTimezone } from '@/features/settings/utils/timezone'
import { useTaskStore } from '@/features/tasks/stores/useTaskStore'

import { useCalendarNavigation } from '../contexts/CalendarNavigationContext'

import { useCalendarLayout } from '../hooks/ui/useCalendarLayout'
import { useEventContextActions } from '../hooks/useEventContextActions'
import { useWeekendToggleShortcut } from '../hooks/useWeekendToggleShortcut'
import { calculateViewDateRange } from '../lib/view-helpers'
import { DnDProvider } from '../providers/DnDProvider'

import type { CalendarEvent, CalendarViewProps, CalendarViewType } from '../types/calendar.types'

import { CalendarLayout } from './layout/CalendarLayout'
import { DayView } from './views/DayView'
import { EventContextMenu } from './views/shared/components'
import { ThreeDayView } from './views/ThreeDayView'
import { TwoWeekView } from './views/TwoWeekView'
import { WeekView } from './views/WeekView'

interface CalendarViewExtendedProps extends CalendarViewProps {
  initialViewType?: CalendarViewType
  initialDate?: Date | null
}

export const CalendarController = ({ className, initialViewType = 'day', initialDate }: CalendarViewExtendedProps) => {
  const router = useRouter()
  const calendarNavigation = useCalendarNavigation()

  // Context が利用可能な場合はそれを使用、そうでない場合は useCalendarLayout を使用
  const contextAvailable = calendarNavigation !== null

  // URLを更新する関数（useCalendarLayoutより前に定義）
  const updateURL = useCallback(
    (newViewType: CalendarViewType, newDate?: Date) => {
      const dateToUse = newDate || new Date()
      const dateString = format(dateToUse, 'yyyy-MM-dd')
      const newURL = `/calendar/${newViewType}?date=${dateString}`
      console.log('🔗 updateURL called:', { newViewType, dateToUse, newURL })
      router.push(newURL)
    },
    [router]
  )

  // カレンダーレイアウト状態管理（Context が利用できない場合のフォールバック）
  const layoutHook = useCalendarLayout({
    initialViewType,
    initialDate: initialDate || new Date(),
    onViewChange: contextAvailable ? () => {} : (view) => updateURL(view, currentDate),
    onDateChange: contextAvailable ? () => {} : (date) => updateURL(viewType, date),
  })

  // Context が利用可能な場合はそれを使用、そうでない場合は layoutHook を使用
  const viewType = contextAvailable ? calendarNavigation.viewType : layoutHook.viewType
  const currentDate = contextAvailable ? calendarNavigation.currentDate : layoutHook.currentDate
  const navigateRelative = contextAvailable ? calendarNavigation.navigateRelative : layoutHook.navigateRelative
  const changeView = contextAvailable ? calendarNavigation.changeView : layoutHook.changeView
  const navigateToDate = contextAvailable ? calendarNavigation.navigateToDate : layoutHook.navigateToDate

  // デバッグ用ログ
  React.useEffect(() => {
    console.log('📊 CalendarController state:', {
      contextAvailable,
      viewType,
      currentDate,
      initialDate,
    })
  }, [contextAvailable, viewType, currentDate, initialDate])

  // コンテキストメニュー状態
  const [contextMenuEvent, setContextMenuEvent] = useState<CalendarEvent | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)

  // イベントコンテキストアクション
  const { handleDeleteEvent, handleEditEvent, handleDuplicateEvent, handleViewDetails } = useEventContextActions()

  const { timezone, showWeekends, updateSettings } = useCalendarSettingsStore()

  // キーボードショートカット（Cmd/Ctrl + W）
  useWeekendToggleShortcut()
  const taskStore = useTaskStore()
  const { getTasksForDateRange } = taskStore

  const eventStore = useEventStore()
  const { events } = eventStore

  // デバッグ: イベントストアの状態を確認
  console.log('🔍 EventStore状態確認:', {
    eventsCount: events.length,
    events: events.slice(0, 3).map((e) => ({
      id: e.id,
      title: e.title,
      startDate: e.startDate?.toISOString?.(),
      endDate: e.endDate?.toISOString?.(),
      isDeleted: e.isDeleted,
    })),
  })

  const { openCreateInspector } = useCreateEventInspector()
  const { setSelectedEvent, setActiveContent, setInspectorOpen } = useInspectorStore()

  // 通知機能の統合
  const {
    permission: notificationPermission,
    hasRequested: hasRequestedNotification,
    requestPermission: requestNotificationPermission,
  } = useNotifications({
    events,
    onReminderTriggered: () => {
      // Reminder triggered for event
    },
  })

  // 🚀 初回ロード時にイベントストアを初期化（マウント時のみ）
  useEffect(() => {
    console.log('🚀 Initializing EventStore...')
    // マウント時のみ実行される初期化処理は不要
    // useEventStoreはすでにlocalStorageから初期化されている
  }, [])

  // 通知許可のリクエスト（初回のみ）
  useEffect(() => {
    if (!hasRequestedNotification && (notificationPermission as string) === 'default') {
      requestNotificationPermission()
    }
  }, [hasRequestedNotification, notificationPermission, requestNotificationPermission])

  // week-no-weekendでアクセスされた場合の処理
  useEffect(() => {
    if (viewType === 'week-no-weekend') {
      console.log('📅 week-no-weekend detected, setting showWeekends=false')
      updateSettings({ showWeekends: false })
    }
  }, [viewType, updateSettings])

  // URLパラメータの日付変更を検知（Context利用時は無効にする）
  useEffect(() => {
    if (!contextAvailable && initialDate && initialDate.getTime() !== currentDate.getTime()) {
      console.log('🔄 URL date change detected (fallback mode):', { initialDate, currentDate })
      navigateToDate(initialDate)
    }
  }, [contextAvailable, initialDate, currentDate, navigateToDate])

  // タイムゾーン設定の初期化（マウント時のみ）
  useEffect(() => {
    if (timezone === 'Asia/Tokyo') {
      // デフォルト値の場合のみ実際のタイムゾーンに更新
      const actualTimezone = getCurrentTimezone()
      if (actualTimezone !== 'Asia/Tokyo') {
        updateSettings({ timezone: actualTimezone })
      }
    }
  }, [timezone, updateSettings])

  // ビューに応じた期間計算
  const viewDateRange = useMemo(() => {
    const dateRange = calculateViewDateRange(viewType, currentDate)

    // TwoWeekView診断ログ
    if (viewType === '2week') {
      console.log('[CalendarController] 2week範囲計算:', {
        viewType,
        currentDate: currentDate.toDateString(),
        calculatedRange: {
          start: dateRange.start.toDateString(),
          end: dateRange.end.toDateString(),
          dayCount: dateRange.days.length,
        },
      })
    }

    return dateRange
  }, [viewType, currentDate])

  // 表示範囲のタスクを取得
  const filteredTasks = useMemo(() => {
    return getTasksForDateRange(viewDateRange.start, viewDateRange.end)
  }, [getTasksForDateRange, viewDateRange.start, viewDateRange.end])

  // 表示範囲のイベントを取得してCalendarEvent型に変換（削除済みを除外）
  const filteredEvents = useMemo(() => {
    // サーバーサイドでは空配列を返してhydrationエラーを防ぐ
    if (typeof window === 'undefined') {
      return []
    }

    // 日付範囲を年月日のみで比較するため、時刻をリセット
    const startDateOnly = new Date(
      viewDateRange.start.getFullYear(),
      viewDateRange.start.getMonth(),
      viewDateRange.start.getDate()
    )
    const endDateOnly = new Date(
      viewDateRange.end.getFullYear(),
      viewDateRange.end.getMonth(),
      viewDateRange.end.getDate()
    )

    // 全ビューでデバッグログを追加
    console.log(`🔧 ${viewType} FilteredEvents Debug:`, {
      viewType,
      totalEvents: events.length,
      dateRange: { start: viewDateRange.start.toDateString(), end: viewDateRange.end.toDateString() },
      startDateOnly: startDateOnly.toDateString(),
      endDateOnly: endDateOnly.toDateString(),
    })

    const filteredByRange = events.filter((event) => {
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

      return (
        (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
        (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
        (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
      )
    })

    // 全ビューでフィルタリング結果のログを出力
    console.log(`[CalendarController] ${viewType}イベントフィルタリング:`, {
      totalEvents: events.length,
      filteredCount: filteredByRange.length,
      dateRange: {
        start: startDateOnly.toDateString(),
        end: endDateOnly.toDateString(),
      },
      sampleEvents: filteredByRange.slice(0, 3).map((e) => ({
        title: e.title,
        startDate: e.startDate?.toDateString?.() || e.startDate,
        originalStartDate: e.startDate instanceof Date ? e.startDate.toISOString() : e.startDate,
      })),
    })

    // Event[]をCalendarEvent[]に変換（安全な日付処理）
    const calendarEvents = filteredByRange.map((event) => {
      // startDate を安全にDateオブジェクトに変換
      const startDate = event.startDate
        ? event.startDate instanceof Date
          ? event.startDate
          : new Date(event.startDate)
        : new Date()

      // endDate を安全にDateオブジェクトに変換
      const endDate = event.endDate
        ? event.endDate instanceof Date
          ? event.endDate
          : new Date(event.endDate)
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
        duration:
          event.endDate && event.startDate
            ? (validEndDate.getTime() - validStartDate.getTime()) / (1000 * 60) // minutes
            : 60, // default 1 hour
        isMultiDay:
          event.startDate && event.endDate ? validStartDate.toDateString() !== validEndDate.toDateString() : false,
        isRecurring: event.isRecurring || false,
        type: event.type || 'event',
      }
    })

    if (viewType === '2week') {
      console.log('🔧 TwoWeekView Filtered Result:', {
        filteredEventsCount: calendarEvents.length,
        sampleEvents: calendarEvents.slice(0, 3).map((e) => ({
          id: e.id,
          title: e.title,
          startDate: e.startDate.toISOString(),
        })),
      })
    }

    return calendarEvents
  }, [events, viewDateRange.start, viewDateRange.end, viewType])

  // タスククリックハンドラー
  const handleTaskClick = useCallback(() => {
    // Task click functionality removed - not used in current implementation
  }, [])

  // イベント関連のハンドラー
  const handleEventClick = useCallback(
    (event: CalendarEvent) => {
      // イベント詳細表示モードでInspectorを開く
      setSelectedEvent(event)
      setActiveContent('event')
      setInspectorOpen(true)
    },
    [setSelectedEvent, setActiveContent, setInspectorOpen]
  )

  // イベントの右クリックハンドラー
  const handleEventContextMenu = useCallback((event: CalendarEvent, mouseEvent: React.MouseEvent) => {
    setContextMenuEvent(event)
    setContextMenuPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY })
  }, [])

  // コンテキストメニューを閉じる
  const handleCloseContextMenu = useCallback(() => {
    setContextMenuEvent(null)
    setContextMenuPosition(null)
  }, [])

  const handleCreateEvent = useCallback(
    (date?: Date, time?: string) => {
      console.log('➕ Create event requested:', {
        date: date?.toISOString(),
        dateString: date?.toDateString(),
        time,
        currentDate: currentDate.toISOString(),
        viewType,
      })

      // 時刻の解析
      let startTime: Date | undefined
      let endTime: Date | undefined

      if (date) {
        if (time) {
          if (time.includes('-')) {
            const [start, end] = time.split('-')
            const [startHour, startMin] = start.split(':').map(Number)
            const [endHour, endMin] = end.split(':').map(Number)

            startTime = new Date(date)
            startTime.setHours(startHour, startMin, 0, 0)

            endTime = new Date(date)
            endTime.setHours(endHour, endMin, 0, 0)
          } else {
            const [hour, min] = time.split(':').map(Number)
            startTime = new Date(date)
            startTime.setHours(hour, min, 0, 0)

            endTime = new Date(date)
            endTime.setHours(hour + 1, min, 0, 0) // デフォルト1時間
          }
        } else {
          startTime = new Date(date)
          startTime.setHours(9, 0, 0, 0) // デフォルト9:00

          endTime = new Date(date)
          endTime.setHours(10, 0, 0, 0) // デフォルト10:00
        }
      }

      // CreateEventInspectorを新規作成モードで開く
      openCreateInspector({
        initialData: {
          startDate: startTime,
          endDate: endTime,
          type: 'event',
          status: 'planned',
          priority: 'necessary',
        },
        context: {
          source: 'calendar',
          date,
          viewType,
        },
      })
    },
    [openCreateInspector, viewType, currentDate]
  )

  const handleEventDelete = useCallback(
    async (eventId: string) => {
      try {
        // 論理削除（ソフトデリート）を使用
        const eventToDelete = eventStore.events.find((e) => e.id === eventId)
        if (eventToDelete) {
          await eventStore.softDeleteEvent(eventId)
        }
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    },
    [eventStore]
  )

  const handleEventRestore = useCallback(
    async (event: CalendarEvent) => {
      try {
        await eventStore.restoreEvent(event.id)
        console.log('✅ Event restored:', event.id, event.title)
      } catch (error) {
        console.error('Failed to restore event:', error)
      }
    },
    [eventStore]
  )

  // 30日経過した予定を自動削除
  useEffect(() => {
    const checkAndCleanup = async () => {
      try {
        await eventStore.clearTrash()
        console.log('✅ Old trash cleaned up automatically')
      } catch (error) {
        console.error('❌ Failed to clean up old trash:', error)
      }
    }

    // 1日1回チェック
    const interval = setInterval(checkAndCleanup, 24 * 60 * 60 * 1000)
    checkAndCleanup() // 初回実行

    return () => clearInterval(interval)
  }, [eventStore])

  // イベント更新ハンドラー（ドラッグ&ドロップ用）
  // 新規作成後の一時的なクリック無効化
  const [_recentlyCreated, _setRecentlyCreated] = useState(false)

  const handleUpdateEvent = useCallback(
    async (eventIdOrEvent: string | CalendarEvent, updates?: { startTime: Date; endTime: Date }) => {
      try {
        // ドラッグ&ドロップからの呼び出し（eventId + updates形式）
        if (typeof eventIdOrEvent === 'string' && updates) {
          const eventId = eventIdOrEvent
          const event = events.find((e) => e.id === eventId)
          if (!event) {
            console.error('❌ Event not found for update:', eventId)
            return
          }

          console.log('🔧 イベント更新:', {
            eventId,
            oldStartDate: event.startDate?.toISOString?.(),
            newStartTime: updates.startTime.toISOString(),
            newEndTime: updates.endTime.toISOString(),
          })

          const updateRequest: UpdateEventRequest = {
            id: eventId,
            title: event.title,
            startDate: updates.startTime,
            endDate: updates.endTime,
            location: event.location,
            description: event.description,
            color: event.color,
          }

          await eventStore.updateEvent(updateRequest)
        }
        // 従来の呼び出し（CalendarEventオブジェクト形式）
        else if (typeof eventIdOrEvent === 'object') {
          const updatedEvent = eventIdOrEvent
          const updateRequest: UpdateEventRequest = {
            id: updatedEvent.id,
            title: updatedEvent.title,
            startDate: updatedEvent.startDate,
            endDate: updatedEvent.endDate,
            location: updatedEvent.location,
            description: updatedEvent.description,
            color: updatedEvent.color,
          }

          await eventStore.updateEvent(updateRequest)
        }
      } catch (error) {
        console.error('❌ Failed to update event:', error)
      }
    },
    [eventStore, events]
  )

  // 土日をスキップする日付計算ユーティリティ
  const skipWeekendsForDay = (startDate: Date, direction: 'prev' | 'next') => {
    const multiplier = direction === 'next' ? 1 : -1
    const newDate = new Date(startDate)

    do {
      newDate.setDate(newDate.getDate() + multiplier)
      console.log('📅 Checking date:', newDate.toDateString(), 'dayOfWeek:', newDate.getDay())
    } while (newDate.getDay() === 0 || newDate.getDay() === 6)

    return newDate
  }

  const skipWeekendsFor3Day = (startDate: Date, direction: 'prev' | 'next') => {
    const multiplier = direction === 'next' ? 1 : -1
    const newDate = new Date(startDate)
    let daysToMove = 0
    const targetDays = 3

    while (daysToMove < targetDays) {
      newDate.setDate(newDate.getDate() + multiplier)
      const dayOfWeek = newDate.getDay()

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysToMove++
      }

      console.log(
        '📅 3DayView checking date:',
        newDate.toDateString(),
        'dayOfWeek:',
        dayOfWeek,
        'daysToMove:',
        daysToMove
      )
    }

    // 最終的に平日でない場合は調整
    while (newDate.getDay() === 0 || newDate.getDay() === 6) {
      newDate.setDate(newDate.getDate() + (multiplier > 0 ? 1 : -1))
    }

    return newDate
  }

  const handleTodayWithWeekendSkip = useCallback(() => {
    const today = new Date()
    const todayDayOfWeek = today.getDay()

    if (todayDayOfWeek === 0 || todayDayOfWeek === 6) {
      const adjustedToday = new Date(today)
      if (todayDayOfWeek === 6) {
        adjustedToday.setDate(adjustedToday.getDate() + 2) // 月曜日
      } else if (todayDayOfWeek === 0) {
        adjustedToday.setDate(adjustedToday.getDate() + 1) // 月曜日
      }

      console.log('📅 Today is weekend, adjusting to Monday:', adjustedToday.toDateString())
      navigateToDate(adjustedToday)
      return true
    }

    return false
  }, [navigateToDate])

  const handleWeekendSkipNavigation = useCallback(
    (direction: 'prev' | 'next') => {
      let newDate: Date

      if (viewType === 'day') {
        newDate = skipWeekendsForDay(currentDate, direction)
      } else if (viewType === '3day') {
        newDate = skipWeekendsFor3Day(currentDate, direction)
      } else {
        return false
      }

      console.log('📅 Weekend skip navigation:', {
        viewType,
        from: currentDate.toDateString(),
        to: newDate.toDateString(),
        direction,
      })

      navigateToDate(newDate)
      return true
    },
    [viewType, currentDate, navigateToDate]
  )

  // Navigation handlers using useCalendarLayout
  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      console.log(
        '🧭 handleNavigate called:',
        direction,
        'current date:',
        currentDate,
        'viewType:',
        viewType,
        'showWeekends:',
        showWeekends
      )

      // 特別な処理が必要かチェック
      const needsWeekendSkip = (viewType === 'day' || viewType === '3day') && !showWeekends

      if (!needsWeekendSkip) {
        navigateRelative(direction)
        return
      }

      // 週末スキップ処理
      if (direction === 'today') {
        if (handleTodayWithWeekendSkip()) {
          return
        }
        navigateRelative(direction)
        return
      }

      // prev/nextの週末スキップ処理
      if (handleWeekendSkipNavigation(direction)) {
        return
      }

      // フォールバックとして通常処理
      navigateRelative(direction)
    },
    [navigateRelative, currentDate, viewType, showWeekends, handleTodayWithWeekendSkip, handleWeekendSkipNavigation]
  )

  const handleViewChange = useCallback(
    (newView: CalendarViewType) => {
      if (newView === 'week-no-weekend') {
        updateSettings({ showWeekends: false })
        newView = 'week'
      }

      changeView(newView)
    },
    [changeView, updateSettings]
  )

  // Navigation callback handlers
  const handleNavigatePrev = useCallback(() => handleNavigate('prev'), [handleNavigate])
  const handleNavigateNext = useCallback(() => handleNavigate('next'), [handleNavigate])
  const handleNavigateToday = useCallback(() => handleNavigate('today'), [handleNavigate])

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
            // 週末なし表示: showWeekendsをOFFにしてweekビューを使用
            updateSettings({ showWeekends: false })
            handleViewChange('week')
            break
          case '14':
            e.preventDefault()
            handleViewChange('2week')
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [viewType, handleNavigate, handleViewChange, updateSettings])

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
      onEventContextMenu: handleEventContextMenu,
      onCreateEvent: handleCreateEvent,
      onUpdateEvent: handleUpdateEvent,
      onDeleteEvent: handleEventDelete,
      onRestoreEvent: handleEventRestore,
      onEmptyClick: handleEmptyClick,
      onTimeRangeSelect: handleDateTimeRangeSelect,
      onViewChange: handleViewChange,
      onNavigatePrev: handleNavigatePrev,
      onNavigateNext: handleNavigateNext,
      onNavigateToday: handleNavigateToday,
    }

    switch (viewType) {
      case 'day':
        return <DayView {...commonProps} showWeekends={showWeekends} />
      case 'split-day':
        // Split-day view is currently not available, fallback to day view
        return <DayView {...commonProps} />
      case '3day':
        // 3DayViewに週末表示設定を渡す
        return <ThreeDayView {...commonProps} showWeekends={showWeekends} />
      case 'week':
        return <WeekView {...commonProps} showWeekends={showWeekends} />
      case 'week-no-weekend':
        // 後方互換性のため残す（設定より優先）
        return <WeekView {...commonProps} showWeekends={false} />
      case '2week':
        return <TwoWeekView {...commonProps} showWeekends={showWeekends} />
      case 'month':
        // MonthViewはまだ実装されていないため、TwoWeekViewを使用
        return <TwoWeekView {...commonProps} />
      default:
        return <DayView {...commonProps} />
    }
  }

  // 日付選択ハンドラー
  const handleDateSelect = useCallback(
    (date: Date) => {
      // 週末表示がOFFで、かつ選択された日付が週末の場合
      if (!showWeekends) {
        const dayOfWeek = date.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // 日曜日または土曜日
          const adjustedDate = new Date(date)

          // 土曜日の場合は翌月曜日に、日曜日の場合も翌月曜日に調整
          if (dayOfWeek === 6) {
            // 土曜日
            adjustedDate.setDate(adjustedDate.getDate() + 2) // 月曜日
          } else if (dayOfWeek === 0) {
            // 日曜日
            adjustedDate.setDate(adjustedDate.getDate() + 1) // 月曜日
          }

          console.log('📅 Weekend date selected, adjusting:', {
            original: date.toDateString(),
            adjusted: adjustedDate.toDateString(),
          })

          navigateToDate(adjustedDate)
          return
        }
      }

      navigateToDate(date)
    },
    [navigateToDate, showWeekends]
  )

  // タスク作成ハンドラー
  const handleCreateTask = useCallback(
    (taskData: {
      title: string
      planned_start: Date
      planned_duration: number
      status: 'pending' | 'in_progress' | 'completed'
      priority: 'low' | 'medium' | 'high'
      description?: string
      tags?: string[]
    }) => {
      taskStore.createTask(taskData)
    },
    [taskStore]
  )

  // 記録作成ハンドラー
  const handleCreateRecord = useCallback(
    (_recordData: {
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
      // Record creation tracked in Issue #89
      // ここで Supabase やローカルストレージに記録を保存
    },
    []
  )

  // 空き時間クリック用のハンドラー
  const handleEmptyClick = useCallback(
    (date: Date, time: string) => {
      console.log('🖱️ Empty time clicked:', { date, time })
      handleCreateEvent(date, time)
    },
    [handleCreateEvent]
  )

  // ドラッグ選択ハンドラー
  const _handleTimeRangeSelect = useCallback(
    (selection: { startHour: number; startMinute: number; endHour: number; endMinute: number }) => {
      console.log('🎯 Time range selected (DayView):', selection)

      // 現在の日付に時間を設定
      const today = currentDate
      const startTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        selection.startHour,
        selection.startMinute
      )
      const endTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        selection.endHour,
        selection.endMinute
      )

      // CreateEventInspectorを開く
      openCreateInspector({
        initialData: {
          startDate: startTime,
          endDate: endTime,
          type: 'event',
          status: 'planned',
          priority: 'necessary',
        },
        context: {
          source: 'calendar',
          date: today,
          viewType,
        },
      })
    },
    [currentDate, openCreateInspector, viewType]
  )

  // 統一された時間範囲選択ハンドラー（全ビュー共通）
  const handleDateTimeRangeSelect = useCallback(
    (selection: { date: Date; startHour: number; startMinute: number; endHour: number; endMinute: number }) => {
      // 指定された日付に時間を設定
      const startTime = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.startHour,
        selection.startMinute
      )
      const endTime = new Date(
        selection.date.getFullYear(),
        selection.date.getMonth(),
        selection.date.getDate(),
        selection.endHour,
        selection.endMinute
      )

      console.log('🟨 モーダルに渡すデータ:')
      console.log('選択:', selection)
      console.log('開始時間:', startTime.toLocaleTimeString())
      console.log('終了時間:', endTime.toLocaleTimeString())
      console.log('openCreateModalに渡すデータ:', {
        startDate: startTime,
        endDate: endTime,
      })

      // CreateEventInspectorを開く
      openCreateInspector({
        initialData: {
          startDate: startTime,
          endDate: endTime,
          type: 'event',
          status: 'planned',
          priority: 'necessary',
        },
        context: {
          source: 'calendar',
          date: selection.date,
          viewType,
        },
      })
    },
    [openCreateInspector, viewType]
  )

  // 表示される日付の配列を計算
  const _displayDates = useMemo(() => {
    return viewDateRange.days
  }, [viewDateRange.days])

  return (
    <DnDProvider>
      <CalendarLayout
        className={className}
        // Header props
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onViewChange={handleViewChange}
        showHeaderActions={false}
        // Calendar integration props
        selectedDate={currentDate}
        onDateSelect={handleDateSelect}
        onCreateEvent={handleCreateEvent}
        onGoToToday={handleNavigateToday}
        // Display options
        showMiniCalendar={true}
        showCalendarList={false} // まだカレンダーリストはないので無効
        showTagFilter={false} // まだタグフィルターはないので無効
        showQuickActions={true}
      >
        {/* ビュー固有のコンテンツ */}
        <div className="flex-1 overflow-hidden">{renderView()}</div>
      </CalendarLayout>

      {/* イベントコンテキストメニュー */}
      {contextMenuEvent && contextMenuPosition ? <EventContextMenu
          event={contextMenuEvent}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onDuplicate={handleDuplicateEvent}
          onViewDetails={handleViewDetails}
        /> : null}
    </DnDProvider>
  )
}
