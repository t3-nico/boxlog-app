/**
 * Inbox用データ取得フック
 * Board/Table共通のデータフェッチングhooks
 * TanStack Query統合済み
 */

import { useTickets } from '@/features/plans/hooks/usePlans'
import type { Plan, PlanStatus } from '@/features/plans/types/plan'
import type { DueDateFilter } from '../stores/useInboxFilterStore'

/**
 * Inboxアイテム（Plan型のエイリアス）
 */
export interface InboxItem {
  id: string
  type: 'ticket'
  title: string
  status: PlanStatus
  created_at: string
  updated_at: string
  ticket_number?: string
  planned_hours?: number
  description?: string
  due_date?: string | null // 期限日（YYYY-MM-DD）
  start_time?: string | null // 開始時刻（ISO 8601）
  end_time?: string | null // 終了時刻（ISO 8601）
  reminder_minutes?: number | null // 通知タイミング（開始時刻の何分前か）
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays' | null // 繰り返しタイプ（シンプル版）
  recurrence_end_date?: string | null // 繰り返し終了日（YYYY-MM-DD）
  recurrence_rule?: string | null // カスタム繰り返し（RRULE形式）
  tags?: Array<{ id: string; name: string; color?: string }> // タグ情報
}

/**
 * Inboxフィルター型
 */
export interface InboxFilters {
  status?: PlanStatus
  search?: string
  tags?: string[] // タグIDの配列
  dueDate?: DueDateFilter // 期限フィルター
}

/**
 * 期限フィルターの判定
 */
function matchesDueDateFilter(dueDate: string | null | undefined, filter: DueDateFilter): boolean {
  if (filter === 'all') return true

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 期限なしフィルター
  if (filter === 'no_due_date') {
    return !dueDate
  }

  // 期限ありフィルターは期限がない場合false
  if (!dueDate) return false

  const itemDate = new Date(dueDate)
  itemDate.setHours(0, 0, 0, 0)

  switch (filter) {
    case 'today':
      return itemDate.getTime() === today.getTime()

    case 'tomorrow': {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return itemDate.getTime() === tomorrow.getTime()
    }

    case 'this_week': {
      const endOfWeek = new Date(today)
      endOfWeek.setDate(endOfWeek.getDate() + (6 - today.getDay()))
      return itemDate >= today && itemDate <= endOfWeek
    }

    case 'next_week': {
      const startOfNextWeek = new Date(today)
      startOfNextWeek.setDate(startOfNextWeek.getDate() + (7 - today.getDay()))
      const endOfNextWeek = new Date(startOfNextWeek)
      endOfNextWeek.setDate(endOfNextWeek.getDate() + 6)
      return itemDate >= startOfNextWeek && itemDate <= endOfNextWeek
    }

    case 'overdue':
      return itemDate < today

    default:
      return true
  }
}

/**
 * PlanをInboxItemに変換
 */
function ticketToInboxItem(
  ticket: Plan & { ticket_tags?: Array<{ tags: { id: string; name: string; color?: string } }> }
): InboxItem {
  // ticket_tags から tags を抽出
  const tags =
    ticket.ticket_tags
      ?.map((tt) => tt.tags)
      .filter((tag): tag is { id: string; name: string; color?: string } => tag !== null && tag !== undefined) || []

  return {
    id: ticket.id,
    type: 'ticket',
    title: ticket.title,
    status: ticket.status,
    created_at: ticket.created_at ?? new Date().toISOString(),
    updated_at: ticket.updated_at ?? new Date().toISOString(),
    ticket_number: ticket.ticket_number,
    description: ticket.description ?? undefined,
    due_date: ticket.due_date,
    start_time: ticket.start_time,
    end_time: ticket.end_time,
    recurrence_type: ticket.recurrence_type,
    recurrence_end_date: ticket.recurrence_end_date,
    recurrence_rule: ticket.recurrence_rule,
    tags: tags.length > 0 ? tags : undefined,
  }
}

/**
 * Inbox用データ取得フック
 * Board/Table共通のデータを取得
 *
 * @param filters - フィルター条件
 * @returns Inboxアイテム、ローディング状態、エラー情報
 *
 * @example
 * ```tsx
 * const { items, isLoading, error } = useInboxData({ status: 'open' })
 *
 * if (isLoading) return <div>Loading...</div>
 * if (error) return <div>Error: {error.message}</div>
 *
 * return (
 *   <div>
 *     {items.map(item => (
 *       <div key={item.id}>{item.title}</div>
 *     ))}
 *   </div>
 * )
 * ```
 */
export function useInboxData(filters: InboxFilters = {}) {
  // Ticketsの取得（リアルタイム性最適化済み）
  const {
    data: ticketsData,
    isLoading,
    error,
  } = useTickets({
    status: filters.status,
    search: filters.search,
  })

  // PlanをInboxItemに変換
  // APIレスポンスは部分的な型なので、unknown経由でキャスト
  let items: InboxItem[] =
    ticketsData?.map((t) =>
      ticketToInboxItem(
        t as unknown as Plan & { ticket_tags?: Array<{ tags: { id: string; name: string; color?: string } }> }
      )
    ) || []

  // タグフィルタリング（クライアント側）
  if (filters.tags && filters.tags.length > 0) {
    items = items.filter((item) => {
      // アイテムのタグIDを抽出
      const itemTagIds = item.tags?.map((tag) => tag.id) || []
      // フィルタータグのいずれかに一致するかチェック（OR条件）
      return filters.tags!.some((filterTagId) => itemTagIds.includes(filterTagId))
    })
  }

  // 期限フィルタリング（クライアント側）
  if (filters.dueDate && filters.dueDate !== 'all') {
    items = items.filter((item) => matchesDueDateFilter(item.due_date, filters.dueDate!))
  }

  // 更新日時の降順でソート
  items.sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  return {
    items,
    tickets: ticketsData || [],
    isLoading,
    error,
  }
}

/**
 * Tickets専用データ取得フック
 * useInboxDataのエイリアス
 *
 * @param filters - フィルター条件
 * @returns Ticketsデータ
 */
export function useInboxTickets(filters: InboxFilters = {}) {
  return useInboxData(filters)
}
