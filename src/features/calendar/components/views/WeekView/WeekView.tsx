'use client'

import { useMemo } from 'react'

import { isWeekend } from 'date-fns'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'

import { CalendarViewAnimation } from '../../animations/ViewTransition'

import { WeekGrid } from './components/WeekGrid'
import { useWeekView } from './hooks/useWeekView'

import type { WeekViewProps } from './WeekView.types'

/**
 * WeekView - 週表示ビューコンポーネント
 *
 * @description
 * 構成:
 * 1. shared/DateDisplay で7日分の日付表示
 * 2. shared/grid/TimeColumn で時間軸
 * 3. shared/grid/TimeGrid でグリッド
 * 4. 7つの shared/components/DayColumn を横並び
 * 5. shared/components/PlanCard でプラン表示
 * 6. shared/grid/CurrentTimeLine で現在時刻
 *
 * レイアウト:
 * ┌────┬────┬────┬────┬────┬────┬────┬────┐
 * │    │ 17 │ 18 │ 19 │ 20 │ 21 │ 22 │ 23 │
 * │    │ 日 │ 月 │ 火 │ 水 │ 木 │ 金 │ 土 │ ← DateDisplay
 * │    │    │    │    │ ● │    │    │    │ ← 今日マーカー
 * ├────┼────┼────┼────┼────┼────┼────┼────┤
 * │ 9  │    │ PL │    │    │ PL │    │    │
 * │10  │    │    │ PL │    │    │    │    │
 * └────┴────┴────┴────┴────┴────┴────┴────┘
 */
export const WeekView = ({
  dateRange,
  plans,
  allPlans,
  showWeekends = true,
  weekStartsOn: weekStartsOnProp,
  className,
  disabledPlanId,
  onPlanClick,
  onPlanContextMenu,
  onUpdatePlan,
  onEmptyClick,
  onTimeRangeSelect,
}: WeekViewProps) => {
  const { timezone, weekStartsOn: weekStartsOnSetting } = useCalendarSettingsStore()
  // 設定ストアの値を優先、プロップでオーバーライド可能
  const weekStartsOn = weekStartsOnProp ?? weekStartsOnSetting

  // 週の開始日を計算（通常は dateRange.start を使用）
  const weekStartDate = useMemo(() => {
    return dateRange.start
  }, [dateRange.start])

  // WeekView専用ロジック
  const { weekDates, eventsByDate, todayIndex } = useWeekView({
    startDate: weekStartDate,
    events: plans,
    weekStartsOn,
  })

  // 表示する日付を計算（土日を除外するかどうか）
  const displayDates = useMemo(() => {
    return showWeekends ? weekDates : weekDates.filter((day) => !isWeekend(day))
  }, [weekDates, showWeekends])

  // 初期スクロールはScrollableCalendarLayoutに委譲

  return (
    <CalendarViewAnimation viewType="week">
      <WeekGrid
        weekDates={displayDates}
        events={plans}
        allPlans={allPlans}
        eventsByDate={eventsByDate}
        todayIndex={todayIndex}
        timezone={timezone}
        disabledPlanId={disabledPlanId}
        onEventClick={onPlanClick}
        onEventContextMenu={onPlanContextMenu}
        onEmptyClick={(date, time) => {
          onEmptyClick?.(date, time)
        }}
        onEventUpdate={onUpdatePlan}
        onTimeRangeSelect={onTimeRangeSelect}
        className={className}
      />
    </CalendarViewAnimation>
  )
}
