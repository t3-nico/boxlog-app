import { Skeleton } from '@/components/ui/skeleton'
import { KanbanColumnSkeleton } from './KanbanColumnSkeleton'

interface KanbanBoardSkeletonProps {
  /**
   * 表示するカラムの数
   * @default 3
   */
  columnCount?: number
  /**
   * 各カラムに表示するカードの数
   * @default 3
   */
  cardsPerColumn?: number
}

/**
 * Kanbanボード全体のスケルトンローディング
 *
 * 初回読み込み時やデータフェッチ中に表示
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <KanbanBoardSkeleton />
 * ) : (
 *   <KanbanBoard />
 * )}
 * ```
 */
export function KanbanBoardSkeleton({ columnCount = 3, cardsPerColumn = 3 }: KanbanBoardSkeletonProps) {
  return (
    <div className="flex h-full flex-col">
      {/* ボードヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          {/* タイトル */}
          <Skeleton className="h-8 w-48" />
          {/* 説明 */}
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      {/* カラムリスト */}
      <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
        {Array.from({ length: columnCount }).map((_, index) => (
          <KanbanColumnSkeleton key={index} cardCount={cardsPerColumn} />
        ))}
      </div>
    </div>
  )
}
