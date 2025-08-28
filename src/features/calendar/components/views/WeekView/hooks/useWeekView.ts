import { useCallback } from 'react'
import { ja } from 'date-fns/locale'
import { 
  useEventsByDate,
  useCurrentPeriod,
  useDateUtilities
} from '../../shared'
import type { 
  UseWeekViewOptions, 
  UseWeekViewReturn 
} from '../WeekView.types'

/**
 * WeekView専用のロジックを管理するフック
 * 
 * @description
 * - 週の7日間の日付生成
 * - イベントを日付ごとにグループ化
 * - 今日の日付判定
 * - 現在時刻へのスクロール機能
 */
export function useWeekView({
  startDate,
  events = [],
  weekStartsOn = 0, // 0: 日曜始まり, 1: 月曜始まり
  onEventUpdate
}: UseWeekViewOptions): UseWeekViewReturn {
  
  // Phase 3統合フック: 週の7日間の日付生成
  const { dates: weekDates } = useDateUtilities({
    referenceDate: startDate,
    viewType: 'week',
    weekStartsOn
  })
  
  // Phase 3統合フック: 現在期間判定とtodayIndex計算
  const { isCurrentPeriod: isCurrentWeek, todayIndex } = useCurrentPeriod({
    dates: weekDates,
    periodType: 'week',
    weekStartsOn
  })
  
  // Phase 3統合フック: イベント日付グループ化（80-90行が1行に！）
  const { eventsByDate } = useEventsByDate({
    dates: weekDates,
    events,
    sortType: 'standard'
  })
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  const scrollToNow = useCallback(() => {
    // ScrollableCalendarLayoutが処理するため、ここでは何もしない
  }, [])
  
  return {
    weekDates,
    eventsByDate,
    todayIndex,
    scrollToNow,
    isCurrentWeek
  }
}