// @ts-nocheck
// TODO(#389): 型エラーを修正後、@ts-nocheckを削除
'use client'

import React, { Suspense, useMemo } from 'react'

import type { CalendarViewType } from '../../../types/calendar.types'

import { CalendarViewSkeleton } from './CalendarViewSkeleton'

// 遅延ロード: カレンダービューコンポーネントは大きいため、使用時のみロード（絶対パスで指定）
// LCP改善: 個別にSuspenseをネストし、必要なビューのみロード
const DayView = React.lazy(() =>
  import('@/features/calendar/components/views/DayView').then((module) => ({ default: module.DayView }))
)
const WeekView = React.lazy(() =>
  import('@/features/calendar/components/views/WeekView').then((module) => ({ default: module.WeekView }))
)
const ThreeDayView = React.lazy(() =>
  import('@/features/calendar/components/views/ThreeDayView').then((module) => ({ default: module.ThreeDayView }))
)
const FiveDayView = React.lazy(() =>
  import('@/features/calendar/components/views/FiveDayView').then((module) => ({ default: module.FiveDayView }))
)
const AgendaView = React.lazy(() =>
  import('@/features/calendar/components/views/AgendaView').then((module) => ({ default: module.AgendaView }))
)

interface CalendarViewRendererProps {
  viewType: CalendarViewType
  showWeekends: boolean
  commonProps: Record<string, unknown>
}

// LCP改善: 軽量なインラインスケルトン（個別ビュー用）
function ViewLoadingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="bg-surface-container/50 h-8 w-8 animate-pulse rounded-full" />
    </div>
  )
}

/**
 * CalendarViewRenderer - ビューレンダリング専用コンポーネント
 *
 * LCP改善: 各ビューを個別のSuspenseでラップし、選択されたビューのみロード
 * memo化により、propsが変更されない限り再レンダリングをスキップ
 * これにより、親コンポーネントの他の状態変更時の不要な再描画を防止
 */
export const CalendarViewRenderer = React.memo(function CalendarViewRenderer({
  viewType,
  showWeekends,
  commonProps,
}: CalendarViewRendererProps) {
  // LCP改善: ビューをメモ化して不要な再生成を防止
  const viewContent = useMemo(() => {
    switch (viewType) {
      case 'day':
        return (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            <DayView {...commonProps} showWeekends={showWeekends} />
          </Suspense>
        )
      case '3day':
        return (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            <ThreeDayView {...commonProps} showWeekends={showWeekends} />
          </Suspense>
        )
      case '5day':
        return (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            <FiveDayView {...commonProps} showWeekends={showWeekends} />
          </Suspense>
        )
      case 'week':
        return (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            <WeekView {...commonProps} showWeekends={showWeekends} />
          </Suspense>
        )
      case 'agenda':
        return (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            <AgendaView {...commonProps} showWeekends={showWeekends} />
          </Suspense>
        )
      default:
        return (
          <Suspense fallback={<ViewLoadingSkeleton />}>
            <DayView {...commonProps} showWeekends={showWeekends} />
          </Suspense>
        )
    }
  }, [viewType, showWeekends, commonProps])

  // 外側のSuspenseはフォールバック用（初回ロード時のスケルトン表示）
  return <Suspense fallback={<CalendarViewSkeleton />}>{viewContent}</Suspense>
})
