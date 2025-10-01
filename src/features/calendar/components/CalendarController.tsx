'use client'

import React, { useCallback, useEffect, useMemo, Suspense } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns'

import { useCreateEventInspector } from '@/components/layout/inspector/hooks/useCreateEventInspector'
import { useInspectorStore } from '@/components/layout/inspector/stores/inspector.store'
import { useEventStore } from '@/features/events'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { getCurrentTimezone } from '@/features/settings/utils/timezone'
import { useTaskStore } from '@/features/tasks/stores/useTaskStore'
import { logger } from '@/lib/logger'

import { useCalendarNavigation } from '../contexts/CalendarNavigationContext'

import { useCalendarContextMenu } from '../hooks/useCalendarContextMenu'
import { useCalendarKeyboard } from '../hooks/useCalendarKeyboard'
import { useEventOperations } from '../hooks/useEventOperations'
import { useCalendarLayout } from '../hooks/ui/useCalendarLayout'
import { useEventContextActions } from '../hooks/useEventContextActions'
import { useWeekendNavigation } from '../hooks/useWeekendNavigation'
import { useWeekendToggleShortcut } from '../hooks/useWeekendToggleShortcut'
import { calculateViewDateRange } from '../lib/view-helpers'
import { DnDProvider } from '../providers/DnDProvider'

import type { CalendarEvent, CalendarViewProps, CalendarViewType } from '../types/calendar.types'

import { CalendarLayout } from './layout/CalendarLayout'
import { EventContextMenu } from './views/shared/components'

// 遅延ロード: カレンダービューコンポーネントは大きいため、使用時のみロード
const DayView = React.lazy(() =>
  import('./views/DayView').then((module) => ({ default: module.DayView }))
)
const WeekView = React.lazy(() =>
  import('./views/WeekView').then((module) => ({ default: module.WeekView }))
)
const ThreeDayView = React.lazy(() =>
  import('./views/ThreeDayView').then((module) => ({ default: module.ThreeDayView }))
)
const TwoWeekView = React.lazy(() =>
  import('./views/TwoWeekView').then((module) => ({ default: module.TwoWeekView }))
)

// ローディングフォールバック
const CalendarViewSkeleton = () => (
  <div className="h-full w-full animate-pulse">
    <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded mb-4" />
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 21 }).map((_, i) => (
        <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
      ))}
    </div>
  </div>
)

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
      logger.log('🔗 updateURL called:', { newViewType, dateToUse, newURL })
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
    logger.log('📊 CalendarController state:', {
      contextAvailable,
      viewType,
      currentDate,
      initialDate,
    })
  }, [contextAvailable, viewType, currentDate, initialDate])

  // コンテキストメニュー管理（フック化）
  const { contextMenuEvent, contextMenuPosition, handleEventContextMenu, handleCloseContextMenu } =
    useCalendarContextMenu()

  // イベントコンテキストアクション
  const { handleDeleteEvent, handleEditEvent, handleDuplicateEvent, handleViewDetails } = useEventContextActions()

  // イベント操作（CRUD）をフック化
  const { handleEventDelete: deleteEvent, handleEventRestore, handleUpdateEvent } = useEventOperations()

  const { timezone, showWeekends, updateSettings } = useCalendarSettingsStore()

  // キーボードショートカット（Cmd/Ctrl + W）
  useWeekendToggleShortcut()
  const taskStore = useTaskStore()
  const { getTasksForDateRange } = taskStore

  const eventStore = useEventStore()
  const { events } = eventStore

  // デバッグ: イベントストアの状態を確認
  logger.log('🔍 EventStore状態確認:', {
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
    logger.log('🚀 Initializing EventStore...')
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
      logger.log('📅 week-no-weekend detected, setting showWeekends=false')
      updateSettings({ showWeekends: false })
    }
  }, [viewType, updateSettings])

  // URLパラメータの日付変更を検知（Context利用時は無効にする）
  useEffect(() => {
    if (!contextAvailable && initialDate && initialDate.getTime() !== currentDate.getTime()) {
      logger.log('🔄 URL date change detected (fallback mode):', { initialDate, currentDate })
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
      logger.log('[CalendarController] 2week範囲計算:', {
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
    logger.log(`🔧 ${viewType} FilteredEvents Debug:`, {
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
    logger.log(`[CalendarController] ${viewType}イベントフィルタリング:`, {
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
      logger.log('🔧 TwoWeekView Filtered Result:', {
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


  const handleCreateEvent = useCallback(
    (date?: Date, time?: string) => {
      logger.log('➕ Create event requested:', {
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


  // 週末スキップナビゲーション（フック化）
  const { handleTodayWithWeekendSkip, handleWeekendSkipNavigation, adjustWeekendDate } = useWeekendNavigation({
    viewType,
    currentDate,
    showWeekends,
    navigateToDate,
  })

  // Navigation handlers using useCalendarLayout
  const handleNavigate = useCallback(
    (direction: 'prev' | 'next' | 'today') => {
      logger.log(
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

  // キーボードショートカット（フック化）
  const handleToggleWeekends = useCallback(() => {
    updateSettings({ showWeekends: !showWeekends })
  }, [updateSettings, showWeekends])

  useCalendarKeyboard({
    viewType,
    onNavigate: handleNavigate,
    onViewChange: handleViewChange,
    onToggleWeekends: handleToggleWeekends,
  })

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
      onDeleteEvent: deleteEvent,
      onRestoreEvent: handleEventRestore,
      onEmptyClick: handleEmptyClick,
      onTimeRangeSelect: handleDateTimeRangeSelect,
      onViewChange: handleViewChange,
      onNavigatePrev: handleNavigatePrev,
      onNavigateNext: handleNavigateNext,
      onNavigateToday: handleNavigateToday,
    }

    return (
      <Suspense fallback={<CalendarViewSkeleton />}>
        {(() => {
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
        })()}
      </Suspense>
    )
  }

  // 日付選択ハンドラー（週末調整フック使用）
  const handleDateSelect = useCallback(
    (date: Date) => {
      const adjustedDate = adjustWeekendDate(date)
      navigateToDate(adjustedDate)
    },
    [navigateToDate, adjustWeekendDate]
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
      logger.log('🖱️ Empty time clicked:', { date, time })
      handleCreateEvent(date, time)
    },
    [handleCreateEvent]
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

      logger.log('🟨 モーダルに渡すデータ:')
      logger.log('選択:', selection)
      logger.log('開始時間:', startTime.toLocaleTimeString())
      logger.log('終了時間:', endTime.toLocaleTimeString())
      logger.log('openCreateModalに渡すデータ:', {
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
