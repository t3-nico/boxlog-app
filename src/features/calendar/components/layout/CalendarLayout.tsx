'use client'

import { memo, useCallback } from 'react'

import { MEDIA_QUERIES } from '@/config/ui/breakpoints'
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import type { CalendarViewType } from '../../types/calendar.types'

import { CalendarHeader } from './Header'

export interface CalendarLayoutProps {
  children: React.ReactNode
  className?: string | undefined

  // Header props
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void

  // Header actions
  onSettings?: (() => void) | undefined
  onExport?: (() => void) | undefined
  onImport?: (() => void) | undefined
  showHeaderActions?: boolean | undefined

  // Date selection for mini calendar
  selectedDate?: Date | undefined
  onDateSelect?: ((date: Date) => void) | undefined

  // Display range for mini calendar highlight
  displayRange?:
    | {
        start: Date
        end: Date
      }
    | undefined
}

/**
 * カレンダー最上位レイアウトコンポーネント
 * ヘッダーとメインコンテンツを管理
 * モバイルでは左右スワイプで期間移動が可能
 */
export const CalendarLayout = memo<CalendarLayoutProps>(
  ({
    children,
    className,

    // Header
    viewType,
    currentDate,
    onNavigate,
    onViewChange,
    onSettings,
    onExport,
    onImport,
    showHeaderActions = false,

    // Date selection for mini calendar
    onDateSelect,
    displayRange,
  }) => {
    // タッチデバイスでのみスワイプを有効化
    const isTouchDevice = useMediaQuery(MEDIA_QUERIES.touch)

    // スワイプで前後の期間に移動
    const handleSwipeLeft = useCallback(() => {
      onNavigate('next')
    }, [onNavigate])

    const handleSwipeRight = useCallback(() => {
      onNavigate('prev')
    }, [onNavigate])

    const { handlers, ref } = useSwipeGesture(handleSwipeLeft, handleSwipeRight, {
      threshold: 50,
      touchOnly: true,
      disabled: !isTouchDevice,
    })

    return (
      <div className={cn('calendar-layout bg-background flex h-full flex-col', className)}>
        {/* ヘッダー */}
        <CalendarHeader
          viewType={viewType}
          currentDate={currentDate}
          onNavigate={onNavigate}
          onViewChange={onViewChange}
          onSettings={onSettings}
          onExport={onExport}
          onImport={onImport}
          showActions={showHeaderActions}
          leftSlot={<MobileMenuButton className="md:hidden" />}
          onDateSelect={onDateSelect}
          showMiniCalendar={true}
          displayRange={displayRange}
        />

        {/* メインコンテンツ（スワイプ対応） */}
        <main
          ref={ref as React.RefObject<HTMLElement>}
          data-calendar-main
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          onTouchStart={handlers.onTouchStart}
          onTouchEnd={handlers.onTouchEnd}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </main>
      </div>
    )
  }
)

CalendarLayout.displayName = 'CalendarLayout'
