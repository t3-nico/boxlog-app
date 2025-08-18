'use client'

import { useMemo } from 'react'
import type { TimeGridConfig, TimeSlot } from '../types'

/**
 * 時間グリッド生成フック
 * ビュー共通の時間グリッド生成ロジック
 */
export function useTimeGrid(config: TimeGridConfig = {}) {
  const {
    startHour = 0,
    endHour = 24,
    hourHeight = 60,
    interval = 60
  } = config

  // 時間スロット生成
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        position: (hour - startHour) * hourHeight
      })
    }
    return slots
  }, [startHour, endHour, hourHeight])

  // 時間からピクセル位置を計算
  const getPositionFromTime = useMemo(() => {
    return (timeString: string): number => {
      const [hours, minutes] = timeString.split(':').map(Number)
      const totalHours = hours + minutes / 60
      return (totalHours - startHour) * hourHeight
    }
  }, [startHour, hourHeight])

  // 分数からピクセル高さを計算
  const getHeightFromDuration = useMemo(() => {
    return (minutes: number): number => {
      return (minutes / 60) * hourHeight
    }
  }, [hourHeight])

  // 現在時刻のピクセル位置を計算
  const getCurrentTimePosition = useMemo(() => {
    return (): number => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const totalHours = hours + minutes / 60
      return (totalHours - startHour) * hourHeight
    }
  }, [startHour, hourHeight])

  return {
    timeSlots,
    gridHeight: (endHour - startHour) * hourHeight,
    hourHeight,
    getPositionFromTime,
    getHeightFromDuration,
    getCurrentTimePosition
  }
}