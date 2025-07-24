'use client'

import { CalendarHeader } from './CalendarHeader'
import type { CalendarViewType } from './types'

interface CalendarLayoutProps {
  children: React.ReactNode
  viewType: CalendarViewType
  currentDate: Date
  onNavigate: (direction: 'prev' | 'next' | 'today') => void
  onViewChange: (view: CalendarViewType) => void
  onDateSelect?: (date: Date) => void
  onCreateTask?: () => void
  onCreateEvent?: () => void
}

export function CalendarLayout({
  children,
  viewType,
  currentDate,
  onNavigate,
  onViewChange,
  onCreateEvent
}: CalendarLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
      style={{ overscrollBehavior: 'none' }}
    >
      {/* 固定ヘッダー - flex-shrink-0で縮まないように */}
      <div className="flex-shrink-0" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <CalendarHeader
          viewType={viewType}
          currentDate={currentDate}
          onNavigate={onNavigate}
          onViewChange={onViewChange}
          onCreateEvent={onCreateEvent}
        />
      </div>
      
      {/* スクロール可能なメインコンテンツ */}
      <main 
        className="flex-1 min-h-0 overflow-hidden" 
        style={{ overscrollBehavior: 'none' }}
      >
        {children}
      </main>
    </div>
  )
}