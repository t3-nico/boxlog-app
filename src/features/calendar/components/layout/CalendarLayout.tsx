'use client'

import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { CalendarViewType } from '../../types/calendar.types'

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
}

/**
 * カレンダー最上位レイアウトコンポーネント
 * ヘッダーとメインコンテンツを管理
 */
export const CalendarLayout = memo<CalendarLayoutProps>(({
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
  selectedDate,
  onDateSelect
}) => {

  return (
    <div className={cn(
      'calendar-layout flex flex-col h-full bg-background',
      className
    )}>
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
      />

      {/* メインコンテンツ */}
      <main 
        data-calendar-main 
        className="flex-1 flex flex-col min-h-0 min-w-0 bg-background"
      >
        {children}
      </main>
    </div>
  )
})

CalendarLayout.displayName = 'CalendarLayout'