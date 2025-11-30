// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import React, { Suspense, useCallback, useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns'

import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations'
import { useplans } from '@/features/plans/hooks/usePlans'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { getCurrentTimezone } from '@/features/settings/utils/timezone'
import { logger } from '@/lib/logger'

import { useCalendarNavigation } from '../contexts/CalendarNavigationContext'

import { setUserTimezone } from '@/features/settings/utils/timezone'
import { useCalendarLayout } from '../hooks/ui/useCalendarLayout'
import { useCalendarContextMenu } from '../hooks/useCalendarContextMenu'
import { useCalendarKeyboard } from '../hooks/useCalendarKeyboard'
import { usePlanContextActions } from '../hooks/usePlanContextActions'
import { usePlanOperations } from '../hooks/usePlanOperations'
import { useWeekendNavigation } from '../hooks/useWeekendNavigation'
import { useWeekendToggleShortcut } from '../hooks/useWeekendToggleShortcut'
import { calculateViewDateRange } from '../lib/view-helpers'
import { DnDProvider } from '../providers/DnDProvider'
import { plansToCalendarPlans } from '../utils/planDataAdapter'

import type { CalendarPlan, CalendarViewProps, CalendarViewType } from '../types/calendar.types'

import { CalendarLayout } from './layout/CalendarLayout'
import { EventContextMenu } from './views/shared/components'

// 遅延ロード: カレンダービューコンポーネントは大きいため、使用時のみロード
const DayView = React.lazy(() => import('./views/DayView').then((module) => ({ default: module.DayView })))
const WeekView = React.lazy(() => import('./views/WeekView').then((module) => ({ default: module.WeekView })))
const ThreeDayView = React.lazy(() =>
  import('./views/ThreeDayView').then((module) => ({ default: module.ThreeDayView }))
)
const FiveDayView = React.lazy(() => import('./views/FiveDayView').then((module) => ({ default: module.FiveDayView })))

// ローディングフォールバック
const CalendarViewSkeleton = () => (
  <div className="h-full w-full animate-pulse">
    <div className="bg-muted mb-4 h-12 rounded" />
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 21 }).map((_, i) => (
        <div key={i} className="bg-muted h-24 rounded" />
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
  const { openInspector } = usePlanInspectorStore()
  const { createPlan } = usePlanMutations()

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

  // プランコンテキストアクション
  const { handleDeletePlan, handleEditPlan, handleDuplicatePlan, handleViewDetails } = usePlanContextActions()

  // プラン操作（CRUD）をフック化
  const { handlePlanDelete: deletePlan, handlePlanRestore, handleUpdatePlan } = usePlanOperations()

  const { timezone, showWeekends, updateSettings } = useCalendarSettingsStore()

  // キーボードショートカット（Cmd/Ctrl + W）
  useWeekendToggleShortcut()

  // const eventStore = useEventStore()
  // const { events } = eventStore

  // デバッグ: イベントストアの状態を確認
  // logger.log('🔍 EventStore状態確認:', {
  //   eventsCount: events.length,
  //   events: events.slice(0, 3).map((e) => ({
  //     id: e.id,
  //     title: e.title,
  //     startDate: e.startDate?.toISOString?.(),
  //     endDate: e.endDate?.toISOString?.(),
  //     isDeleted: e.isDeleted,
  //   })),
  // })

  // 通知機能の統合
  const {
    permission: notificationPermission,
    hasRequested: hasRequestedNotification,
    requestPermission: requestNotificationPermission,
  } = useNotifications({
    events: [],
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

  // 削除: week-no-weekendは廃止

  // URLパラメータの日付変更を検知（Context利用時は無効にする）
  useEffect(() => {
    if (!contextAvailable && initialDate && initialDate.getTime() !== currentDate.getTime()) {
      logger.log('🔄 URL date change detected (fallback mode):', { initialDate, currentDate })
      navigateToDate(initialDate)
    }
  }, [contextAvailable, initialDate, currentDate, navigateToDate])

  // タイムゾーン設定の初期化（マウント時のみ）
  useEffect(() => {
    // グローバル変数にタイムゾーンを設定
    setUserTimezone(timezone)

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
    return []
  }, [viewDateRange.start, viewDateRange.end])

  // plansを取得（リアルタイム性最適化済み）
  const { data: plansData } = useplans({})

  // 表示範囲のイベントを取得してCalendarPlan型に変換（削除済みを除外）
  const filteredEvents = useMemo(() => {
    // planデータがない場合は空配列を返す
    if (!plansData) {
      return []
    }

    // plan_tags を tags に変換
    const plansWithTags = (
      plansData as unknown as Array<plan & { plan_tags?: Array<{ tag_id: string; tags: unknown }> }>
    ).map((plan) => {
      const tags = plan.plan_tags?.map((tt) => tt.tags).filter(Boolean) ?? []
      const { plan_tags, ...planData } = plan
      return { ...planData, tags } as plan & { tags: unknown[] }
    })

    // start_time/end_timeが設定されているplanのみを抽出
    const plansWithTime = plansWithTags.filter((plan) => {
      return plan.start_time && plan.end_time
    })

    // planをCalendarPlanに変換
    const calendarEvents = plansToCalendarPlans(plansWithTime as plan[])

    // 表示範囲内のイベントのみをフィルタリング
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

    const filtered = calendarEvents.filter((event) => {
      const eventStartDateOnly = new Date(
        event.startDate.getFullYear(),
        event.startDate.getMonth(),
        event.startDate.getDate()
      )
      const eventEndDateOnly = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate())

      return (
        (eventStartDateOnly >= startDateOnly && eventStartDateOnly <= endDateOnly) ||
        (eventEndDateOnly >= startDateOnly && eventEndDateOnly <= endDateOnly) ||
        (eventStartDateOnly <= startDateOnly && eventEndDateOnly >= endDateOnly)
      )
    })

    logger.log(`[CalendarController] plansフィルタリング:`, {
      totalplans: plansData.length,
      plansWithTime: plansWithTime.length,
      filteredCount: filtered.length,
      dateRange: {
        start: startDateOnly.toDateString(),
        end: endDateOnly.toDateString(),
      },
      sampleEvents: filtered.slice(0, 3).map((e) => ({
        title: e.title,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        tags: e.tags,
      })),
    })

    return filtered
  }, [viewDateRange.start, viewDateRange.end, plansData])

  // タスククリックハンドラー
  const handleTaskClick = useCallback(() => {
    // Task click functionality removed - not used in current implementation
  }, [])

  // イベント関連のハンドラー
  const handleEventClick = useCallback(
    (plan: CalendarPlan) => {
      // プランIDでplan Inspectorを開く
      openInspector(event.id)
      logger.log('📋 Opening plan Inspector:', { planId: event.id, title: event.title })
    },
    [openInspector]
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
            const [startHour, startMin] = start?.split(':').map(Number) ?? [9, 0]
            const [endHour, endMin] = end?.split(':').map(Number) ?? [10, 0]

            startTime = new Date(date)
            startTime.setHours(startHour ?? 9, startMin ?? 0, 0, 0)

            endTime = new Date(date)
            endTime.setHours(endHour ?? 10, endMin ?? 0, 0, 0)
          } else {
            const [hour, min] = time.split(':').map(Number)
            startTime = new Date(date)
            startTime.setHours(hour ?? 9, min ?? 0, 0, 0)

            endTime = new Date(date)
            endTime.setHours((hour ?? 9) + 1, min ?? 0, 0, 0) // デフォルト1時間
          }
        } else {
          startTime = new Date(date)
          startTime.setHours(9, 0, 0, 0) // デフォルト9:00

          endTime = new Date(date)
          endTime.setHours(10, 0, 0, 0) // デフォルト10:00
        }
      }

      // CreateEventInspectorを新規作成モードで開く
      // if (startTime && endTime && date) {
      //   openCreateInspector({
      //     initialData: {
      //       startDate: startTime,
      //       endDate: endTime,
      //       type: 'event',
      //       status: 'planned',
      //       priority: 'necessary',
      //     },
      //     context: {
      //       source: 'calendar',
      //       date,
      //       viewType,
      //     },
      //   })
      // }
      console.log('TODO: Plans統合後に実装', { startTime, endTime, date })
    },
    [viewType, currentDate]
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
      changeView(newView)
    },
    [changeView]
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
    // TODO(#389): Task/Event型の統一が必要
    // 現在は複数の型定義が存在し、型互換性がない問題がある
    // @ts-expect-error - Task型とCalendarPlan型の統一が必要
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
      onUpdateEvent: handleUpdatePlan,
      onDeleteEvent: deletePlan,
      onRestoreEvent: handlePlanRestore,
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
            case '3day':
              return <ThreeDayView {...commonProps} showWeekends={showWeekends} />
            case '5day':
              return <FiveDayView {...commonProps} showWeekends={showWeekends} />
            case 'week':
              return <WeekView {...commonProps} showWeekends={showWeekends} />
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
    (_taskData: {
      title: string
      planned_start: Date
      planned_duration: number
      status: 'pending' | 'in_progress' | 'completed'
      priority: 'low' | 'medium' | 'high'
      description?: string
      tags?: string[]
    }) => {
      // noop - Plans統合後に実装予定
    },
    []
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

      logger.log('📅 Calendar Drag Selection:', {
        date: selection.date.toDateString(),
        startTime: startTime.toLocaleTimeString(),
        endTime: endTime.toLocaleTimeString(),
      })

      // プランを作成してからInspectorで編集
      createPlan.mutate(
        {
          title: '新規プラン',
          status: 'backlog',
          due_date: format(selection.date, 'yyyy-MM-dd'),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        },
        {
          onSuccess: (newplan) => {
            // 作成されたプランをInspectorで開く
            openInspector(newplan.id)
            logger.log('✅ Created plan from drag selection:', {
              planId: newplan.id,
              title: newplan.title,
              dueDate: newplan.due_date,
            })
          },
        }
      )

      // CreateEventInspectorを開く
      // openCreateInspector({
      //   initialData: {
      //     startDate: startTime,
      //     endDate: endTime,
      //     type: 'event',
      //     status: 'planned',
      //     priority: 'necessary',
      //   },
      //   context: {
      //     source: 'calendar',
      //     date: selection.date,
      //     viewType,
      //   },
      // })
      console.log('TODO: Plans統合後に実装', { startTime, endTime, selection })
    },
    [createPlan, openInspector]
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
        // Display range for mini calendar highlight
        displayRange={{
          start: viewDateRange.start,
          end: viewDateRange.end,
        }}
      >
        {/* ビュー固有のコンテンツ */}
        {renderView()}
      </CalendarLayout>

      {/* イベントコンテキストメニュー */}
      {contextMenuEvent && contextMenuPosition ? (
        <EventContextMenu
          event={contextMenuEvent}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onDuplicate={handleDuplicatePlan}
          onViewDetails={handleViewDetails}
        />
      ) : null}
    </DnDProvider>
  )
}
