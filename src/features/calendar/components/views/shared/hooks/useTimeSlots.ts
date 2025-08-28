import { useMemo } from 'react'
import type { TimeSlot } from '../types/grid.types'

const QUARTER_INTERVAL = 15 // 15分間隔

interface UseTimeSlotsOptions {
  startHour?: number // 開始時間（デフォルト: 0）
  endHour?: number   // 終了時間（デフォルト: 24）
  interval?: number  // 間隔（分単位、デフォルト: 15）
}

/**
 * 時間スロット生成フック
 * 全カレンダービューで共通利用可能
 * デフォルト: 0:00-23:45、15分間隔
 */
export function useTimeSlots({
  startHour = 0,
  endHour = 24,
  interval = QUARTER_INTERVAL
}: UseTimeSlotsOptions = {}): TimeSlot[] {
  
  return useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = []
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        slots.push({
          time: timeString,
          hour,
          minute,
          label: minute === 0 ? `${hour}:00` : timeString,
          isHour: minute === 0,
          isHalfHour: minute === 30,
          isQuarterHour: minute === 15 || minute === 45
        })
      }
    }
    
    return slots
  }, [startHour, endHour, interval])
}