'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { MiniCalendar } from '@/features/calendar/components/layout/Sidebar/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'

interface CommonSidebarSectionsProps {
  collapsed: boolean
}

export function CommonSidebarSections({ collapsed }: CommonSidebarSectionsProps) {
  const pathname = usePathname()
  const isCalendarPage = pathname.startsWith('/calendar')
  const calendarNavigation = useCalendarNavigation()
  
  if (collapsed) return null

  return (
    <div className="space-y-4">
      {/* Calendar Mini Calendar */}
      {isCalendarPage && (
        <div>
          <MiniCalendar
            selectedDate={calendarNavigation?.currentDate || new Date()}
            onDateSelect={(date) => {
              console.log('📅 MiniCalendar date selected:', date)
              if (calendarNavigation) {
                console.log('✅ Navigation available, calling navigateToDate')
                calendarNavigation.navigateToDate(date)
              } else {
                console.log('❌ Navigation not available')
              }
            }}
          />
        </div>
      )}
    </div>
  )
}