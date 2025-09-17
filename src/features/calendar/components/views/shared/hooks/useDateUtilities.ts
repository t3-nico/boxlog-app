/**
 * 日付生成ユーティリティ統一フック
 * 各ビューで重複していた日付配列生成ロジックを統合
 */

import { useMemo } from 'react'

import { addDays, startOfWeek, subDays } from 'date-fns'

export interface UseDateUtilitiesOptions {
  referenceDate: Date
  viewType: 'week' | 'twoweek' | 'threeday' | 'agenda'
  weekStartsOn?: 0 | 1
  showWeekends?: boolean
  agendaDays?: number // AgendaView用の表示日数
}

export interface UseDateUtilitiesReturn {
  dates: Date[]
  startDate: Date
  endDate: Date
  dateCount: number
}

/**
 * ビュー別日付配列生成の統一フック
 * 
 * @description
 * 全てのビューで「完全な日付配列を生成→週末フィルタリング」の統一アプローチを採用
 * これにより週末表示設定に関係なく一貫した動作を保証
 * - WeekView: 週の7日間
 * - TwoWeekView: 2週間14日間 
 * - ThreeDayView: 中央日±1日の3日間
 * - AgendaView: 指定日数分の連続日付
 */
export function useDateUtilities({
  referenceDate,
  viewType,
  weekStartsOn = 0,
  showWeekends = true,
  agendaDays = 30
}: UseDateUtilitiesOptions): UseDateUtilitiesReturn {
  
  const dates = useMemo(() => {
    // Step 1: 各ビューに応じた完全な日付配列を生成
    let fullDates: Date[] = []
    
    switch (viewType) {
      case 'week': {
        // 週の開始日を計算して7日間すべて生成
        const weekStart = startOfWeek(referenceDate, { weekStartsOn })
        fullDates = Array.from({ length: 7 }, (_, index) => 
          addDays(weekStart, index)
        )
        break
      }
      
      case 'twoweek': {
        // 2週間の開始日を計算して14日間すべて生成
        const twoWeekStart = startOfWeek(referenceDate, { weekStartsOn })
        fullDates = Array.from({ length: 14 }, (_, index) => 
          addDays(twoWeekStart, index)
        )
        break
      }
      
      case 'threeday': {
        // 3日間を生成（週末非表示の場合は平日のみで3日間確保）
        if (!showWeekends) {
          // 週末を除外して3日間の平日を取得
          const _weekdayDates: Date[] = []
          let checkDate = referenceDate
          
          // 中央日が週末の場合、次の平日を探す
          while (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
            checkDate = addDays(checkDate, 1)
          }
          
          // 中央日を基準に前後の平日を探す
          // 前の平日を探す
          let prevDate = subDays(checkDate, 1)
          while (prevDate.getDay() === 0 || prevDate.getDay() === 6) {
            prevDate = subDays(prevDate, 1)
          }
          
          // 次の平日を探す
          let nextDate = addDays(checkDate, 1)
          while (nextDate.getDay() === 0 || nextDate.getDay() === 6) {
            nextDate = addDays(nextDate, 1)
          }
          
          fullDates = [prevDate, checkDate, nextDate]
        } else {
          // 週末表示時は単純に前後1日
          fullDates = [
            subDays(referenceDate, 1), // 前日
            referenceDate,             // 当日
            addDays(referenceDate, 1)  // 翌日
          ]
        }
        break
      }
      
      case 'agenda': {
        // referenceDate から指定日数分の連続日付
        fullDates = Array.from({ length: agendaDays }, (_, index) => 
          addDays(referenceDate, index)
        )
        break
      }
      
      default:
        fullDates = [referenceDate]
    }
    
    // Step 2: 週末フィルタリングを統一的に適用
    // threedayビューは既に処理済みなので、他のビューのみフィルタリング
    if (!showWeekends && viewType !== 'threeday') {
      return fullDates.filter(date => {
        const day = date.getDay()
        return day !== 0 && day !== 6 // 日曜(0)、土曜(6)を除外
      })
    }
    
    return fullDates
  }, [referenceDate, viewType, weekStartsOn, showWeekends, agendaDays])
  
  const startDate = useMemo(() => dates[0], [dates])
  const endDate = useMemo(() => dates[dates.length - 1], [dates])
  const dateCount = dates.length
  
  return {
    dates,
    startDate,
    endDate,
    dateCount
  }
}