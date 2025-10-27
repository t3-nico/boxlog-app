import type { CalendarViewType } from '../types/calendar.types'

interface CalendarProviderProps {
  initialDate: Date
  initialView: CalendarViewType
}

interface UseCalendarProviderPropsReturn {
  isCalendarPage: boolean
  calendarProviderProps: CalendarProviderProps | null
}

/**
 * カレンダーページ判定とProvider設定を提供するフック
 *
 * @param pathname - 現在のパス
 * @param searchParams - URLSearchParams
 * @returns カレンダーページ判定とProvider設定
 */
export function useCalendarProviderProps(
  pathname: string,
  searchParams: URLSearchParams
): UseCalendarProviderPropsReturn {
  // ロケールプレフィックス対応: /ja/calendar, /en/calendar 等
  const isCalendarPage = pathname.includes('/calendar')

  if (!isCalendarPage) {
    return { isCalendarPage, calendarProviderProps: null }
  }

  const pathSegments = pathname.split('/')
  const view = pathSegments[pathSegments.length - 1] as CalendarViewType
  const dateParam = searchParams.get('date')

  let initialDate: Date | undefined
  if (dateParam) {
    const parsedDate = new Date(dateParam)
    if (!isNaN(parsedDate.getTime())) {
      initialDate = parsedDate
    }
  }

  return {
    isCalendarPage,
    calendarProviderProps: {
      initialDate: initialDate || new Date(),
      initialView: view || ('week' as CalendarViewType),
    },
  }
}
