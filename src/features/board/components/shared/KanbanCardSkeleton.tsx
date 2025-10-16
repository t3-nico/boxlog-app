import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Kanbanカードのスケルトンローディング
 *
 * データ読み込み中に表示されるプレースホルダー
 *
 * @example
 * ```tsx
 * {isLoading ? <KanbanCardSkeleton /> : <KanbanCard card={card} />}
 * ```
 */
export function KanbanCardSkeleton() {
  return (
    <Card className="cursor-default">
      <CardHeader className="gap-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          {/* タイトル */}
          <Skeleton className="h-4 w-3/4" />
          {/* メニューボタン */}
          <Skeleton className="size-6 shrink-0" />
        </div>
        {/* 優先度バッジ */}
        <Skeleton className="h-5 w-12" />
      </CardHeader>

      <CardContent className="gap-3 pt-0">
        {/* 説明 */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* タグ */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* メタ情報 */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
