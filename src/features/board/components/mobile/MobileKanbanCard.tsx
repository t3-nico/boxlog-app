import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { AlertCircle, Calendar, MoreHorizontal, User } from 'lucide-react'
import type { KanbanCard as KanbanCardType } from '../../types'

interface MobileKanbanCardProps {
  card: KanbanCardType
  onEdit?: (card: KanbanCardType) => void
  onDelete?: (cardId: string) => void
  onTap?: (card: KanbanCardType) => void
  isSelected?: boolean
}

/**
 * モバイル専用Kanbanカードコンポーネント
 *
 * タップ&セレクトモード対応 + タッチターゲット最適化（最低44px）
 */
export function MobileKanbanCard({ card, onEdit, onDelete, onTap, isSelected = false }: MobileKanbanCardProps) {
  // 優先度の色（ドット）
  const priorityColor = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500',
  }

  const handleCardTap = () => {
    onTap?.(card)
  }

  return (
    <div
      onClick={handleCardTap}
      className={cn(
        'group bg-card relative min-h-[88px] cursor-pointer rounded-lg p-4 shadow-sm transition-all',
        'border-border border',
        'active:scale-[0.98]', // タッチフィードバック
        isSelected && 'ring-primary shadow-lg ring-2', // 選択状態
        card.isBlocked && 'border-l-destructive border-l-4' // ブロック状態
      )}
    >
      {/* ブロック状態バナー */}
      {card.isBlocked && (
        <div className="bg-destructive/10 mb-3 flex items-center gap-2 rounded px-3 py-1.5">
          <AlertCircle className="text-destructive size-4" />
          <span className="text-destructive text-sm font-medium">ブロック中</span>
          {card.blockedReason && <span className="text-muted-foreground text-sm">: {card.blockedReason}</span>}
        </div>
      )}

      {/* ヘッダー：優先度ドット + メニュー */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* 優先度ドット */}
          <div className={cn('size-2.5 shrink-0 rounded-full', priorityColor[card.priority])} />
          <h3 className="text-foreground line-clamp-2 text-base leading-snug font-medium">{card.title}</h3>
        </div>

        {/* メニューボタン（タッチターゲット44px） */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 min-h-[44px] min-w-[44px] shrink-0"
              aria-label="カードメニュー"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(card)
              }}
            >
              編集
            </DropdownMenuItem>
            <DropdownMenuItem>複製</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete?.(card.id)
              }}
            >
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 説明 */}
      {card.description && <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">{card.description}</p>}

      {/* タグ */}
      {card.tags && card.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {card.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="bg-muted text-muted-foreground rounded px-2.5 py-1 text-xs">
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="bg-muted text-muted-foreground rounded px-2.5 py-1 text-xs">+{card.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* フッター：担当者・期限 */}
      {(card.assignee || card.dueDate) && (
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          {card.assignee && (
            <div className="flex items-center gap-1.5">
              <User className="size-4" />
              <span className="line-clamp-1">{card.assignee}</span>
            </div>
          )}
          {card.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>{new Date(card.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
