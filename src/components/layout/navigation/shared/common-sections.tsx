'use client'

import { useMemo } from 'react'

import { usePathname } from 'next/navigation'

import { useCalendarNavigation } from '@/features/calendar/contexts/CalendarNavigationContext'
import { calculateViewDateRange } from '@/features/calendar/lib/view-helpers'
import { useEventStore } from '@/features/events/stores/useEventStore'
interface CommonSidebarSectionsProps {
  collapsed: boolean
}

export const CommonSidebarSections = ({ collapsed }: CommonSidebarSectionsProps) => {
  const pathname = usePathname()
  const _isCalendarPage = pathname.startsWith('/calendar')
  const calendarNavigation = useCalendarNavigation()
  const { events } = useEventStore()

  // イベントがある日付をハイライト用に準備
  const _highlightedDates = useMemo(() => {
    if (!events || events.length === 0) {
      return []
    }

    console.log('🔍 Processing events for highlight:', events.length)

    const uniqueDates = new Set<string>()
    const dates: Date[] = []

    events
      .filter((event) => !event.isDeleted && event.startDate)
      .forEach((event) => {
        const eventDate = event.startDate!
        console.log('📅 Event found:', {
          title: event.title,
          startDate: eventDate instanceof Date ? eventDate.toISOString() : eventDate,
          localDateString: eventDate instanceof Date ? eventDate.toLocaleDateString() : 'Invalid Date',
          getDate: eventDate instanceof Date ? eventDate.getDate() : 'N/A',
          getMonth: eventDate instanceof Date ? eventDate.getMonth() : 'N/A',
          getFullYear: eventDate instanceof Date ? eventDate.getFullYear() : 'N/A',
        })

        // UTCの問題を避けるため、ローカルタイムで日付のみを抽出
        if (!(eventDate instanceof Date)) return

        const year = eventDate.getFullYear()
        const month = eventDate.getMonth()
        const day = eventDate.getDate()

        const dateKey = `${year}-${month}-${day}`

        if (!uniqueDates.has(dateKey)) {
          uniqueDates.add(dateKey)
          // ローカルタイムで正確な日付を作成（時刻は00:00:00）
          const highlightDate = new Date(year, month, day, 0, 0, 0, 0)
          dates.push(highlightDate)
          console.log('✅ Added highlight date:', {
            original: eventDate.toISOString(),
            highlight: highlightDate.toDateString(),
            year,
            month,
            day,
          })
        }
      })

    console.log('📅 Final highlighted dates count:', dates.length)
    return dates
  }, [events])

  // 表示中の期間の日付を計算
  const _displayedPeriodDates = useMemo(() => {
    if (!calendarNavigation) return []

    const { viewType, currentDate } = calendarNavigation
    const viewDateRange = calculateViewDateRange(viewType, currentDate)

    console.log('📅 Calculated displayed period:', {
      viewType,
      currentDate: currentDate.toDateString(),
      periodStart: viewDateRange.start.toDateString(),
      periodEnd: viewDateRange.end.toDateString(),
      daysCount: viewDateRange.days.length,
    })

    return viewDateRange.days
  }, [calendarNavigation])

  if (collapsed) return null

  return null
}
