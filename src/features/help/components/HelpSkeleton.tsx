'use client'

import { cn } from '@/lib/utils'

export const HelpSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"
            ></div>
            <div>
              <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
              <div className="mt-1 h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Chat messages skeleton */}
      <div className="flex-1 space-y-6 px-6 py-6">
        {/* Assistant message skeleton */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex-shrink-0 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
            <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
            <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
          </div>
        </div>

        {/* User message skeleton */}
        <div className="flex items-start justify-end gap-3">
          <div className="max-w-md flex-1">
            <div className="h-4 w-full bg-neutral-100 dark:bg-neutral-800 rounded-sm animate-pulse"></div>
          </div>
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex-shrink-0 animate-pulse"></div>
        </div>

        {/* Another assistant message skeleton */}
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full flex-shrink-0 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
            <div className="h-4 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="flex-shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-6">
        <div className="space-y-3">
          {/* Loading indicator skeleton */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
              <div className="h-2 w-2 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-sm animate-pulse"></div>
          </div>

          {/* Input area */}
          <div className="bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse p-4">
            <div className="flex items-end gap-2">
              <div className="h-10 flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-md"></div>
              <div className="h-8 w-8 bg-neutral-100 dark:bg-neutral-800 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
