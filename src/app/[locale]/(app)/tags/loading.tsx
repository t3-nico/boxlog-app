import { Skeleton } from '@/components/ui/skeleton';

/**
 * TagsページのローディングUI
 * ページ遷移時に即座に表示され、体感速度を向上
 */
export default function TagsLoading() {
  return (
    <div
      className="flex h-full flex-1 flex-col"
      role="status"
      aria-live="polite"
      aria-label="Loading tags"
    >
      {/* ヘッダー部分 */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>

      {/* タググリッド */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border-border flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
