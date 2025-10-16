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
import { AlertCircle, Calendar, MoreHorizontal, User } from 'lucide-react'
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
 * Kanbanカードコンポーネント（ClickUp風デザイン）
 *
 * シンプルで実用的なカードデザイン
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

  // 優先度の色（ドット）
  const priorityColor = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-card relative rounded-lg p-3 shadow-sm transition-all hover:shadow-md',
        'border-border cursor-pointer border',
        (isDragging || isSortableDragging) && 'opacity-50 shadow-lg',
        card.isBlocked && 'border-l-destructive border-l-4', // ブロック状態の視覚化
        'touch-none'
      )}
      {...attributes}
      {...listeners}
    >
      {/* ブロック状態バナー */}
      {card.isBlocked && (
        <div className="bg-destructive/10 mb-2 flex items-center gap-1.5 rounded px-2 py-1">
          <AlertCircle className="text-destructive size-3" />
          <span className="text-destructive text-xs font-medium">ブロック中</span>
          {card.blockedReason && <span className="text-muted-foreground text-xs">: {card.blockedReason}</span>}
        </div>
      )}

      {/* ヘッダー：優先度ドット + メニュー */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* 優先度ドット */}
          <div className={cn('size-2 shrink-0 rounded-full', priorityColor[card.priority])} />
          <h3 className="text-foreground truncate text-sm leading-tight font-medium">{card.title}</h3>
        </div>

        {/* メニューボタン */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
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

      {/* 説明 */}
      {card.description && <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">{card.description}</p>}

      {/* タグ */}
      {card.tags && card.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">+{card.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* フッター：担当者・期限 */}
      {(card.assignee || card.dueDate) && (
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          {card.assignee && (
            <div className="flex items-center gap-1">
              <User className="size-3" />
              <span className="line-clamp-1">{card.assignee}</span>
            </div>
          )}
          {card.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>{new Date(card.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
