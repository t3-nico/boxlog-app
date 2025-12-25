'use client';

import { cn } from '@/lib/utils';

/**
 * CalendarSkeleton - カレンダー読み込み中のスケルトン画面
 * BoxLogの3カラムレイアウト（AppBar + Sidebar + Main）に最適化
 *
 * レイアウト構造:
 * - AppBar（64px）は layout.tsx で管理
 * - Sidebar（240px）は layout.tsx で管理
 * - このコンポーネントは Main エリアのみを表示
 */
export const CalendarSkeleton = () => {
  return (
    <div className="bg-background flex h-full w-full flex-col">
      {/* Header skeleton */}
      <div className={cn('border-border bg-card border-b p-4')}>
        <div className="flex items-center justify-between">
          {/* Left: Date navigation */}
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'bg-surface-container h-9 w-9 animate-pulse rounded-md motion-reduce:animate-none',
              )}
            ></div>
            <div
              className={cn(
                'bg-surface-container h-7 w-40 animate-pulse rounded-md motion-reduce:animate-none',
              )}
            ></div>
            <div
              className={cn(
                'bg-surface-container h-9 w-9 animate-pulse rounded-md motion-reduce:animate-none',
              )}
            ></div>
          </div>

          {/* Right: View switcher and actions */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'bg-surface-container h-9 w-16 animate-pulse rounded-md motion-reduce:animate-none',
                )}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="flex flex-1 overflow-hidden p-4">
        <div className="flex h-full w-full flex-col">
          {/* Week day headers */}
          <div className="mb-2 flex">
            <div className="w-16 shrink-0" /> {/* Time column spacer */}
            <div className="grid flex-1 grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'bg-surface-container h-10 animate-pulse rounded-md motion-reduce:animate-none',
                  )}
                ></div>
              ))}
            </div>
          </div>

          {/* Time grid */}
          <div className="flex flex-1 overflow-hidden">
            {/* Time column */}
            <div className="w-16 shrink-0 space-y-1 pr-2">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'bg-surface-container/50 h-12 animate-pulse rounded-sm motion-reduce:animate-none',
                  )}
                ></div>
              ))}
            </div>

            {/* Calendar columns */}
            <div className="grid flex-1 grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="border-border relative flex flex-col space-y-px border-l"
                >
                  {/* Time slots */}
                  {Array.from({ length: 24 }).map((_, timeIndex) => (
                    <div
                      key={timeIndex}
                      className={cn(
                        'border-border/50 h-12 border-b',
                        timeIndex % 2 === 0 ? 'bg-background' : 'bg-surface-container/10',
                      )}
                    ></div>
                  ))}

                  {/* Sample event blocks */}
                  {dayIndex % 3 === 0 && (
                    <div
                      style={{ top: '160px', height: '96px' }}
                      className={cn(
                        'bg-primary/20 border-primary/30 absolute right-1 left-1 animate-pulse rounded-md border motion-reduce:animate-none',
                      )}
                    ></div>
                  )}
                  {dayIndex === 2 && (
                    <div
                      style={{ top: '320px', height: '64px' }}
                      className={cn(
                        'bg-surface-container border-muted-foreground/20 absolute right-1 left-1 animate-pulse rounded-md border motion-reduce:animate-none',
                      )}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
