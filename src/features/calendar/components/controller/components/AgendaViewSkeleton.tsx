'use client';

import { Skeleton } from '@/components/ui/skeleton';

/**
 * AgendaView用スケルトンローダー
 *
 * リスト構造のスケルトン（GAFA基準：コンテンツ構造に合わせる）
 * - 日付 + 時間（上段）
 * - タイトル + タグ（下段）
 * - shadcn/ui Skeleton で統一（pulse/shimmer対応）
 */
export function AgendaViewSkeleton() {
  return (
    <div className="bg-background flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="divide-border divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-2 md:px-4 md:py-4">
            {/* 上段: 日付・時間 */}
            <div className="mb-1 flex items-center gap-2">
              <Skeleton className="h-4 w-10" />
              <div className="bg-surface-container/50 hidden h-4 w-1 md:block" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* 下段: タイトル・タグ */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 max-w-48 flex-1" />
              <Skeleton className="h-4 w-14 opacity-50" />
              <Skeleton className="hidden h-4 w-14 opacity-50 md:block" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
