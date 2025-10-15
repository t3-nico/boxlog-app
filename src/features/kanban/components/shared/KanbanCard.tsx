import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Calendar, MoreVertical, User } from 'lucide-react'
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
 * Kanbanカードコンポーネント
 *
 * shadcn/ui Cardをベースに、dnd-kit対応したドラッグ可能なカード
 *
 * @example
 * ```tsx
 * <KanbanCard
 *   card={card}
 *   columnId={columnId}
 *   index={0}
 *   onEdit={(card) => console.log('Edit', card)}
 *   onDelete={(id) => console.log('Delete', id)}
 * />
 * ```
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

  const priorityVariant = {
    low: 'outline' as const,
    medium: 'secondary' as const,
    high: 'destructive' as const,
  }

  const priorityLabel = {
    low: '低',
    medium: '中',
    high: '高',
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        (isDragging || isSortableDragging) && 'rotate-3 opacity-50',
        'touch-none' // タッチ操作でのスクロール防止
      )}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="gap-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-sm">{card.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-6 shrink-0" aria-label="カードメニュー">
                <MoreVertical className="size-4" />
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
        <Badge variant={priorityVariant[card.priority]} className="w-fit">
          {priorityLabel[card.priority]}
        </Badge>
      </CardHeader>

      <CardContent className="gap-3 pt-0">
        {card.description && <p className="text-muted-foreground line-clamp-2 text-xs">{card.description}</p>}

        {/* タグ */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {card.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{card.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* メタ情報 */}
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
      </CardContent>
    </Card>
  )
}
