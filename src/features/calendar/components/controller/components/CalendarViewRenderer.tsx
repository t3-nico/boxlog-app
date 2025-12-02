// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import React, { Suspense } from 'react'

import type { CalendarViewType } from '../../types/calendar.types'

import { CalendarViewSkeleton } from './CalendarViewSkeleton'

// 遅延ロード: カレンダービューコンポーネントは大きいため、使用時のみロード
const DayView = React.lazy(() => import('../../views/DayView').then((module) => ({ default: module.DayView })))
const WeekView = React.lazy(() => import('../../views/WeekView').then((module) => ({ default: module.WeekView })))
const ThreeDayView = React.lazy(() =>
  import('../../views/ThreeDayView').then((module) => ({ default: module.ThreeDayView }))
)
const FiveDayView = React.lazy(() =>
  import('../../views/FiveDayView').then((module) => ({ default: module.FiveDayView }))
)

interface CalendarViewRendererProps {
  viewType: CalendarViewType
  showWeekends: boolean
  commonProps: Record<string, unknown>
}

/**
 * CalendarViewRenderer - ビューレンダリング専用コンポーネント
 *
 * memo化により、propsが変更されない限り再レンダリングをスキップ
 * これにより、親コンポーネントの他の状態変更時の不要な再描画を防止
 */
export const CalendarViewRenderer = React.memo(function CalendarViewRenderer({
  viewType,
  showWeekends,
  commonProps,
}: CalendarViewRendererProps) {
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
            return <DayView {...commonProps} showWeekends={showWeekends} />
        }
      })()}
    </Suspense>
  )
})
