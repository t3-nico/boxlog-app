import { 
  startOfDay, 
  endOfDay, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  addWeeks, 
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval, 
  isWithinInterval,
  format 
} from 'date-fns'
import { ja } from 'date-fns/locale'
import type { CalendarViewType, ViewDateRange, Task } from '../types'

/**
 * ビューに応じた期間計算
 */
export function calculateViewDateRange(
  viewType: CalendarViewType,
  baseDate: Date
): ViewDateRange {
  switch (viewType) {
    case 'day':
    case 'split-day':
      return {
        start: startOfDay(baseDate),
        end: endOfDay(baseDate),
        days: [baseDate]
      }
    
    case '3day':
      const centerDate = startOfDay(baseDate)
      const threeDayStart = subDays(centerDate, 1)
      const threeDayEnd = addDays(centerDate, 1)
      return {
        start: threeDayStart,
        end: endOfDay(threeDayEnd),
        days: [
          threeDayStart,
          centerDate,
          threeDayEnd
        ]
      }
    
    case 'week':
      const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }) // 月曜始まり
      const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 })
      return {
        start: weekStart,
        end: weekEnd,
        days: eachDayOfInterval({ start: weekStart, end: weekEnd })
      }
    
    case 'week-no-weekend':
      const weekdayStart = startOfWeek(baseDate, { weekStartsOn: 1 })
      const weekdayEnd = addDays(weekdayStart, 4) // 金曜まで
      return {
        start: weekdayStart,
        end: endOfDay(weekdayEnd),
        days: eachDayOfInterval({ start: weekdayStart, end: weekdayEnd })
      }
    
    case '2week':
      const twoWeekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
      const twoWeekEnd = endOfDay(addDays(twoWeekStart, 13))
      return {
        start: twoWeekStart,
        end: twoWeekEnd,
        days: eachDayOfInterval({ start: twoWeekStart, end: twoWeekEnd })
      }
    
    case 'schedule':
      // スケジュールビューは現在月を中心に3ヶ月分表示
      const scheduleStart = startOfMonth(subMonths(baseDate, 1))
      const scheduleEnd = endOfMonth(addMonths(baseDate, 1))
      return {
        start: scheduleStart,
        end: scheduleEnd,
        days: eachDayOfInterval({ start: scheduleStart, end: scheduleEnd })
      }
    
  }
}

/**
 * ナビゲーション用の日付計算
 */
export function getNextPeriod(
  viewType: CalendarViewType,
  currentDate: Date
): Date {
  switch (viewType) {
    case 'day':
    case 'split-day': return addDays(currentDate, 1)
    case '3day': return addDays(currentDate, 3)
    case 'week':
    case 'week-no-weekend': return addWeeks(currentDate, 1)
    case '2week': return addWeeks(currentDate, 2)
    case 'schedule': return addWeeks(currentDate, 1)
  }
}

export function getPreviousPeriod(
  viewType: CalendarViewType,
  currentDate: Date
): Date {
  switch (viewType) {
    case 'day':
    case 'split-day': return subDays(currentDate, 1)
    case '3day': return subDays(currentDate, 3)
    case 'week':
    case 'week-no-weekend': return subWeeks(currentDate, 1)
    case '2week': return subWeeks(currentDate, 2)
    case 'schedule': return subWeeks(currentDate, 1)
  }
}

/**
 * 期間表示のフォーマット
 */
export function formatDateRange(
  viewType: CalendarViewType,
  currentDate: Date
): string {
  const range = calculateViewDateRange(viewType, currentDate)
  
  switch (viewType) {
    case 'day':
      return format(currentDate, 'yyyy年M月d日(EEE)', { locale: ja })
    
    case 'split-day':
      return format(currentDate, 'yyyy年M月d日(EEE) - 分割表示', { locale: ja })
    
    case '3day':
      return `${format(range.start, 'M月d日(EEE)', { locale: ja })} - ${format(range.end, 'd日(EEE)', { locale: ja })}`
    
    case 'week':
      return `${format(range.start, 'yyyy年M月d日', { locale: ja })} - ${format(range.end, 'd日', { locale: ja })}`
    
    case 'week-no-weekend':
      return `${format(range.start, 'M月d日(EEE)', { locale: ja })} - ${format(range.end, 'd日(EEE)', { locale: ja })}`
    
    case '2week':
      return `${format(range.start, 'M月d日', { locale: ja })} - ${format(range.end, 'd日', { locale: ja })}`
    
    case 'schedule':
      return format(currentDate, 'yyyy年M月', { locale: ja })
    
  }
}

/**
 * タスクのフィルタリング
 */
export function filterTasksForDateRange(
  tasks: Task[],
  dateRange: ViewDateRange
): Task[] {
  return tasks.filter(task => {
    if (!task.planned_start) return false
    const taskDate = new Date(task.planned_start)
    return isWithinInterval(taskDate, { 
      start: dateRange.start, 
      end: dateRange.end 
    })
  })
}

/**
 * ビュータイプの有効性チェック
 */
export function isValidViewType(value: string): value is CalendarViewType {
  return ['day', 'split-day', '3day', 'week', 'week-no-weekend', '2week', 'schedule'].includes(value)
}

/**
 * ビュー名の日本語表示
 */
export function getViewDisplayName(viewType: CalendarViewType): string {
  switch (viewType) {
    case 'day': return '日'
    case 'split-day': return '分割日'
    case '3day': return '3日'
    case 'week': return '週'
    case 'week-no-weekend': return '平日'
    case '2week': return '2週'
    case 'schedule': return 'スケジュール'
  }
}