'use client'

import React from 'react'

interface MainContentWrapperProps {
  children: React.ReactNode
}

/**
 * メインコンテンツラッパー
 *
 * シンプルなmain要素ラッパー
 * TicketInspectorはSheetで表示されるため、レイアウト調整不要
 */
export function MainContentWrapper({ children }: MainContentWrapperProps) {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <main id="main-content" className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" role="main">
        {children}
      </main>
    </div>
  )
}
