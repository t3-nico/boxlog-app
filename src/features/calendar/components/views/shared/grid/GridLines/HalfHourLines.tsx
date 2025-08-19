/**
 * 30分ごとの薄い横線コンポーネント
 */

'use client'

import React, { memo } from 'react'
import { useTimeGrid } from '../../hooks/useTimeGrid'
import { HALF_HOUR_LINE_COLOR } from '../../constants/grid.constants'

interface HalfHourLinesProps {
  startHour?: number
  endHour?: number
  hourHeight?: number
  className?: string
}

export const HalfHourLines = memo<HalfHourLinesProps>(function HalfHourLines({
  startHour = 0,
  endHour = 24,
  hourHeight = 72,
  className = ''
}) {
  const { hours } = useTimeGrid({ startHour, endHour, hourHeight })
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {hours.map((hour) => (
        <div
          key={`half-${hour.hour}`}
          className={`absolute w-full border-t ${HALF_HOUR_LINE_COLOR}`}
          style={{
            top: `${hour.position + hourHeight / 2}px`
          }}
        />
      ))}
    </div>
  )
})