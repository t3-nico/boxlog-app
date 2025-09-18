'use client'

import { colors, rounded } from '@/config/theme'

export const HelpSkeleton = () => {
  return (
    <div className="flex h-full flex-col">
      {/* Header skeleton */}
      <div className={`flex-shrink-0 border-b ${colors.border.default} p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 ${colors.background.muted} ${rounded.component.media.avatar} animate-pulse`}
            ></div>
            <div>
              <div className={`h-5 w-32 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
              <div className={`mt-1 h-4 w-48 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-8 w-8 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          </div>
        </div>
      </div>

      {/* Chat messages skeleton */}
      <div className="flex-1 space-y-6 px-6 py-6">
        {/* Assistant message skeleton */}
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 ${colors.background.muted} ${rounded.full} flex-shrink-0 animate-pulse`}></div>
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-full ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
            <div className={`h-4 w-3/4 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
            <div className={`h-4 w-1/2 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          </div>
        </div>

        {/* User message skeleton */}
        <div className="flex items-start justify-end gap-3">
          <div className="max-w-md flex-1">
            <div className={`h-4 w-full ${colors.background.accent} ${rounded.sm} animate-pulse`}></div>
          </div>
          <div className={`h-8 w-8 ${colors.background.muted} ${rounded.full} flex-shrink-0 animate-pulse`}></div>
        </div>

        {/* Another assistant message skeleton */}
        <div className="flex items-start gap-3">
          <div className={`h-8 w-8 ${colors.background.muted} ${rounded.full} flex-shrink-0 animate-pulse`}></div>
          <div className="flex-1 space-y-2">
            <div className={`h-4 w-full ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
            <div className={`h-4 w-5/6 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          </div>
        </div>
      </div>

      {/* Input area skeleton */}
      <div className={`flex-shrink-0 border-t ${colors.border.default} p-6`}>
        <div className="space-y-3">
          {/* Loading indicator skeleton */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className={`h-2 w-2 ${colors.background.muted} ${rounded.full} animate-pulse`}></div>
              <div className={`h-2 w-2 ${colors.background.muted} ${rounded.full} animate-pulse`}></div>
              <div className={`h-2 w-2 ${colors.background.muted} ${rounded.full} animate-pulse`}></div>
            </div>
            <div className={`h-4 w-32 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          </div>

          {/* Input area */}
          <div className={`${colors.background.muted} ${rounded.lg} animate-pulse p-4`}>
            <div className="flex items-end gap-2">
              <div className={`h-10 flex-1 ${colors.background.accent} ${rounded.md}`}></div>
              <div className={`h-8 w-8 ${colors.background.accent} ${rounded.md}`}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
