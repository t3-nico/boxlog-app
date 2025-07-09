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
}

export function CalendarLayout({
  children,
  viewType,
  currentDate,
  onNavigate,
  onViewChange
}: CalendarLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <CalendarHeader
        viewType={viewType}
        currentDate={currentDate}
        onNavigate={onNavigate}
        onViewChange={onViewChange}
      />
      
      {/* メインコンテンツ */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}