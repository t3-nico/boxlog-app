'use client'

import { addDays, format, isToday, subDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

import type { CalendarPlan } from '@/features/calendar/types/calendar.types'

// コンパクト版の定数
const COMPACT_HOUR_HEIGHT = 32 // 通常の72pxより小さく
const COMPACT_TIME_COLUMN_WIDTH = 36 // 通常の48pxより小さく
const COMPACT_MIN_EVENT_HEIGHT = 16

interface CompactDayViewProps {
  /** 表示する日付 */
  date: Date
  /** 日付変更ハンドラー */
  onDateChange: (date: Date) => void
  /** プラン一覧 */
  plans?: CalendarPlan[]
  /** プランクリック時 */
  onPlanClick?: (plan: CalendarPlan) => void
  /** 空き時間クリック時 */
  onEmptyClick?: (date: Date, time: string) => void
  /** ドロップ受付時 */
  onDrop?: (planId: string, date: Date, time: string) => void
  /** 追加のクラス名 */
  className?: string
}

/**
 * サイドバー用コンパクトDayView
 *
 * Google Calendarのサイドパネルのような、コンパクトな日表示カレンダー。
 * - 日付ヘッダー（今日/前日/翌日ナビゲーション）
 * - 24時間タイムグリッド
 * - 現在時刻インジケーター
 * - プラン表示
 * - ドロップゾーン（Inboxからのドラッグ＆ドロップ）
 */
export const CompactDayView = memo(function CompactDayView({
  date,
  onDateChange,
  plans = [],
  onPlanClick,
  onEmptyClick,
  onDrop,
  className,
}: CompactDayViewProps) {
  const t = useTranslations()
  const locale = useLocale()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragOverHour, setDragOverHour] = useState<number | null>(null)

  const isTodayDate = useMemo(() => isToday(date), [date])

  // 現在時刻の位置（px）
  const currentTimePosition = useMemo(() => {
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    return (hours + minutes / 60) * COMPACT_HOUR_HEIGHT
  }, [currentTime])

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    if (!isTodayDate) return

    const updateTime = () => setCurrentTime(new Date())
    updateTime()

    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [isTodayDate])

  // 初期スクロール位置（8時付近）
  useEffect(() => {
    if (scrollRef.current) {
      const scrollTop = Math.max(0, (8 - 1) * COMPACT_HOUR_HEIGHT)
      scrollRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' })
    }
  }, [date])

  // ナビゲーション
  const handlePrev = useCallback(() => {
    onDateChange(subDays(date, 1))
  }, [date, onDateChange])

  const handleNext = useCallback(() => {
    onDateChange(addDays(date, 1))
  }, [date, onDateChange])

  const handleToday = useCallback(() => {
    onDateChange(new Date())
  }, [onDateChange])

  // 時間グリッドクリック
  const handleTimeClick = useCallback(
    (hour: number) => {
      const timeString = `${String(hour).padStart(2, '0')}:00`
      onEmptyClick?.(date, timeString)
    },
    [date, onEmptyClick]
  )

  // ドラッグ＆ドロップ
  const handleDragOver = useCallback((e: React.DragEvent, hour: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
    setDragOverHour(hour)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
    setDragOverHour(null)
  }, [])

  const handleDropOnHour = useCallback(
    (e: React.DragEvent, hour: number) => {
      e.preventDefault()
      setIsDragOver(false)
      setDragOverHour(null)

      const planId = e.dataTransfer.getData('text/plain')
      if (planId && onDrop) {
        const timeString = `${String(hour).padStart(2, '0')}:00`
        onDrop(planId, date, timeString)
      }
    },
    [date, onDrop]
  )

  // 時間ラベル生成
  const timeLabels = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00`,
    }))
  }, [])

  // この日のプランをフィルタリング＆位置計算
  const dayPlans = useMemo(() => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return plans
      .filter((plan) => {
        if (!plan.startDate) return false
        const planDateStr = format(new Date(plan.startDate), 'yyyy-MM-dd')
        return planDateStr === dateStr
      })
      .map((plan) => {
        const start = new Date(plan.startDate!)
        const end = plan.endDate ? new Date(plan.endDate) : new Date(start.getTime() + 60 * 60 * 1000)
        const startHour = start.getHours() + start.getMinutes() / 60
        const endHour = end.getHours() + end.getMinutes() / 60
        const duration = Math.max(endHour - startHour, 0.5)

        return {
          plan,
          top: startHour * COMPACT_HOUR_HEIGHT,
          height: Math.max(duration * COMPACT_HOUR_HEIGHT, COMPACT_MIN_EVENT_HEIGHT),
        }
      })
  }, [plans, date])

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* ヘッダー: 日付 + ナビゲーション */}
      <div className="border-border flex shrink-0 items-center justify-between border-b px-2 py-2">
        <div className="flex items-center gap-1 text-sm font-medium">
          <span>{format(date, 'M月d日', locale === 'ja' ? { locale: ja } : {})}</span>
          <span className="text-muted-foreground">({format(date, 'E', locale === 'ja' ? { locale: ja } : {})})</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className={cn('h-6 px-2 text-xs', isTodayDate && 'text-primary font-semibold')}
          >
            {t('common.calendar.today')}
          </Button>
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-6 w-6">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} className="h-6 w-6">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* タイムグリッド */}
      <ScrollArea className="flex-1">
        <div
          ref={scrollRef}
          className="relative"
          style={{ height: 24 * COMPACT_HOUR_HEIGHT }}
          onDragLeave={handleDragLeave}
        >
          {/* 時間列 + グリッド */}
          <div className="flex">
            {/* 時間ラベル列 */}
            <div
              className="border-border sticky left-0 z-10 shrink-0 border-r"
              style={{ width: COMPACT_TIME_COLUMN_WIDTH }}
            >
              {timeLabels.map(({ hour, label }) => (
                <div
                  key={hour}
                  className="text-muted-foreground relative text-right text-[10px]"
                  style={{ height: COMPACT_HOUR_HEIGHT }}
                >
                  <span className="absolute -top-2 right-1">{hour > 0 ? label : ''}</span>
                </div>
              ))}
            </div>

            {/* グリッド領域 */}
            <div className="relative flex-1">
              {/* 時間グリッド線 */}
              {timeLabels.map(({ hour }) => (
                <div
                  key={hour}
                  className={cn(
                    'border-border border-b transition-colors',
                    isDragOver && dragOverHour === hour && 'bg-primary/10'
                  )}
                  style={{ height: COMPACT_HOUR_HEIGHT }}
                  onClick={() => handleTimeClick(hour)}
                  onDragOver={(e) => handleDragOver(e, hour)}
                  onDrop={(e) => handleDropOnHour(e, hour)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleTimeClick(hour)
                    }
                  }}
                />
              ))}

              {/* 現在時刻線 */}
              {isTodayDate && (
                <>
                  <div
                    className="bg-primary pointer-events-none absolute right-0 left-0 z-20 h-[2px]"
                    style={{ top: currentTimePosition }}
                  />
                  <div
                    className="bg-primary pointer-events-none absolute z-20 h-2 w-2 rounded-full"
                    style={{ top: currentTimePosition - 4, left: -4 }}
                  />
                </>
              )}

              {/* プラン表示 */}
              {dayPlans.map(({ plan, top, height }) => (
                <button
                  key={plan.id}
                  type="button"
                  className={cn(
                    'absolute right-1 left-1 overflow-hidden rounded px-1 text-left text-[10px] leading-tight',
                    'bg-primary/20 hover:bg-primary/30 border-primary/50 border-l-2 transition-colors',
                    'focus:ring-ring focus:ring-1 focus:outline-none'
                  )}
                  style={{ top, height, minHeight: COMPACT_MIN_EVENT_HEIGHT }}
                  onClick={() => onPlanClick?.(plan)}
                >
                  <span className="line-clamp-2 font-medium">{plan.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
})
