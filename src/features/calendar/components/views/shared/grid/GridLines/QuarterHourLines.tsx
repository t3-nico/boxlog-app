/**
 * 15分ごとの薄い点線コンポーネント
 */

'use client'

import React, { memo } from 'react'
import { useTimeGrid } from '../../hooks/useTimeGrid'

interface QuarterHourLinesProps {
  startHour?: number
  endHour?: number
  hourHeight?: number
  className?: string
}

export const QuarterHourLines = memo<QuarterHourLinesProps>(function QuarterHourLines({
  startHour = 0,
  endHour = 24,
  hourHeight = 72,
  className = ''
}) {
  const { hours } = useTimeGrid({ startHour, endHour, hourHeight })
  
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {hours.map((hour) => [
        // 15分線
        <div
          key={`quarter-1-${hour.hour}`}
          className="absolute w-full border-t border-dotted border-neutral-900/20 dark:border-neutral-100/20 opacity-50"
          style={{
            top: `${hour.position + hourHeight / 4}px`
          }}
        />,
        // 45分線
        <div
          key={`quarter-3-${hour.hour}`}
          className="absolute w-full border-t border-dotted border-neutral-900/20 dark:border-neutral-100/20 opacity-50"
          style={{
            top: `${hour.position + (hourHeight * 3) / 4}px`
          }}
        />
      ]).flat()}
    </div>
  )
})