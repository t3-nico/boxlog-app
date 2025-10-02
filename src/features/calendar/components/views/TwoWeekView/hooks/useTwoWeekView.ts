import { useCallback } from 'react'

import { 
  useEventsByDate,
  useCurrentPeriod,
  useDateUtilities
} from '../../shared'
import type { 
  UseTwoWeekViewOptions, 
  UseTwoWeekViewReturn 
} from '../TwoWeekView.types'

/**
 * TwoWeekView専用のロジックを管理するフック
 * 
 * @description
 * - startDateから連続する14日間を生成
 * - 2週間の予定を俯瞰
 * - 横スクロール対応
 * - デスクトップ向け最適化
 */
export function useTwoWeekView({
  startDate,
  events = [],
  weekStartsOn = 1, // デフォルトは月曜始まり
}: UseTwoWeekViewOptions): UseTwoWeekViewReturn {
  
  // Phase 3統合フック: 2週間（14日間）の日付を生成
  const { dates: twoWeekDates } = useDateUtilities({
    referenceDate: startDate,
    viewType: 'twoweek',
    weekStartsOn // WeekViewと統一
  })
  
  
  // Phase 3統合フック: 現在期間判定とtodayIndex計算、週インデックス計算
  const { isCurrentPeriod: isCurrentTwoWeeks, todayIndex } = useCurrentPeriod({
    dates: twoWeekDates,
    periodType: 'twoweek',
    weekStartsOn // WeekViewと統一
  })
  
  // 今日がある週のインデックス（0: 第1週, 1: 第2週）
  const currentWeekIndex = todayIndex === -1 ? -1 : Math.floor(todayIndex / 7)
  
  
  // Phase 3統合フック: イベント日付グループ化（80-90行が1行に！）
  const { eventsByDate } = useEventsByDate({
    dates: twoWeekDates,
    events,
    sortType: 'standard'
  })
  
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  const scrollToToday = useCallback(() => {
    // ScrollableCalendarLayoutが処理するため、ここでは何もしない
  }, [])
  
  const scrollToNow = useCallback(() => {
    // ScrollableCalendarLayoutが処理するため、ここでは何もしない
  }, [])
  
  return {
    twoWeekDates,
    eventsByDate,
    todayIndex,
    currentWeekIndex,
    isCurrentTwoWeeks,
    scrollToToday,
    scrollToNow
  }
}