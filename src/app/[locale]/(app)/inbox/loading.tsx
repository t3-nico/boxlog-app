import { Skeleton } from '@/components/ui/skeleton';

/**
 * InboxページのローディングUI
 * ページ遷移時に即座に表示され、体感速度を向上
 *
 * CLS対策:
 * - 行数を5に制限（実データより少なければCLSは起きにくい）
 * - min-heightでコンテナサイズを安定化
 */
export default function InboxLoading() {
  return (
    <div
      className="flex h-full min-h-[400px] flex-1 flex-col"
      role="status"
      aria-live="polite"
      aria-label="Loading inbox"
    >
      {/* ヘッダー部分 */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* テーブルヘッダー */}
      <div className="border-border flex items-center gap-4 border-b px-4 py-3">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="ml-auto h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* テーブル行（5行に制限してCLS軽減） */}
      <div className="flex flex-1 flex-col">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-border flex items-center gap-4 border-b px-4 py-4">
            <Skeleton className="h-4 w-4" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
