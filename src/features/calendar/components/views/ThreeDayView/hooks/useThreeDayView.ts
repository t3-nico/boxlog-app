import { useCallback } from 'react'

import { 
  useEventsByDate,
  useCurrentPeriod,
  useDateUtilities
} from '../../shared'
import type { 
  UseThreeDayViewOptions, 
  UseThreeDayViewReturn 
} from '../ThreeDayView.types'

/**
 * ThreeDayView専用のロジックを管理するフック
 * 
 * @description
 * - centerDateの前後1日を含む3日間を生成
 * - [yesterday, today, tomorrow] の配列
 * - モバイル表示に最適化
 * - イベントを日付ごとにグループ化
 */
export function useThreeDayView({
  centerDate,
  events = [],
  onEventUpdate,
  showWeekends = true
}: UseThreeDayViewOptions & { showWeekends?: boolean }): UseThreeDayViewReturn {
  
  // Phase 3統合フック: 3日間の日付を生成（centerDateを中心に前後1日）
  const { dates: threeDayDates } = useDateUtilities({
    referenceDate: centerDate,
    viewType: 'threeday',
    showWeekends
  })
  
  // Phase 3統合フック: 現在期間判定とtodayIndex計算、相対インデックス計算
  const { isCurrentPeriod: isCurrentDay, todayIndex, relativeDayIndex } = useCurrentPeriod({
    dates: threeDayDates,
    periodType: 'threeday'
  })
  
  // 中央の日付のインデックス（常に1）
  const centerIndex = 1
  
  // Phase 3統合フック: イベント日付グループ化（60-80行が1行に！）
  const { eventsByDate } = useEventsByDate({
    dates: threeDayDates,
    events,
    sortType: 'standard'
  })
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  const scrollToNow = useCallback(() => {
    // ScrollableCalendarLayoutが処理するため、ここでは何もしない
  }, [])
  
  return {
    threeDayDates,
    eventsByDate,
    centerIndex,
    todayIndex,
    isCurrentDay,
    scrollToNow
  }
}