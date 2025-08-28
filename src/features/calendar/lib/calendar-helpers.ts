import type { CalendarViewType } from '../types/calendar.types'

/**
 * 有効なビュータイプかどうかを判定
 */
export function isValidViewType(view: string): view is CalendarViewType {
  const validTypes: CalendarViewType[] = [
    'day',
    'split-day', 
    '3day',
    'week',
    'week-no-weekend',
    '2week',
    'month'
  ]
  
  return validTypes.includes(view as CalendarViewType)
}

/**
 * ビュータイプの表示名を取得
 */
export function getViewDisplayName(viewType: CalendarViewType): string {
  const displayNames: Record<CalendarViewType, string> = {
    'day': 'Day',
    'split-day': 'Split Day',
    '3day': '3 Days',
    'week': 'Week',
    'week-no-weekend': 'Weekdays',
    '2week': '2 Weeks',
    'month': 'Month'
  }
  
  return displayNames[viewType] || viewType
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
  const viewOrder: CalendarViewType[] = [
    'day',
    '3day', 
    'week',
    'month'
  ]
  
  const currentIndex = viewOrder.indexOf(currentView)
  const nextIndex = (currentIndex + 1) % viewOrder.length
  
  return viewOrder[nextIndex]
}

/**
 * 前のビュータイプを取得
 */
export function getPrevViewType(currentView: CalendarViewType): CalendarViewType {
  const viewOrder: CalendarViewType[] = [
    'day',
    '3day',
    'week', 
    'month'
  ]
  
  const currentIndex = viewOrder.indexOf(currentView)
  const prevIndex = currentIndex === 0 ? viewOrder.length - 1 : currentIndex - 1
  
  return viewOrder[prevIndex]
}