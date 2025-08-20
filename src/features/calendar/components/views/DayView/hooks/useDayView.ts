import { useMemo } from 'react'
import { isToday } from 'date-fns'
import type { CSSProperties } from 'react'
import { useDayEvents } from './useDayEvents'
import type { UseDayViewOptions, UseDayViewReturn, TimeSlot } from '../DayView.types'
import { HOUR_HEIGHT } from '../../shared/constants/grid.constants'
const QUARTER_INTERVAL = 15 // 15分間隔

export function useDayView({ date, events, onEventUpdate }: UseDayViewOptions): UseDayViewReturn {
  
  // イベントデータ処理
  const { dayEvents, eventPositions } = useDayEvents({ date, events })
  
  // 今日かどうかの判定
  const isTodayFlag = useMemo(() => isToday(date), [date])
  
  // 時間スロットの生成（0:00-23:45、15分間隔）
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = []
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += QUARTER_INTERVAL) {
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
  }, [])
  
  // イベントのCSSスタイルを計算
  const eventStyles = useMemo((): Record<string, CSSProperties> => {
    const styles: Record<string, CSSProperties> = {}
    
    eventPositions.forEach(({ event, top, height, left, width, zIndex }) => {
      styles[event.id] = {
        position: 'absolute',
        top: `${top}px`,
        height: `${height}px`,
        left: `${left}%`,
        width: `${width}%`,
        zIndex
      }
    })
    
    return styles
  }, [eventPositions])
  
  // スクロール処理はScrollableCalendarLayoutに委譲
  
  return {
    dayEvents,
    eventStyles,
    isToday: isTodayFlag,
    timeSlots
  }
}