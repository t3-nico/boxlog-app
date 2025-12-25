import { Skeleton } from '@/components/ui/skeleton';

/**
 * 統計ページのローディングUI
 * ページ遷移時に即座に表示され、体感速度を向上
 */
export default function StatsLoading() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Loading stats"
    >
      {/* サマリーカード（3列） */}
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>

      {/* 年次グリッド（ヒートマップ） */}
      <Skeleton className="h-[200px] w-full" />

      {/* ストリーク */}
      <Skeleton className="h-[160px] w-full" />

      {/* 予定合計時間 + タグ別時間（2列） */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[160px]" />
        <Skeleton className="h-[300px]" />
      </div>

      {/* 時間帯別 + 曜日別（2列） */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>

      {/* 月次トレンド */}
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}
