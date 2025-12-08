'use client'

import { memo } from 'react'

import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'
import { cn } from '@/lib/utils'

import type { CalendarViewType } from '../../types/calendar.types'

import { CalendarNavigationArea } from './CalendarNavigationArea'
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

  // Navigation area content
  navigationContent?: React.ReactNode | undefined
}

/**
 * カレンダー最上位レイアウトコンポーネント
 * ヘッダー、ナビゲーションエリア、メインコンテンツを管理
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

    // Navigation area
    navigationContent,
  }) => {
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

        {/* ナビゲーションエリア */}
        <CalendarNavigationArea>{navigationContent}</CalendarNavigationArea>

        {/* メインコンテンツ */}
        <main data-calendar-main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </main>
      </div>
    )
  }
)

CalendarLayout.displayName = 'CalendarLayout'
