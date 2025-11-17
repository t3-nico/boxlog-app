import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AlertCircle, MoreHorizontal } from 'lucide-react'
import type { KanbanCard as KanbanCardType } from '../../types'

interface KanbanCardProps {
  card: KanbanCardType
  columnId: string
  index: number
  onEdit?: (card: KanbanCardType) => void
  onDelete?: (cardId: string) => void
  isDragging?: boolean
}

/**
 * Kanbanカードコンポーネント（縦4列レイアウト）
 *
 * レイアウト:
 * 1. タイトル
 * 2. 時間（日付 + 開始-終了時刻）
 * 3. Tags（カラー付き）
 * 4. 優先順位
 */
export function KanbanCard({ card, columnId, index, onEdit, onDelete, isDragging = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      card,
      columnId,
      index,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // 優先度ラベル
  const priorityLabel: Record<'low' | 'medium' | 'high', string> = {
    low: '低',
    medium: '中',
    high: '高',
  }

  // 優先度の色
  const priorityColor: Record<'low' | 'medium' | 'high', string> = {
    low: 'bg-blue-500/10 text-blue-700 border-blue-200',
    medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    high: 'bg-red-500/10 text-red-700 border-red-200',
  }

  // 時間フォーマット関数
  const formatDateTime = () => {
    if (!card.dueDate && !card.startTime && !card.endTime) return null

    const parts: string[] = []

    // 日付
    if (card.dueDate) {
      const date = new Date(card.dueDate)
      parts.push(date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }))
    }

    // 時間範囲
    if (card.startTime && card.endTime) {
      const start = new Date(card.startTime)
      const end = new Date(card.endTime)
      parts.push(
        `${start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
      )
    } else if (card.startTime) {
      const start = new Date(card.startTime)
      parts.push(start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }))
    }

    return parts.join(' ')
  }

  const timeDisplay = formatDateTime()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-card relative flex flex-col gap-2 rounded-lg p-3 shadow-sm transition-all hover:shadow-md',
        'border-border cursor-pointer border',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg',
        card.isBlocked && 'border-l-destructive border-l-4',
        'touch-none'
      )}
      {...attributes}
      {...listeners}
    >
      {/* ブロック状態バナー */}
      {card.isBlocked && (
        <div className="bg-destructive/10 flex items-center gap-1.5 rounded px-2 py-1">
          <AlertCircle className="text-destructive size-3" />
          <span className="text-destructive text-xs font-medium">ブロック中</span>
          {card.blockedReason && <span className="text-muted-foreground text-xs">: {card.blockedReason}</span>}
        </div>
      )}

      {/* メニューボタン（右上固定） */}
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="カードメニュー"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(card)}>編集</DropdownMenuItem>
            <DropdownMenuItem>複製</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(card.id)}>
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 1. タイトル */}
      <div className="pr-6">
        <h3 className="text-foreground flex items-baseline gap-2 text-sm leading-tight font-medium">
          <span>{card.title}</span>
          {card.ticketNumber && <span className="text-muted-foreground shrink-0 text-xs">#{card.ticketNumber}</span>}
        </h3>
      </div>

      {/* 2. 時間 */}
      {timeDisplay && (
        <div className="text-muted-foreground flex items-center text-xs">
          <span>{timeDisplay}</span>
        </div>
      )}

      {/* 3. Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={typeof tag === 'string' ? tag : tag.id}
              className="bg-muted text-muted-foreground border-border rounded border px-2 py-0.5 text-xs"
              style={
                typeof tag !== 'string' && tag.color
                  ? {
                      backgroundColor: `${tag.color}20`,
                      borderColor: tag.color,
                      color: tag.color,
                    }
                  : undefined
              }
            >
              {typeof tag === 'string' ? tag : tag.name}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="bg-muted text-muted-foreground border-border rounded border px-2 py-0.5 text-xs">
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 4. 優先順位 */}
      <div>
        <span
          className={cn(
            'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium',
            priorityColor[card.priority]
          )}
        >
          優先度: {priorityLabel[card.priority]}
        </span>
      </div>
    </div>
  )
}
