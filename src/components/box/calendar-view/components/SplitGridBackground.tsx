'use client'

import React from 'react'
import { HOUR_HEIGHT } from '../constants/grid-constants'

export function SplitGridBackground() {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* シンプルな時間線（1時間毎） */}
      {hours.map(hour => (
        <div
          key={hour}
          className="absolute w-full border-t border-gray-200 dark:border-gray-700"
          style={{ top: `${hour * HOUR_HEIGHT}px` }}
        />
      ))}

      {/* 統一された背景（なし） */}
      <div className="absolute inset-0 bg-transparent" />
    </div>
  )
}