'use client'

import { useMemo } from 'react'

import { PlanCard } from '@/features/board/components/shared/PlanCard'
import { parseDateString } from '@/features/calendar/utils/dateUtils'
import { useInboxData } from '@/features/inbox/hooks/useInboxData'

import type { TodoFilter, TodoSort } from './TodoNavigation'

interface TodoCardListProps {
  filter: TodoFilter
  sort: TodoSort
  showHigh: boolean
  showMedium: boolean
  showLow: boolean
}

/**
 * TodoCardList - Calendar Sidebar用カードリスト（status: todoのプラン）
 *
 * **機能**:
 * - useInboxData でデータ取得
 * - フィルター・ソート・優先度フィルタリング
 * - PlanCard を再利用（ドラッグ可能）
 *
 * **Note**: PlanCard の useDraggable は既に実装済みなので、
 * DndContext 内に配置すれば自動的にドラッグ可能になる
 */
export function TodoCardList({
  filter,
  sort,
  showHigh: _showHigh,
  showMedium: _showMedium,
  showLow: _showLow,
}: TodoCardListProps) {
  // status: 'todo' のプランのみ取得
  const { items, isPending, error } = useInboxData({ status: 'todo' })

  // フィルタリング・ソート処理
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items]

    // 1. 期間フィルター
    if (filter !== 'all') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      result = result.filter((item) => {
        if (!item.due_date) return false

        // タイムゾーン問題を回避: YYYY-MM-DD をローカル日付として解釈
        const itemDate = parseDateString(item.due_date)
        itemDate.setHours(0, 0, 0, 0)

        if (filter === 'today') {
          return itemDate.getTime() === today.getTime()
        } else if (filter === 'overdue') {
          return itemDate < today
        }
        return true
      })
    }

    // 2. 優先度フィルター
    // NOTE: Plan/InboxItem には現在 priority フィールドが存在しない
    // 将来の機能追加時に実装予定（DBスキーマ変更が必要）

    // 3. ソート
    result.sort((a, b) => {
      if (sort === 'due') {
        // 期限日順（期限なしは最後）
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        // タイムゾーン問題を回避: YYYY-MM-DD をローカル日付として解釈
        return parseDateString(a.due_date).getTime() - parseDateString(b.due_date).getTime()
      } else if (sort === 'priority') {
        // NOTE: priority フィールド未実装のため、作成日順でソート
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sort === 'created') {
        // 作成日順（新しい順）
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })

    return result
  }, [items, filter, sort])

  // ローディング表示
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
        <p className="text-muted-foreground mt-2 text-sm">読み込み中...</p>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-destructive text-sm font-medium">エラーが発生しました</p>
        <p className="text-muted-foreground mt-1 text-xs">{error.message}</p>
      </div>
    )
  }

  // 空状態
  if (filteredAndSortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">タスクがありません</p>
      </div>
    )
  }

  // カードリスト表示（PlanCardを再利用）
  return (
    <div className="flex flex-col gap-2 overflow-y-auto pt-4 pb-4">
      {filteredAndSortedItems.map((item) => (
        <PlanCard key={item.id} item={item} />
      ))}
    </div>
  )
}
