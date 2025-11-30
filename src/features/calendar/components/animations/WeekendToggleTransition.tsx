'use client'

import React, { useEffect, useState } from 'react'

import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { cn } from '@/lib/utils'

interface WeekendToggleTransitionProps {
  children: React.ReactNode
  className?: string
}

/**
 * 週末表示切り替え時のスムーズなトランジション効果を提供
 */
export const WeekendToggleTransition = ({ children, className }: WeekendToggleTransitionProps) => {
  const { showWeekends } = useCalendarSettingsStore()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousShowWeekends, setPreviousShowWeekends] = useState(showWeekends)

  useEffect(() => {
    if (showWeekends !== previousShowWeekends) {
      setIsTransitioning(true)
      setPreviousShowWeekends(showWeekends)

      // 300msのトランジション時間
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 300)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [showWeekends, previousShowWeekends])

  return (
    <div
      className={cn('transition-all duration-300 ease-in-out', isTransitioning && 'opacity-95', className)}
      style={{
        transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      {children}
    </div>
  )
}

/**
 * 週末カラムの個別アニメーション効果
 */
export const WeekendColumnTransition = ({
  children,
  isWeekendColumn = false,
  className,
}: {
  children: React.ReactNode
  isWeekendColumn?: boolean
  className?: string
}) => {
  const { showWeekends } = useCalendarSettingsStore()
  const [isVisible, setIsVisible] = useState(showWeekends || !isWeekendColumn)

  useEffect(() => {
    if (isWeekendColumn) {
      if (showWeekends) {
        setIsVisible(true)
      } else {
        // フェードアウトしてから非表示
        const timer = setTimeout(() => {
          setIsVisible(false)
        }, 200)
        return () => clearTimeout(timer)
      }
    }
    return undefined
  }, [showWeekends, isWeekendColumn])

  if (isWeekendColumn && !showWeekends && !isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        isWeekendColumn && !showWeekends && 'pointer-events-none scale-95 opacity-0',
        isWeekendColumn && showWeekends && 'scale-100 opacity-100',
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * グリッドレイアウトの動的調整アニメーション
 */
export const GridLayoutTransition = ({
  children,
  totalColumns,
  className,
}: {
  children: React.ReactNode
  totalColumns: number
  className?: string
}) => {
  const [previousColumns, setPreviousColumns] = useState(totalColumns)
  const [isAdjusting, setIsAdjusting] = useState(false)

  useEffect(() => {
    if (totalColumns !== previousColumns) {
      setIsAdjusting(true)
      setPreviousColumns(totalColumns)

      const timer = setTimeout(() => {
        setIsAdjusting(false)
      }, 300)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [totalColumns, previousColumns])

  return (
    <div
      className={cn('transition-all duration-300 ease-in-out', isAdjusting && 'opacity-90', className)}
      style={{
        gridTemplateColumns: `repeat(${totalColumns}, minmax(0, 1fr))`,
      }}
    >
      {children}
    </div>
  )
}
