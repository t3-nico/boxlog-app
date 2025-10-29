'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type ViewType = 'board' | 'table'

/**
 * Inbox View Tabs Component
 *
 * Sidebar風アンダーラインタブデザイン
 * - Slack風の下部ボーダー表示
 * - セマンティックトークン使用
 */
export function InboxViewTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const currentView = (searchParams?.get('view') as ViewType) || 'board'

  const handleViewChange = useCallback(
    (view: ViewType) => {
      const urlParams = new URLSearchParams(searchParams?.toString() || '')
      urlParams.set('view', view)
      router.push(`/${locale}/inbox?${urlParams.toString()}`)
    },
    [searchParams, router, locale]
  )

  return (
    <div role="tablist" aria-label="Inbox view selector" className="flex h-10 items-center gap-0">
      <button
        role="tab"
        aria-selected={currentView === 'board'}
        aria-controls="inbox-view-panel"
        onClick={() => handleViewChange('board')}
        className={`focus-visible:ring-ring h-10 rounded-none border-b-2 px-4 py-0 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          currentView === 'board'
            ? 'border-primary text-foreground'
            : 'text-muted-foreground hover:border-primary/50 hover:text-foreground border-transparent'
        }`}
      >
        Board
      </button>
      <button
        role="tab"
        aria-selected={currentView === 'table'}
        aria-controls="inbox-view-panel"
        onClick={() => handleViewChange('table')}
        className={`focus-visible:ring-ring h-10 rounded-none border-b-2 px-4 py-0 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          currentView === 'table'
            ? 'border-primary text-foreground'
            : 'text-muted-foreground hover:border-primary/50 hover:text-foreground border-transparent'
        }`}
      >
        Table
      </button>
    </div>
  )
}
