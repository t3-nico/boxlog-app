/**
 * 個別の時間ラベルコンポーネント
 */

'use client'

import { memo } from 'react'

interface TimeLabelProps {
  hour: number
  label: string
  position: number
  hourHeight: number
  isFirst: boolean
  isLast: boolean
}

export const TimeLabel = memo<TimeLabelProps>(function TimeLabel({ hour, label, position, isFirst }) {
  return (
    <div
      className="text-muted-foreground absolute w-full text-xs font-medium select-none"
      style={{
        top: `${position}px`,
        height: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '8px',
      }}
    >
      {/* 0時は表示しない（見た目がすっきりする） */}
      {!(hour === 0 && isFirst) && <span className="bg-background px-1">{label}</span>}
    </div>
  )
})
