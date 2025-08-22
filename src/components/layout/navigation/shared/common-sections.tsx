'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Plus, ChevronDown } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { useAddPopup } from '@/hooks/useAddPopup'
import { MiniCalendar } from '@/features/calendar/components/layout/Sidebar/MiniCalendar'
import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { primary, text } from '@/config/theme/colors'
import { body } from '@/config/theme/typography'

interface CommonSidebarSectionsProps {
  collapsed: boolean
}

export function CommonSidebarSections({ collapsed }: CommonSidebarSectionsProps) {
  const { openPopup } = useAddPopup()
  const pathname = usePathname()
  const isCalendarPage = pathname.startsWith('/calendar')
  const calendarNavigation = useCalendarNavigation()
  
  
  if (collapsed) return null

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <div>
        <Button
          onClick={(e) => {
            e.preventDefault()
            openPopup('event')
          }}
          variant="default"
          className={`w-full h-[56px] py-4 px-4 flex items-center justify-between ${primary.DEFAULT} ${primary.hover}`}
        >
          <div className="flex items-center gap-2">
            <Plus className={`size-5 shrink-0 ${primary.text}`} />
            <span className={`truncate ${body.large} ${primary.text}`}>Create</span>
          </div>
          <ChevronDown className={`size-4 shrink-0 ${primary.text}`} />
        </Button>
      </div>

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