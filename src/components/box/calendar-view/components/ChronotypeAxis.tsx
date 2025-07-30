'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { HOUR_HEIGHT, TIME_LABEL_WIDTH } from '../constants/grid-constants'
import { ChronotypeIndicator } from './ChronotypeIndicator'

interface ChronotypeAxisProps {
  startHour?: number
  endHour?: number
  className?: string
}

export function ChronotypeAxis({ 
  startHour = 0, 
  endHour = 24, 
  className
}: ChronotypeAxisProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  
  return (
    <div 
      className={cn(
        "shrink-0 w-0 bg-white dark:bg-gray-900",
        className
      )}
    >
      
      {hours.map(hour => (
        <div
          key={hour}
          className="relative"
          style={{ height: HOUR_HEIGHT }}
        >
          {/* クロノタイプ縦線インジケーター（右端に表示） */}
          <ChronotypeIndicator hour={hour} className="z-0" />
        </div>
      ))}
    </div>
  )
}