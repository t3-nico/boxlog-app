'use client'

export const AiChatSkeleton = () => {
  return (
    <div className="flex h-full">
      {/* Main chat area skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="h-6 w-32 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-8 w-8 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 space-y-4 p-4">
          {/* User message skeleton */}
          <div className="flex justify-end">
            <div className="max-w-xs animate-pulse rounded-lg bg-neutral-200 p-3 dark:bg-neutral-700">
              <div className="h-4 w-32 rounded-sm bg-neutral-300 dark:bg-neutral-600"></div>
            </div>
          </div>

          {/* AI message skeleton */}
          <div className="flex justify-start">
            <div className="max-w-md animate-pulse rounded-lg bg-neutral-300 p-3 dark:bg-neutral-600">
              <div className="space-y-2">
                <div className="h-4 w-full rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-3/4 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-1/2 rounded-sm bg-neutral-200 dark:bg-neutral-700"></div>
              </div>
            </div>
          </div>

          {/* Another user message skeleton */}
          <div className="flex justify-end">
            <div className="max-w-sm animate-pulse rounded-lg bg-neutral-200 p-3 dark:bg-neutral-700">
              <div className="h-4 w-24 rounded-sm bg-neutral-300 dark:bg-neutral-600"></div>
            </div>
          </div>
        </div>

        {/* Input area skeleton */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <div className="h-10 flex-1 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="h-10 w-10 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
