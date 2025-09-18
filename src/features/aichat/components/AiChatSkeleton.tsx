'use client'

import { colors, rounded } from '@/config/theme'

export const AiChatSkeleton = () => {
  return (
    <div className="flex h-full">
      {/* Main chat area skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className={`flex items-center justify-between border-b ${colors.border.default} p-4`}>
          <div className={`h-6 w-32 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          <div className="flex gap-2">
            <div className={`h-8 w-8 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
            <div className={`h-8 w-8 ${colors.background.muted} ${rounded.sm} animate-pulse`}></div>
          </div>
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 space-y-4 p-4">
          {/* User message skeleton */}
          <div className="flex justify-end">
            <div className={`max-w-xs p-3 ${colors.background.muted} ${rounded.lg} animate-pulse`}>
              <div className={`h-4 w-32 ${colors.background.accent} ${rounded.sm}`}></div>
            </div>
          </div>

          {/* AI message skeleton */}
          <div className="flex justify-start">
            <div className={`max-w-md p-3 ${colors.background.accent} ${rounded.lg} animate-pulse`}>
              <div className="space-y-2">
                <div className={`h-4 w-full ${colors.background.muted} ${rounded.sm}`}></div>
                <div className={`h-4 w-3/4 ${colors.background.muted} ${rounded.sm}`}></div>
                <div className={`h-4 w-1/2 ${colors.background.muted} ${rounded.sm}`}></div>
              </div>
            </div>
          </div>

          {/* Another user message skeleton */}
          <div className="flex justify-end">
            <div className={`max-w-sm p-3 ${colors.background.muted} ${rounded.lg} animate-pulse`}>
              <div className={`h-4 w-24 ${colors.background.accent} ${rounded.sm}`}></div>
            </div>
          </div>
        </div>

        {/* Input area skeleton */}
        <div className={`border-t ${colors.border.default} p-4`}>
          <div className="flex gap-2">
            <div className={`h-10 flex-1 ${colors.background.muted} ${rounded.md} animate-pulse`}></div>
            <div className={`h-10 w-10 ${colors.background.muted} ${rounded.md} animate-pulse`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
