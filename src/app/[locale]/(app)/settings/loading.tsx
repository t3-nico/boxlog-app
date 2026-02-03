import { Skeleton } from '@/components/ui/skeleton';

/**
 * 設定ページのローディングUI
 * ページ遷移時に即座に表示され、体感速度を向上
 */
export default function SettingsLoading() {
  return (
    <div
      className="flex h-full w-full"
      role="status"
      aria-live="polite"
      aria-label="Loading settings"
    >
      {/* モバイル用サイドバースケルトン */}
      <aside className="border-border flex h-full w-full flex-shrink-0 flex-col border-r md:hidden">
        {/* ヘッダー */}
        <div className="border-border flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-6 w-24" />
        </div>

        {/* カテゴリリスト */}
        <div className="flex flex-col gap-1 p-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </aside>

      {/* PC用コンテンツスケルトン */}
      <div className="hidden h-full flex-1 flex-col p-6 md:flex">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
