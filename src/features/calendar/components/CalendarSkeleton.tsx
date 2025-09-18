'use client'

import { colors, rounded } from '@/config/theme'

export const CalendarSkeleton = () => {
  return (
    <div className="flex h-full">
      {/* Sidebar skeleton */}
      <div className={`w-80 border-r ${colors.border.default} space-y-4 p-4`}>
        {/* Mini calendar skeleton */}
        <div className="space-y-3">
          <div className={`h-6 w-24 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          <div className={`h-48 w-full ${colors.background.muted} ${rounded.lg} animate-pulse`}></div>
        </div>

        {/* Quick actions skeleton */}
        <div className="space-y-2">
          <div className={`h-5 w-20 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          <div className={`h-10 w-full ${colors.background.muted} ${rounded.md} animate-pulse`}></div>
        </div>

        {/* Navigation items skeleton */}
        <div className="space-y-2">
          <div className={`h-5 w-16 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          <div className="space-y-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-8 w-full ${colors.background.muted} ${rounded.md} animate-pulse`}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Main calendar area skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className={`border-b ${colors.border.default} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-8 w-8 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
              <div className={`h-6 w-32 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
              <div className={`h-8 w-8 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-8 w-12 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
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
                <div key={i} className={`h-12 w-full ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
              ))}
            </div>

            {/* Calendar columns skeleton */}
            <div className="ml-4 flex-1">
              <div className="grid h-full grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="flex flex-col space-y-1">
                    {/* Day header */}
                    <div className={`h-8 w-full ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>

                    {/* Time slots */}
                    <div className="flex-1 space-y-1">
                      {Array.from({ length: 12 }).map((_, timeIndex) => (
                        <div
                          key={timeIndex}
                          className={`h-12 w-full ${colors.background.accent} ${rounded.xs} animate-pulse`}
                        ></div>
                      ))}
                    </div>

                    {/* Sample events */}
                    {dayIndex % 3 === 0 && (
                      <div
                        className={`absolute mt-16 h-8 w-20 ${colors.background.muted} ${rounded.md} animate-pulse`}
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
