/**
 * 個別の時間ラベルコンポーネント
 */

'use client'

import React, { memo } from 'react'

interface TimeLabelProps {
  hour: number
  label: string
  position: number
  hourHeight: number
  isFirst: boolean
  isLast: boolean
}

export const TimeLabel = memo<TimeLabelProps>(function TimeLabel({
  hour,
  label,
  position,
  _hourHeight,
  isFirst,
  _isLast
}) {
  return (
    <div
      className="absolute w-full text-xs text-muted-foreground font-medium select-none"
      style={{
        top: `${position}px`,
        height: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '8px'
      }}
    >
      {/* 0時は表示しない（見た目がすっきりする） */}
      {!(hour === 0 && isFirst) && (
        <span className="bg-background px-1">
          {label}
        </span>
      )}
    </div>
  )
})