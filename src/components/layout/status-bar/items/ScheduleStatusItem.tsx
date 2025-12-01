'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Calendar } from 'lucide-react'

import { StatusBarItem } from '../StatusBarItem'

import { Spinner } from '@/components/ui/spinner'
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore'
import { api } from '@/lib/trpc'
import { cn } from '@/lib/utils'

/**
 * 現在の予定/次の予定をステータスバーに表示
 *
 * 表示パターン:
 * - 現在進行中: "ミーティング (14:00-15:00)" + プログレスバー
 * - 次の予定あり: "次: 打ち合わせ (16:00〜)"
 * - 予定なし: "予定なし"
 */
export function ScheduleStatusItem() {
  const router = useRouter()
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

  // 次の予定を取得
  const nextPlan = useMemo(() => {
    if (currentPlan) return null

    const now = currentTime.getTime()

    return todayPlans.find((plan) => {
      if (!plan.start_time) return false
      const start = new Date(plan.start_time).getTime()
      return start > now
    })
  }, [todayPlans, currentPlan, currentTime])

  // 時刻フォーマット（HH:MM）
  const formatTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }, [])

  // クリック時: 予定があればインスペクターを開く、なければカレンダーへ遷移
  const handleClick = useCallback(() => {
    const activePlan = currentPlan || nextPlan
    if (activePlan) {
      openInspector(activePlan.id)
    } else {
      const today = new Date().toISOString().split('T')[0]
      router.push(`/calendar/day?date=${today}`)
    }
  }, [currentPlan, nextPlan, openInspector, router])

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

    if (nextPlan) {
      const startTime = nextPlan.start_time ? formatTime(nextPlan.start_time) : ''
      const timeStr = startTime ? ` (${startTime}〜)` : ''
      return `次: ${nextPlan.title}${timeStr}`
    }

    return '予定なし'
  }, [currentPlan, nextPlan, formatTime])

  // アイコン（ローディング時はスピナー）
  const icon = isLoading ? <Spinner className="h-3 w-3" /> : <Calendar className="h-3 w-3" />

  // ツールチップ
  const tooltip = currentPlan || nextPlan ? '予定を開く' : 'カレンダーを開く'

  return (
    <div className="flex items-center gap-2">
      <StatusBarItem icon={icon} label={isLoading ? '...' : label} onClick={handleClick} tooltip={tooltip} />
      {/* 進行中の予定がある場合のみプログレスバーを表示 */}
      {progressPercent !== null && (
        <div className="flex items-center gap-1.5" title={`${progressPercent}% 経過`}>
          <div className="bg-muted h-1 w-16 overflow-hidden rounded-full">
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
