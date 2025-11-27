'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { cn } from '@/lib/utils'

interface VirtualCalendarGridProps {
  dates: Date[]
  plans: CalendarPlan[]
  hourHeight?: number
  startHour?: number
  endHour?: number
  overscan?: number // レンダリングバッファ（時間単位）
  onPlanClick?: (plan: CalendarPlan) => void
  onCreatePlan?: (date: Date, time: string) => void
  className?: string
}

interface VirtualizedItem {
  index: number
  hour: number
  top: number
  height: number
  isVisible: boolean
}

interface ViewportInfo {
  scrollTop: number
  visibleStart: number
  visibleEnd: number
  containerHeight: number
}

const HOUR_HEIGHT = 60 // デフォルトの1時間の高さ
const BUFFER_SIZE = 2 // 前後2時間分のバッファ

export const VirtualCalendarGrid = ({
  dates,
  plans,
  hourHeight = HOUR_HEIGHT,
  startHour = 0,
  endHour = 24,
  overscan = BUFFER_SIZE,
  onPlanClick,
  onCreatePlan,
  className,
}: VirtualCalendarGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState<ViewportInfo>({
    scrollTop: 0,
    visibleStart: startHour,
    visibleEnd: startHour + 8, // 初期表示は8時間分
    containerHeight: 480,
  })

  // 仮想化されたアイテムの計算
  const virtualItems = useMemo(() => {
    const items: VirtualizedItem[] = []

    for (let hour = startHour; hour < endHour; hour++) {
      const index = hour - startHour
      const top = index * hourHeight
      const isVisible = hour >= viewport.visibleStart - overscan && hour <= viewport.visibleEnd + overscan

      items.push({
        index,
        hour,
        top,
        height: hourHeight,
        isVisible,
      })
    }

    return items
  }, [startHour, endHour, hourHeight, viewport.visibleStart, viewport.visibleEnd, overscan])

  // 表示するプランのフィルタリングと最適化
  const visiblePlans = useMemo(() => {
    if (!plans.length) return []

    const visibleStartHour = Math.max(0, viewport.visibleStart - overscan)
    const visibleEndHour = Math.min(24, viewport.visibleEnd + overscan)

    return plans.filter((plan) => {
      if (!plan.startDate) return false

      const planHour = plan.startDate.getHours()
      const planEndHour = plan.endDate ? plan.endDate.getHours() : planHour + 1

      // プランが表示範囲と重複するかチェック
      return planHour < visibleEndHour && planEndHour > visibleStartHour
    })
  }, [plans, viewport.visibleStart, viewport.visibleEnd, overscan])

  // スクロールハンドラー（パフォーマンス最適化）
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget
      const { scrollTop } = target
      const containerHeight = target.clientHeight

      // 新しい表示範囲を計算
      const visibleStart = Math.floor(scrollTop / hourHeight) + startHour
      const visibleEnd = Math.ceil((scrollTop + containerHeight) / hourHeight) + startHour

      setViewport((prev) => {
        // 変化がない場合は更新しない
        if (
          prev.scrollTop === scrollTop &&
          prev.visibleStart === visibleStart &&
          prev.visibleEnd === visibleEnd &&
          prev.containerHeight === containerHeight
        ) {
          return prev
        }

        return {
          scrollTop,
          visibleStart,
          visibleEnd,
          containerHeight,
        }
      })
    },
    [hourHeight, startHour]
  )

  // Intersection Observer for further optimization
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement
          if (entry.isIntersecting) {
            element.style.visibility = 'visible'
          } else {
            element.style.visibility = 'hidden'
          }
        })
      },
      {
        root: containerRef.current,
        rootMargin: `${overscan * hourHeight}px`,
        threshold: 0,
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [overscan, hourHeight])

  // レンダリング最適化のための時間スロット生成
  const renderTimeSlots = useCallback(() => {
    return virtualItems
      .filter((item) => item.isVisible)
      .map((item) => (
        <VirtualTimeSlot
          key={`time-${item.hour}`}
          hour={item.hour}
          top={item.top}
          height={item.height}
          dates={dates}
          plans={visiblePlans.filter((plan) => {
            if (!plan.startDate) return false
            const planHour = plan.startDate.getHours()
            return planHour === item.hour
          })}
          onPlanClick={onPlanClick}
          onCreatePlan={onCreatePlan}
          observer={observerRef.current}
        />
      ))
  }, [virtualItems, dates, visiblePlans, onPlanClick, onCreatePlan])

  // 全体の高さ計算
  const totalHeight = (endHour - startHour) * hourHeight

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto will-change-scroll', 'scrollbar-thin', className)}
      onScroll={handleScroll}
      style={{
        height: '100%',
        contain: 'layout style paint', // ブラウザ最適化
      }}
    >
      {/* 仮想化されたコンテナ */}
      <div
        style={{
          height: totalHeight,
          position: 'relative',
          contain: 'layout style', // ブラウザ最適化
        }}
      >
        {renderTimeSlots()}
      </div>

      {/* パフォーマンス監視用の情報（開発時のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 rounded bg-black/80 p-2 font-mono text-xs text-white">
          <div>
            Visible: {viewport.visibleStart}h - {viewport.visibleEnd}h
          </div>
          <div>
            Plans: {visiblePlans.length}/{plans.length}
          </div>
          <div>
            Virtual Items: {virtualItems.filter((i) => i.isVisible).length}/{virtualItems.length}
          </div>
          <div>Scroll: {Math.round(viewport.scrollTop)}px</div>
        </div>
      )}
    </div>
  )
}

// 仮想化された時間スロットコンポーネント
interface VirtualTimeSlotProps {
  hour: number
  top: number
  height: number
  dates: Date[]
  plans: CalendarPlan[]
  onPlanClick?: (plan: CalendarPlan) => void
  onCreatePlan?: (date: Date, time: string) => void
  observer?: IntersectionObserver | null
}

const VirtualTimeSlot = React.memo(function VirtualTimeSlot({
  hour,
  top,
  height,
  dates,
  plans,
  onPlanClick,
  onCreatePlan,
  observer,
}: VirtualTimeSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null)

  // Intersection Observer の設定
  useEffect(() => {
    const element = slotRef.current
    if (element && observer) {
      observer.observe(element)
      return () => observer.unobserve(element)
    }
  }, [observer])

  const timeString = `${String(hour).padStart(2, '0')}:00`

  return (
    <div
      ref={slotRef}
      className="border-border absolute inset-x-0 border-t"
      style={{
        top,
        height,
        contain: 'layout', // ブラウザ最適化
      }}
      data-hour={hour}
    >
      {/* 時間ラベル */}
      <div className="text-muted-foreground absolute top-0 left-0 -mt-2 w-16 text-xs">{timeString}</div>

      {/* 各日付の列 */}
      <div className="ml-16 flex h-full">
        {dates.map((date, _dateIndex) => (
          <VirtualDayColumn
            key={`${format(date, 'yyyy-MM-dd')}-${hour}`}
            date={date}
            hour={hour}
            plans={plans.filter((plan) => plan.startDate?.toDateString() === date.toDateString())}
            onPlanClick={onPlanClick}
            onCreatePlan={onCreatePlan}
          />
        ))}
      </div>
    </div>
  )
})

// 仮想化された日付列コンポーネント
interface VirtualDayColumnProps {
  date: Date
  hour: number
  plans: CalendarPlan[]
  onPlanClick?: (plan: CalendarPlan) => void
  onCreatePlan?: (date: Date, time: string) => void
}

const VirtualDayColumn = React.memo(function VirtualDayColumn({
  date,
  hour,
  plans,
  onPlanClick,
  onCreatePlan,
}: VirtualDayColumnProps) {
  const handleClick = useCallback(() => {
    const timeString = `${String(hour).padStart(2, '0')}:00`
    onCreatePlan?.(date, timeString)
  }, [date, hour, onCreatePlan])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Time slot for ${format(date, 'MMM d')} at ${hour}:00`}
      className="border-border hover:bg-muted/50 relative flex-1 cursor-pointer border-r"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      style={{
        contain: 'layout style', // ブラウザ最適化
      }}
    >
      {/* プラン表示 */}
      {plans.map((plan) => (
        <VirtualPlanCard key={plan.id} plan={plan} onClick={() => onPlanClick?.(plan)} />
      ))}
    </div>
  )
})

// 仮想化されたプランカード
interface VirtualPlanCardProps {
  plan: CalendarPlan
  onClick: () => void
}

const VirtualPlanCard = React.memo(function VirtualPlanCard({ plan, onClick }: VirtualPlanCardProps) {
  const { style, heightInPixels } = useMemo(() => {
    if (!plan.startDate || !plan.endDate) {
      return { style: {}, heightInPixels: 0 }
    }

    const startHour = plan.startDate.getHours()
    const startMinutes = plan.startDate.getMinutes()
    const endHour = plan.endDate.getHours()
    const endMinutes = plan.endDate.getMinutes()

    const top = (startMinutes / 60) * HOUR_HEIGHT
    const duration = endHour - startHour + (endMinutes - startMinutes) / 60
    const height = duration * HOUR_HEIGHT

    return {
      style: {
        position: 'absolute' as const,
        top: `${top}px`,
        left: '2px',
        right: '2px',
        height: `${height}px`,
        backgroundColor: plan.color || '#3b82f6',
        zIndex: 10,
      },
      heightInPixels: height,
    }
  }, [plan])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Plan: ${plan.title}`}
      className="cursor-pointer overflow-hidden rounded-md p-1 text-xs text-white transition-shadow hover:shadow-lg"
      style={style}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <div className="truncate font-medium">{plan.title}</div>
      {heightInPixels > 30 && plan.startDate ? (
        <div className="opacity-90">{format(plan.startDate, 'HH:mm')}</div>
      ) : null}
    </div>
  )
})

// ユーティリティ関数
function format(date: Date, formatStr: string): string {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0]
  }
  if (formatStr === 'HH:mm') {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  return date.toISOString()
}
