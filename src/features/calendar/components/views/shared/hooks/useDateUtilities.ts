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
 * 以前は各ビューで異なるロジックで日付配列を生成していたが、これで統一
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
    switch (viewType) {
      case 'week': {
        // 週の開始日を計算
        const weekStart = startOfWeek(referenceDate, { weekStartsOn })
        const weekDates = Array.from({ length: 7 }, (_, index) => 
          addDays(weekStart, index)
        )
        
        // 週末フィルタリング
        if (!showWeekends) {
          return weekDates.filter(date => {
            const day = date.getDay()
            return day !== 0 && day !== 6 // 日曜(0)、土曜(6)を除外
          })
        }
        
        return weekDates
      }
      
      case 'twoweek': {
        // referenceDate を週の開始日として2週間分生成
        const twoWeekStart = startOfWeek(referenceDate, { weekStartsOn })
        const twoWeekDates = Array.from({ length: 14 }, (_, index) => 
          addDays(twoWeekStart, index)
        )
        
        // 週末フィルタリング
        if (!showWeekends) {
          return twoWeekDates.filter(date => {
            const day = date.getDay()
            return day !== 0 && day !== 6
          })
        }
        
        return twoWeekDates
      }
      
      case 'threeday': {
        // 中央日の前後1日を含む3日間
        const threeDayDates = [
          subDays(referenceDate, 1), // 前日
          referenceDate,             // 当日
          addDays(referenceDate, 1)  // 翌日
        ]
        
        // 週末フィルタリング（ThreeDayViewでは通常使わないが一応対応）
        if (!showWeekends) {
          return threeDayDates.filter(date => {
            const day = date.getDay()
            return day !== 0 && day !== 6
          })
        }
        
        return threeDayDates
      }
      
      case 'agenda': {
        // referenceDate から指定日数分の連続日付
        return Array.from({ length: agendaDays }, (_, index) => 
          addDays(referenceDate, index)
        )
      }
      
      default:
        return [referenceDate]
    }
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