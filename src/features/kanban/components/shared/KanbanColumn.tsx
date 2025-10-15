import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { KanbanCard as KanbanCardType, KanbanColumn as KanbanColumnType } from '../../types'
import { KanbanCard } from './KanbanCard'

interface KanbanColumnProps {
  column: KanbanColumnType
  onAddCard?: (columnId: string) => void
  onEditCard?: (card: KanbanCardType) => void
  onDeleteCard?: (cardId: string) => void
}

/**
 * Kanbanカラムコンポーネント
 *
 * ドロップ可能なエリアとして機能し、内部のカードをソート可能
 *
 * @example
 * ```tsx
 * <KanbanColumn
 *   column={column}
 *   onAddCard={(id) => console.log('Add card to', id)}
 *   onEditCard={(card) => console.log('Edit', card)}
 *   onDeleteCard={(id) => console.log('Delete', id)}
 * />
 * ```
 */
export function KanbanColumn({ column, onAddCard, onEditCard, onDeleteCard }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      columnId: column.id,
      status: column.status,
    },
  })

  const cardIds = column.cards.map((card) => card.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-muted/20 flex h-full w-80 shrink-0 flex-col gap-4 rounded-lg border p-4 transition-colors',
        isOver && 'bg-accent/10 ring-primary/20 ring-2'
      )}
    >
      {/* カラムヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{column.title}</h3>
          <span className="text-muted-foreground bg-background flex size-6 items-center justify-center rounded-full text-xs">
            {column.cards.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => onAddCard?.(column.id)}
          aria-label={`${column.title}にカードを追加`}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* カードリスト */}
      <ScrollArea className="flex-1 pr-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {column.cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                columnId={column.id}
                index={index}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
              />
            ))}
          </div>
        </SortableContext>

        {/* 空状態 */}
        {column.cards.length === 0 && (
          <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground text-sm">カードをドロップ</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
