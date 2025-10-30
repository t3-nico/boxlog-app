'use client'

import type { InboxItem } from '@/features/inbox/hooks/useInboxData'
import { TicketKanbanBoard } from './TicketKanbanBoard'

/**
 * Kanbanボードコンポーネント（メイン）
 *
 * InboxItemデータを受け取り、ステータスごとにカラム表示
 *
 * @example
 * ```tsx
 * <KanbanBoard items={inboxItems} />
 * ```
 */
export function KanbanBoard({ items }: { items: InboxItem[] }) {
  return <TicketKanbanBoard items={items} />
}
