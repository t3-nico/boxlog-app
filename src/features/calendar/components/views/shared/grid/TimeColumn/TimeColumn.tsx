/**
 * 時間列コンポーネント（左側の時間表示）
 */

'use client'

import React, { memo } from 'react'
import { useTimeGrid } from '../../hooks/useTimeGrid'
import { TIME_COLUMN_WIDTH } from '../../constants/grid.constants'
import { background } from '@/config/theme/colors'
import type { TimeColumnProps } from '../../types/grid.types'
import { TimeLabel } from './TimeLabel'

export const TimeColumn = memo<TimeColumnProps>(function TimeColumn({
  startHour = 0,
  endHour = 24,
  hourHeight = 72,
  format = '24h',
  className = ''
}) {
  const { hours, gridHeight } = useTimeGrid({
    startHour,
    endHour,
    hourHeight,
    format
  })
  
  return (
    <div
      className={`sticky left-0 ${background.base} border-r border-neutral-900/20 dark:border-neutral-100/20 z-10 ${className}`}
      style={{
        width: `${TIME_COLUMN_WIDTH}px`,
        height: `${gridHeight}px`
      }}
    >
      {hours.map((hour, index) => (
        <TimeLabel
          key={hour.hour}
          hour={hour.hour}
          label={hour.label}
          position={hour.position}
          hourHeight={hourHeight}
          isFirst={index === 0}
          isLast={index === hours.length - 1}
        />
      ))}
    </div>
  )
})