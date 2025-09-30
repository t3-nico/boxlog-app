'use client'

import { cn } from '@/lib/utils'

export const CalendarSkeleton = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <div className={cn('w-80 space-y-4 border-r border-neutral-200 p-4 dark:border-neutral-800')}>
        {/* Mini calendar skeleton */}
        <div className="space-y-3">
          <div className={cn('h-6 w-24 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
          <div className={cn('h-48 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700')}></div>
        </div>

        {/* Quick actions skeleton */}
        <div className="space-y-2">
          <div className={cn('h-5 w-20 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
          <div className={cn('h-10 w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700')}></div>
        </div>

        {/* Navigation items skeleton */}
        <div className="space-y-2">
          <div className={cn('h-5 w-16 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn('h-8 w-full animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700')}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main calendar area skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className={cn('border-b border-neutral-200 p-4 dark:border-neutral-800')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn('h-8 w-8 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
              <div className={cn('h-6 w-32 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
              <div className={cn('h-8 w-8 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn('h-8 w-12 animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar grid skeleton */}
        <div className="flex-1 p-4">
          {/* Time labels and grid skeleton */}
          <div className="flex h-full">
            {/* Time column skeleton */}
            <div className="w-16 space-y-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={cn('h-12 w-full animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>
              ))}
            </div>

            {/* Calendar columns skeleton */}
            <div className="ml-4 flex-1">
              <div className="grid h-full grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="flex flex-col space-y-1">
                    {/* Day header */}
                    <div className={cn('h-8 w-full animate-pulse rounded-sm bg-neutral-200 dark:bg-neutral-700')}></div>

                    {/* Time slots */}
                    <div className="flex-1 space-y-1">
                      {Array.from({ length: 12 }).map((_, timeIndex) => (
                        <div
                          key={timeIndex}
                          className={cn('h-12 w-full animate-pulse rounded-xs bg-neutral-100 dark:bg-neutral-800')}
                        ></div>
                      ))}
                    </div>

                    {/* Sample events */}
                    {dayIndex % 3 === 0 && (
                      <div
                        className={cn('absolute mt-16 h-8 w-20 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700')}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
