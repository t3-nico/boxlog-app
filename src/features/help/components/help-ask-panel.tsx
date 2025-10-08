'use client'

import React, { Suspense } from 'react'

import { useAskPanelStore } from '../stores/useAskPanelStore'

// 遅延ロード: AskPanelは重いコンポーネント（834行）のため、使用時のみロード
const AskPanel = React.lazy(() => import('./ask-panel').then((module) => ({ default: module.AskPanel })))

// ローディングフォールバック
const AskPanelSkeleton = () => (
  <div className="mx-auto h-full w-full max-w-6xl animate-pulse">
    <div className="flex h-full justify-center">
      <div className="w-full max-w-4xl space-y-4 p-4">
        <div className="h-12 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-64 rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-12 rounded bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  </div>
)

export const HelpAskPanel = () => {
  const { open, expand } = useAskPanelStore()

  // Ensure the panel is open and not collapsed when used in main content
  React.useEffect(() => {
    open() // Open the panel
    expand() // Ensure it's not collapsed
  }, [open, expand])

  return (
    <div className="mx-auto h-full w-full max-w-6xl">
      <div className="flex h-full justify-center">
        <div className="w-full max-w-4xl">
          <Suspense fallback={<AskPanelSkeleton />}>
            <AskPanel />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
