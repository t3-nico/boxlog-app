'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StatusBarItem } from '../StatusBarItem'

import { Spinner } from '@/components/ui/spinner'
import { PlanCreateTrigger } from '@/features/plans/components/shared/PlanCreateTrigger'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { api } from '@/lib/trpc'
import { cn } from '@/lib/utils'

/**
 * 現在の予定をステータスバーに表示
 *
 * 表示パターン:
 * - 現在進行中: "ミーティング (14:00-15:00)" + プログレスバー
 * - 予定なし: "予定なし"（クリックで新規作成ポップオーバーを表示）
 */
export function ScheduleStatusItem() {
  const t = useTranslations('calendar')
  const openInspector = usePlanInspectorStore((state) => state.openInspector)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  // 1分ごとに現在時刻を更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60 * 1000)

    return () => clearInterval(timer)
  }, [])

  // 今日の予定を取得
  const { data: plans, isLoading } = api.plans.list.useQuery(undefined, {
    staleTime: 60 * 1000, // 1分
    refetchInterval: 60 * 1000, // 1分ごとに再取得
  })

  // 今日の予定をフィルタリング
  const todayPlans = useMemo(() => {
    if (!plans) return []

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    return plans
      .filter((plan) => {
        // due_date または start_time が今日のもの
        if (plan.due_date === todayStr) return true
        if (plan.start_time) {
          const startDate = new Date(plan.start_time).toISOString().split('T')[0]
          return startDate === todayStr
        }
        return false
      })
      .filter((plan) => {
        // 完了・キャンセル以外
        return plan.status !== 'done' && plan.status !== 'cancel'
      })
      .sort((a, b) => {
        // start_time でソート
        const aTime = a.start_time ? new Date(a.start_time).getTime() : Infinity
        const bTime = b.start_time ? new Date(b.start_time).getTime() : Infinity
        return aTime - bTime
      })
  }, [plans])

  // 現在進行中の予定を取得
  const currentPlan = useMemo(() => {
    const now = currentTime.getTime()

    return todayPlans.find((plan) => {
      if (!plan.start_time || !plan.end_time) return false
      const start = new Date(plan.start_time).getTime()
      const end = new Date(plan.end_time).getTime()
      return now >= start && now <= end
    })
  }, [todayPlans, currentTime])

  // 時刻フォーマット（HH:MM）
  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }, [])

  // クリック時: 現在の予定があればインスペクターを開く
  const handleClick = useCallback(() => {
    if (currentPlan) {
      openInspector(currentPlan.id)
    }
  }, [currentPlan, openInspector])

  // 進捗率を計算（0〜100）
  const progressPercent = useMemo(() => {
    if (!currentPlan?.start_time || !currentPlan?.end_time) return null

    const start = new Date(currentPlan.start_time).getTime()
    const end = new Date(currentPlan.end_time).getTime()
    const now = currentTime.getTime()

    const total = end - start
    const elapsed = now - start

    if (total <= 0) return null

    const percent = Math.min(100, Math.max(0, (elapsed / total) * 100))
    return Math.round(percent)
  }, [currentPlan, currentTime])

  // ラベル生成
  const label = useMemo(() => {
    if (currentPlan) {
      const startTime = currentPlan.start_time ? formatTime(currentPlan.start_time) : ''
      const endTime = currentPlan.end_time ? formatTime(currentPlan.end_time) : ''
      const timeRange = startTime && endTime ? ` (${startTime}-${endTime})` : ''
      return `${currentPlan.title}${timeRange}`
    }

    return t('statusBar.noSchedule')
  }, [currentPlan, formatTime, t])

  // アイコン（ローディング時はスピナー）
  const icon = isLoading ? <Spinner className="h-3 w-3" /> : <Calendar className="h-3 w-3" />

  // ツールチップ
  const tooltip = currentPlan ? t('statusBar.openSchedule') : t('statusBar.createNewPlan')

  // 予定がない場合の初期値を計算
  const initialDate = useMemo(() => new Date(), [])
  const initialStartTime = useMemo(() => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    return `${hours}:00`
  }, [])
  const initialEndTime = useMemo(() => {
    const now = new Date()
    const endHours = (now.getHours() + 1) % 24
    return `${endHours.toString().padStart(2, '0')}:00`
  }, [])

  // 現在の予定がある場合は通常のStatusBarItem、ない場合はPlanCreateTriggerでラップ
  const hasActivePlan = !!currentPlan

  const statusBarContent = (
    <>
      <StatusBarItem icon={icon} label={isLoading ? '...' : label} onClick={handleClick} tooltip={tooltip} />
      {/* 進行中の予定がある場合のみプログレスバーを表示 */}
      {progressPercent !== null && (
        <div className="flex items-center gap-1.5" title={`${progressPercent}% 経過`}>
          <div className="bg-surface-container h-1 w-16 overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                progressPercent < 80 ? 'bg-primary' : 'bg-destructive'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs tabular-nums">{progressPercent}%</span>
        </div>
      )}
    </>
  )

  if (hasActivePlan) {
    return <div className="flex items-center gap-2">{statusBarContent}</div>
  }

  // 予定がない場合はPlanCreateTriggerでラップ
  return (
    <div className="flex items-center gap-2">
      <PlanCreateTrigger
        triggerElement={
          <button type="button" className="flex items-center">
            <StatusBarItem icon={icon} label={isLoading ? '...' : label} tooltip={tooltip} forceClickable />
          </button>
        }
        initialDate={initialDate}
        initialStartTime={initialStartTime}
        initialEndTime={initialEndTime}
      />
      {progressPercent !== null && (
        <div className="flex items-center gap-1.5" title={`${progressPercent}% 経過`}>
          <div className="bg-surface-container h-1 w-16 overflow-hidden rounded-full">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                progressPercent < 80 ? 'bg-primary' : 'bg-destructive'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-muted-foreground text-xs tabular-nums">{progressPercent}%</span>
        </div>
      )}
    </div>
  )
}
