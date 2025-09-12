/**
 * 1時間ごとの横線コンポーネント
 */

'use client'

import React, { memo } from 'react'

import { HOUR_LINE_COLOR } from '../../constants/grid.constants'
import { useTimeGrid } from '../../hooks/useTimeGrid'

interface HourLinesProps {
  startHour?: number
  endHour?: number
  hourHeight?: number
  className?: string
}

export const HourLines = memo<HourLinesProps>(function HourLines({
  startHour = 0,
  endHour = 24,
  hourHeight = 72,
  className = ''
}) {
  const { hours } = useTimeGrid({ startHour, endHour, hourHeight })
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {hours.map((hour) => {
        // 0時間目（1時の上の部分）の境界線はスキップ
        if (hour.hour === startHour) return null
        
        return (
          <div
            key={hour.hour}
            className={`absolute w-full border-t ${HOUR_LINE_COLOR}`}
            style={{
              top: `${hour.position}px`
            }}
          />
        )
      })}
    </div>
  )
})