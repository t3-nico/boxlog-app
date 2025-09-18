'use client'

import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'

import { CalendarSkeleton } from '@/features/calendar/components/CalendarSkeleton'
import type { CalendarViewType } from '@/features/calendar/types/calendar.types'

// Calendar機能を動的インポート（Bundle size最適化）
const CalendarController = dynamic(
  () => import('@/features/calendar').then((mod) => ({ default: mod.CalendarController })),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false,
  }
)

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
  const validTypes: CalendarViewType[] = ['day', 'split-day', '3day', 'week', 'week-no-weekend', '2week', 'month']

  return validTypes.includes(view as CalendarViewType)
}

const CalendarViewPage = ({ params, searchParams }: CalendarViewPageProps) => {
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

  return <CalendarController initialViewType={view} initialDate={initialDate} />
}

export default CalendarViewPage
