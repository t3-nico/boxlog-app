import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { KanbanCard as KanbanCardType, KanbanColumnColor, KanbanColumn as KanbanColumnType } from '../../types'
import { MobileKanbanCard } from './MobileKanbanCard'

// ClickUp風カラー定義
const columnColorClasses: Record<KanbanColumnColor, string> = {
  blue: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  purple: 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  pink: 'bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800',
  green: 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  yellow: 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
  orange: 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
  red: 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  gray: 'bg-muted/30 border-border',
}

interface MobileKanbanColumnProps {
  column: KanbanColumnType
  onAddCard?: (columnId: string) => void
  onEditCard?: (card: KanbanCardType) => void
  onDeleteCard?: (cardId: string) => void
  onCardTap?: (card: KanbanCardType) => void
  selectedCardId?: string
}

/**
 * モバイル専用Kanbanカラムコンポーネント
 *
 * 縦スクロールレイアウト対応
 */
export function MobileKanbanColumn({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onCardTap,
  selectedCardId,
}: MobileKanbanColumnProps) {
  // WIP制限チェック
  const isOverWipLimit = column.wipLimit !== undefined && column.cards.length >= column.wipLimit
  const wipWarning = column.wipLimit !== undefined && column.cards.length === column.wipLimit - 1

  // カラム背景色（デフォルトはgray）
  const colorClass = columnColorClasses[column.color || 'gray']

  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border p-4', colorClass)}>
      {/* カラムヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-foreground text-base font-semibold">{column.title}</h3>
          {/* カード数 / WIP制限 */}
          <span
            className={cn(
              'flex size-6 items-center justify-center rounded-full text-xs font-medium',
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
          className="hover:bg-background size-8"
          onClick={() => onAddCard?.(column.id)}
          aria-label={`${column.title}にカードを追加`}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      {/* カードリスト */}
      <div className="flex flex-col gap-3">
        {column.cards.map((card) => (
          <MobileKanbanCard
            key={card.id}
            card={card}
            onEdit={onEditCard}
            onDelete={onDeleteCard}
            onTap={onCardTap}
            isSelected={selectedCardId === card.id}
          />
        ))}

        {/* 空状態 */}
        {column.cards.length === 0 && (
          <div className="border-border/50 flex h-24 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground text-sm">タップしてカードを追加</p>
          </div>
        )}
      </div>

      {/* カード追加ボタン */}
      <Button
        variant="ghost"
        size="lg"
        className="text-muted-foreground hover:bg-background hover:text-foreground min-h-[48px] w-full justify-start gap-2"
        onClick={() => onAddCard?.(column.id)}
      >
        <Plus className="size-5" />
        <span className="text-sm">カードを追加</span>
      </Button>
    </div>
  )
}
