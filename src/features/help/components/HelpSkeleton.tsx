'use client'

export const HelpSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex-shrink-0 border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            <div>
              <div className="h-5 w-32 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="mt-1 h-4 w-48 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>
      </div>

      {/* Chat messages skeleton */}
      <div className="flex-1 space-y-6 px-6 py-6">
        {/* Assistant message skeleton */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-4 w-3/4 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-4 w-1/2 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>

        {/* User message skeleton */}
        <div className="flex items-start justify-end gap-3">
          <div className="max-w-md flex-1">
            <div className="h-4 w-full animate-pulse rounded-sm bg-neutral-100 dark:bg-neutral-800"></div>
          </div>
          <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
        </div>

        {/* Another assistant message skeleton */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-4 w-5/6 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="flex-shrink-0 border-t border-border p-6">
        <div className="space-y-3">
          {/* Loading indicator skeleton */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
              <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
            <div className="h-4 w-32 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
          </div>

          {/* Input area */}
          <div className="animate-pulse rounded-lg bg-neutral-200 p-4 dark:bg-neutral-700">
            <div className="flex items-end gap-2">
              <div className="h-10 flex-1 rounded-md bg-neutral-100 dark:bg-neutral-800"></div>
              <div className="h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
