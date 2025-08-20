'use client'

import { CalendarController } from '@/features/calendar'
import { redirect } from 'next/navigation'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'

interface CalendarViewPageProps {
  params: {
    view: string
  }
  searchParams: {
    date?: string
  }
}

// 有効なビュータイプかチェック
function isValidViewType(view: string): view is CalendarViewType {
  const validTypes: CalendarViewType[] = [
    'day',
    'split-day', 
    '3day',
    'week',
    'week-no-weekend',
    '2week',
    'month',
    'schedule'
  ]
  
  return validTypes.includes(view as CalendarViewType)
}

export default function CalendarViewPage({ params, searchParams }: CalendarViewPageProps) {
  const { view } = params
  const { date } = searchParams

  // 有効なビュータイプかチェック
  if (!isValidViewType(view)) {
    redirect('/calendar/day')
  }

  // 日付パラメータの解析
  let initialDate: Date | undefined
  if (date) {
    const parsedDate = new Date(date)
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate
    }
  }

  return (
    <CalendarController 
      initialViewType={view}
      initialDate={initialDate}
    />
  )
}