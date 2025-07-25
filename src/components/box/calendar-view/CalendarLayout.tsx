'use client'

import type { CalendarViewType } from './types'

interface CalendarLayoutProps {
  children: React.ReactNode
  viewType?: CalendarViewType
  currentDate?: Date
  onNavigate?: (direction: 'prev' | 'next' | 'today') => void
  onViewChange?: (view: CalendarViewType) => void
  onDateSelect?: (date: Date) => void
  onCreateTask?: () => void
  onCreateEvent?: () => void
}

export function CalendarLayout({
  children
}: CalendarLayoutProps) {
  return (
    <div 
      className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" 
      style={{ overscrollBehavior: 'none', paddingRight: 0, paddingLeft: 0, padding: 0 }}
    >
      {children}
    </div>
  )
}