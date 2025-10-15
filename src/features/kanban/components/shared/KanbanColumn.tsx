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
 * Kanbanカラムコンポーネント（ClickUp風デザイン）
 *
 * シンプルで実用的なカラムデザイン
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

  // WIP制限チェック
  const isOverWipLimit = column.wipLimit !== undefined && column.cards.length >= column.wipLimit
  const wipWarning = column.wipLimit !== undefined && column.cards.length === column.wipLimit - 1

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'bg-muted/30 flex h-full w-80 shrink-0 flex-col gap-3 rounded-lg p-3 transition-colors',
        isOver && 'bg-accent/20 ring-primary/30 ring-2',
        isOverWipLimit && 'ring-destructive/50 ring-2' // WIP制限超過時
      )}
    >
      {/* カラムヘッダー */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-sm font-semibold">{column.title}</h3>
          {/* カード数 / WIP制限 */}
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-full text-xs font-medium',
              isOverWipLimit && 'bg-destructive text-destructive-foreground',
              wipWarning && 'bg-yellow-500 text-white',
              !isOverWipLimit && !wipWarning && 'bg-muted text-muted-foreground'
            )}
          >
            {column.cards.length}
            {column.wipLimit && <span className="ml-0.5 text-[10px]">/{column.wipLimit}</span>}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-background size-7"
          onClick={() => onAddCard?.(column.id)}
          aria-label={`${column.title}にカードを追加`}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* カードリスト */}
      <ScrollArea className="flex-1">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 pr-3">
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
          <div className="border-border/50 flex h-24 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground text-xs">ドロップしてカードを追加</p>
          </div>
        )}
      </ScrollArea>

      {/* カード追加ボタン */}
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:bg-background hover:text-foreground w-full justify-start gap-2"
        onClick={() => onAddCard?.(column.id)}
      >
        <Plus className="size-4" />
        <span className="text-xs">カードを追加</span>
      </Button>
    </div>
  )
}
