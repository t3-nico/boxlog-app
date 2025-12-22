import { Skeleton } from '@/components/ui/skeleton'
import { KanbanCardSkeleton } from './KanbanCardSkeleton'

interface KanbanColumnSkeletonProps {
  /**
   * 表示するスケルトンカードの数
   * @default 3
   */
  cardCount?: number
}

/**
 * Kanbanカラムのスケルトンローディング
 *
 * データ読み込み中に表示されるカラムのプレースホルダー
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <KanbanColumnSkeleton cardCount={5} />
 * ) : (
 *   <KanbanColumn column={column} />
 * )}
 * ```
 */
export function KanbanColumnSkeleton({ cardCount = 3 }: KanbanColumnSkeletonProps) {
  return (
    <div className="bg-surface-container flex h-full w-72 shrink-0 flex-col gap-4 rounded-xl border p-4 sm:w-80">
      {/* カラムヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* カラムタイトル */}
          <Skeleton className="h-5 w-24" />
          {/* カウントバッジ */}
          <Skeleton className="size-6 rounded-full" />
        </div>
        {/* 追加ボタン */}
        <Skeleton className="size-8" />
      </div>

      {/* カードリスト */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: cardCount }).map((_, index) => (
          <KanbanCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
