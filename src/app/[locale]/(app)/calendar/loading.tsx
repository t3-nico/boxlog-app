import { Skeleton } from '@/components/ui/skeleton'

/**
 * カレンダーページのローディングUI
 * ページ遷移時に即座に表示され、体感速度を向上
 */
export default function CalendarLoading() {
  return (
    <div className="flex h-full flex-1 flex-col" role="status" aria-live="polite" aria-label="Loading calendar">
      {/* ヘッダー部分 */}
      <div className="border-border flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="flex flex-1 flex-col p-4">
        {/* 時間列 + グリッド */}
        <div className="flex flex-1 gap-2">
          {/* 時間ラベル列 */}
          <div className="flex w-12 flex-col gap-4 pt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* グリッド本体 */}
          <div className="flex flex-1 flex-col gap-2">
            {/* 日付ヘッダー */}
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 flex-1" />
              ))}
            </div>

            {/* イベントエリア */}
            <div className="flex flex-1 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
