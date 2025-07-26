'use client'

import { CalendarView } from '@/components/box/calendar-view'
import { redirect } from 'next/navigation'
import { isValidViewType } from '@/components/box/calendar-view/utils/calendar-helpers'

interface CalendarViewPageProps {
  params: {
    view: string
  }
  searchParams: {
    date?: string
  }
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
    <div className="h-full" style={{ padding: '0 !important', margin: '0 !important' }}>
      <CalendarView 
        initialViewType={view as any}
        initialDate={initialDate}
      />
    </div>
  )
}