'use client'

import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { CalendarViewType } from '../../types/calendar.types'

import { CalendarNavigationArea } from './CalendarNavigationArea'
import { CalendarHeader } from './Header'

interface CalendarLayoutProps {
  children: React.ReactNode
  className?: string

  // Header props
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void

  // Header actions
  onSettings?: () => void
  onExport?: () => void
  onImport?: () => void
  showHeaderActions?: boolean

  // Date selection for mini calendar
  selectedDate?: Date
  onDateSelect?: (date: Date) => void

  // Display range for mini calendar highlight
  displayRange?: {
    start: Date
    end: Date
  }

  // Navigation area content
  navigationContent?: React.ReactNode
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
          onDateSelect={onDateSelect}
          showMiniCalendar={true}
          displayRange={displayRange}
        />

        {/* ナビゲーションエリア */}
        <CalendarNavigationArea>{navigationContent}</CalendarNavigationArea>

        {/* メインコンテンツ */}
        <main data-calendar-main className="flex min-h-0 flex-1 flex-col overflow-hidden pb-2">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </main>
      </div>
    )
  }
)

CalendarLayout.displayName = 'CalendarLayout'
