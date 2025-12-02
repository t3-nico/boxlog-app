import type { CalendarViewType } from '../types/calendar.types'

/**
 * 有効なビュータイプかどうかを判定
 */
export function isValidViewType(view: string): view is CalendarViewType {
  const validTypes: CalendarViewType[] = ['day', '3day', '5day', 'week', '2week', 'month', 'agenda']

  return validTypes.includes(view as CalendarViewType)
}

/**
 * ビュータイプの表示名を取得
 */
export function getViewDisplayName(viewType: CalendarViewType): string {
  const displayNames: Record<CalendarViewType, string> = {
    day: 'Day',
    '3day': '3 Days',
    '5day': '5 Days',
    week: 'Week',
    '2week': '2 Weeks',
    month: 'Month',
    agenda: 'Agenda',
  }

  return Object.prototype.hasOwnProperty.call(displayNames, viewType) ? displayNames[viewType] : viewType
}

/**
 * デフォルトのビュータイプを取得
 */
export function getDefaultViewType(): CalendarViewType {
  return 'day'
}

/**
 * 次のビュータイプを取得
 */
export function getNextViewType(currentView: CalendarViewType): CalendarViewType {
  const viewOrder: CalendarViewType[] = ['day', '3day', '5day', 'week', '2week', 'month']

  const currentIndex = viewOrder.indexOf(currentView)
  const nextIndex = (currentIndex + 1) % viewOrder.length

  return viewOrder[nextIndex]!
}

/**
 * 前のビュータイプを取得
 */
export function getPrevViewType(currentView: CalendarViewType): CalendarViewType {
  const viewOrder: CalendarViewType[] = ['day', '3day', '5day', 'week']

  const currentIndex = viewOrder.indexOf(currentView)
  const prevIndex = currentIndex === 0 ? viewOrder.length - 1 : currentIndex - 1

  return viewOrder[prevIndex]!
}
