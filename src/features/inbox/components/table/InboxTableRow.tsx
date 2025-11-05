import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { useTicketInspectorStore } from '@/features/tickets/stores/useTicketInspectorStore'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { InboxItem } from '../../hooks/useInboxData'
import { InboxTableRowActions } from './InboxTableRowActions'

interface InboxTableRowProps {
  /** 表示するInboxアイテム */
  item: InboxItem
}

/**
 * ステータスバッジ表示
 */
function StatusBadge({ status }: { status: TicketStatus }) {
  const statusConfig: Record<
    TicketStatus,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
  > = {
    backlog: { label: '準備中', variant: 'secondary' },
    ready: { label: '配置済み', variant: 'outline' },
    active: { label: '作業中', variant: 'default' },
    wait: { label: '待ち', variant: 'secondary' },
    done: { label: '完了', variant: 'outline' },
    cancel: { label: '中止', variant: 'destructive' },
  }

  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

/**
 * Inboxテーブル行コンポーネント
 *
 * 行の表示ロジックを独立したコンポーネントに分離
 * - Inspector表示
 * - 日付フォーマット
 * - タグ表示
 * - アクションメニュー
 *
 * @example
 * ```tsx
 * <InboxTableRow item={item} />
 * ```
 */
export function InboxTableRow({ item }: InboxTableRowProps) {
  const { openInspector } = useTicketInspectorStore()

  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={() => openInspector(item.id)}>
      {/* チケット番号 */}
      <TableCell className="font-mono text-xs">{item.ticket_number || '-'}</TableCell>

      {/* タイトル */}
      <TableCell className="font-medium">{item.title}</TableCell>

      {/* ステータス */}
      <TableCell>
        <StatusBadge status={item.status} />
      </TableCell>

      {/* タグ */}
      <TableCell>
        <div className="flex gap-1">
          {item.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
          {item.tags && item.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{item.tags.length - 2}
            </Badge>
          )}
          {!item.tags || item.tags.length === 0 ? <span className="text-muted-foreground text-xs">-</span> : null}
        </div>
      </TableCell>

      {/* 期限 */}
      <TableCell className="text-muted-foreground text-sm">
        {item.due_date
          ? formatDistanceToNow(new Date(item.due_date), {
              addSuffix: true,
              locale: ja,
            })
          : '-'}
      </TableCell>

      {/* 作成日時 */}
      <TableCell className="text-muted-foreground text-sm">
        {formatDistanceToNow(new Date(item.created_at), {
          addSuffix: true,
          locale: ja,
        })}
      </TableCell>

      {/* アクション */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <InboxTableRowActions item={item} />
      </TableCell>
    </TableRow>
  )
}
