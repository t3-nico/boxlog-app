'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { format, isSameDay, isToday } from 'date-fns'
import { X } from 'lucide-react'
import { toast } from 'sonner'

import { useRecordsStore } from '@/features/calendar/stores/useRecordsStore'
import type { CalendarPlan } from '@/features/calendar/types/calendar.types'
import { useTranslations } from 'next-intl'
import { useCalendarSettingsStore } from '@/features/settings/stores/useCalendarSettingsStore'
import { useAddPopup } from '@/hooks/useAddPopup'

import { HOUR_HEIGHT } from '../../../constants/calendar-constants'
import type { Task, ViewDateRange } from '../../../types/calendar.types'

import { TimeColumn } from '../shared/grid/TimeColumn'

interface WeekCalendarLayoutProps {
  dates: Date[]
  tasks: Task[]
  events: CalendarPlan[]
  dateRange: ViewDateRange
  onPlanClick?: (plan: CalendarPlan) => void
  onCreatePlan?: (date: Date, time?: string) => void
  onUpdatePlan?: (plan: CalendarPlan) => void
  onDeletePlan?: (planId: string) => void
  onRestorePlan?: (plan: CalendarPlan) => Promise<void>
}

// 現在時刻線コンポーネント（シンプル版）
const CurrentTimeLine = ({ day }: { day: Date }) => {
  if (!isToday(day)) return null

  const now = new Date()
  const currentHours = now.getHours() + now.getMinutes() / 60

  return (
    <div
      className="pointer-events-none absolute right-0 left-0 z-30 h-0.5 bg-red-500"
      style={{
        top: `${currentHours * HOUR_HEIGHT}px`,
      }}
    >
      <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rounded-full bg-red-500" />
    </div>
  )
}

export const WeekCalendarLayout = ({
  dates,
  tasks: _tasks,
  events = [],
  dateRange,
  onPlanClick,
  onCreatePlan,
  onUpdatePlan: _onUpdatePlan,
  onDeletePlan,
  onRestorePlan,
}: WeekCalendarLayoutProps) => {
  const t = useTranslations()
  const { openEventPopup } = useAddPopup()
  const { planRecordMode } = useCalendarSettingsStore()
  const { records: _records, fetchRecords } = useRecordsStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)

  // Records取得
  useEffect(() => {
    if (planRecordMode === 'record' || planRecordMode === 'both') {
      fetchRecords(dateRange)
    }
  }, [planRecordMode, dateRange, fetchRecords])

  // 削除処理関数（トースト機能付き）
  const handleDeletePlan = useCallback(
    (planId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
        e.preventDefault()
      }

      // 削除対象のプランを見つける
      const planToDelete = events.find((plan) => plan.id === planId)
      if (!planToDelete) return

      // 確認なしで即座に削除（トーストで元に戻せるため）
      onDeletePlan?.(planId)

      // Sonner toastで削除通知（Undo機能付き）
      toast.info(t('calendar.toast.deleted'), {
        description: planToDelete.title,
        duration: 5000,
        action: onRestorePlan
          ? {
              label: t('calendar.actions.undo'),
              onClick: async () => {
                await onRestorePlan(planToDelete)
              },
            }
          : undefined,
      })

      // 選択状態をクリア
      if (selectedPlanId === planId) {
        setSelectedPlanId(null)
      }
    },
    [onDeletePlan, onRestorePlan, selectedPlanId, events, t]
  )

  // キーボードショートカット（Delete/Backspace）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPlanId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault()
        handleDeletePlan(selectedPlanId)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedPlanId, handleDeletePlan])

  // 空き時間クリックハンドラー
  const handleEmptySlotClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
      // プランブロック上のクリックは無視
      if ((e.target as HTMLElement).closest('[data-event-block]')) {
        return
      }

      // クリック位置から時刻を計算
      const rect = e.currentTarget.getBoundingClientRect()
      const parentScrollTop = e.currentTarget.parentElement?.scrollTop || 0
      const clickY = e.clientY - rect.top + parentScrollTop

      // 15分単位でスナップ
      const totalMinutes = Math.max(0, Math.floor((clickY / HOUR_HEIGHT) * 60))
      const hours = Math.floor(totalMinutes / 60)
      const minutes = Math.round((totalMinutes % 60) / 15) * 15

      // 時刻文字列
      const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

      // AddPopupを開く
      openEventPopup({
        dueDate: date,
      })

      // デフォルト値を設定（AddPopupが使用）
      if (onCreatePlan) {
        onCreatePlan(date, timeString)
      }
    },
    [openEventPopup, onCreatePlan]
  )

  // プランの位置計算
  const calculatePlanPosition = useCallback((plan: CalendarPlan) => {
    if (!plan.startDate) {
      return { top: 0, height: HOUR_HEIGHT }
    }

    const hours = plan.startDate.getHours()
    const minutes = plan.startDate.getMinutes()
    const top = (hours + minutes / 60) * HOUR_HEIGHT

    const endHours = plan.endDate ? plan.endDate.getHours() : hours + 1
    const endMinutes = plan.endDate ? plan.endDate.getMinutes() : 0
    const height = Math.max(
      20, // 最小高さ
      (endHours + endMinutes / 60 - (hours + minutes / 60)) * HOUR_HEIGHT
    )

    return { top, height }
  }, [])

  // jsx-no-bind optimization: Empty slot click handler creator
  const createEmptySlotClickHandler = useCallback(
    (day: Date) => {
      return (e: React.MouseEvent<HTMLDivElement>) => handleEmptySlotClick(e, day)
    },
    [handleEmptySlotClick]
  )

  // jsx-no-bind optimization: Empty slot keyboard handler creator
  const createEmptySlotKeyDownHandler = useCallback(
    (day: Date) => {
      return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleEmptySlotClick(e as unknown as React.MouseEvent<HTMLDivElement>, day)
        }
      }
    },
    [handleEmptySlotClick]
  )

  // jsx-no-bind optimization: Plan click handler creator
  const createPlanClickHandler = useCallback(
    (plan: CalendarPlan) => {
      return (e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedPlanId(plan.id)
        onPlanClick?.(plan)
      }
    },
    [setSelectedPlanId, onPlanClick]
  )

  // jsx-no-bind optimization: Plan keyboard handler creator
  const createPlanKeyDownHandler = useCallback(
    (plan: CalendarPlan) => {
      return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          setSelectedPlanId(plan.id)
          onPlanClick?.(plan)
        }
      }
    },
    [setSelectedPlanId, onPlanClick]
  )

  // jsx-no-bind optimization: Delete plan handler creator
  const createDeletePlanHandler = useCallback(
    (planId: string) => {
      return (e: React.MouseEvent) => handleDeletePlan(planId, e)
    },
    [handleDeletePlan]
  )

  return (
    <div ref={containerRef} className="flex-1 overflow-hidden">
      <div className="full-day-scroll flex h-full overflow-y-auto">
        {/* 時間軸ラベル */}
        <div
          className="bg-background sticky left-0 z-10 flex-shrink-0 shadow-sm"
          style={{ height: `${24 * HOUR_HEIGHT}px` }}
        >
          <TimeColumn startHour={0} endHour={24} className="w-16" />
        </div>

        {/* カレンダーグリッド */}
        <div className="bg-background relative flex flex-1" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {dates.map((day, _dayIndex) => {
            // その日のプランをフィルタリング
            const dayPlans = events
              .filter((plan) => {
                if (!plan.startDate) return false
                return isSameDay(plan.startDate, day)
              })
              .sort((a, b) => {
                const aTime = a.startDate ? a.startDate.getTime() : 0
                const bTime = b.startDate ? b.startDate.getTime() : 0
                return aTime - bTime
              })

            return (
              <div key={day.toISOString()} className="border-border relative flex-1 border-r last:border-r-0">
                {/* クリック可能な背景エリア */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={createEmptySlotClickHandler(day)}
                  onKeyDown={createEmptySlotKeyDownHandler(day)}
                  className="absolute inset-0 z-10 cursor-cell"
                  aria-label={`${format(day, 'yyyy年M月d日')}の予定を追加`}
                >
                  {/* 分割線（bothモード時のみ） */}
                  {planRecordMode === 'both' ? (
                    <div className="bg-border absolute top-0 bottom-0 left-1/2 z-20 w-px -translate-x-0.5"></div>
                  ) : null}

                  {/* 時間グリッド背景 */}
                  <div className="absolute inset-0">
                    {Array.from({ length: 24 }, (_, hour) => (
                      <div
                        key={hour}
                        className="border-border hover:bg-primary/5 border-b transition-colors last:border-b-0"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        title={`${hour}:00 - ${hour + 1}:00`}
                      />
                    ))}
                  </div>
                </div>

                {/* 現在時刻線 */}
                <CurrentTimeLine day={day} />

                {/* プラン表示 */}
                {(planRecordMode === 'plan' || planRecordMode === 'both') &&
                  dayPlans.map((plan) => {
                    if (!plan.startDate) return null

                    const { top, height } = calculatePlanPosition(plan)
                    const planColor = plan.color || '#3b82f6'

                    // bothモードでは左半分、planモードでは全幅
                    const leftPosition = planRecordMode === 'both' ? '2px' : '4px'
                    const widthValue = planRecordMode === 'both' ? 'calc(50% - 4px)' : 'calc(100% - 8px)'

                    return (
                      <div
                        key={plan.id}
                        data-event-block
                        role="button"
                        tabIndex={0}
                        className={`group border-border/20 absolute z-20 cursor-pointer rounded-md border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${selectedPlanId === plan.id ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                        style={{
                          left: leftPosition,
                          width: widthValue,
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: planColor,
                        }}
                        onClick={createPlanClickHandler(plan)}
                        onKeyDown={createPlanKeyDownHandler(plan)}
                        aria-label={`プラン: ${plan.title}${plan.startDate ? ` (${format(plan.startDate, 'HH:mm')}開始)` : ''}`}
                      >
                        {/* ホバー時の削除ボタン */}
                        <button
                          type="button"
                          onClick={createDeletePlanHandler(plan.id)}
                          className="bg-card/90 hover:bg-card absolute top-1 right-1 z-30 rounded p-0.5 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100"
                          title={t('calendar.event.delete')}
                        >
                          <X className="text-muted-foreground h-3 w-3" />
                        </button>

                        <div className="h-full overflow-hidden p-1 text-white sm:p-2">
                          <div className="flex h-full flex-col">
                            <div className="min-h-0 flex-1">
                              <div className="mb-0.5 line-clamp-2 text-xs leading-tight font-medium">{plan.title}</div>
                              {height > 30 ? (
                                <div className="text-xs leading-tight opacity-90">
                                  {format(plan.startDate, 'HH:mm')}
                                  {plan.endDate ? ` - ${format(plan.endDate, 'HH:mm')}` : null}
                                </div>
                              ) : null}
                            </div>
                            {plan.location && height > 60 ? (
                              <div className="mt-1 line-clamp-1 text-xs leading-tight opacity-80">
                                📍 {plan.location}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
