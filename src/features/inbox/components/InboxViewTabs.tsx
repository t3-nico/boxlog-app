'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

type ViewType = 'board' | 'table'

export function InboxViewTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentView = (searchParams?.get('view') as ViewType) || 'board'

  const handleViewChange = useCallback(
    (view: ViewType) => {
      const params = new URLSearchParams(searchParams?.toString() || '')
      params.set('view', view)
      router.push(`/inbox?${params.toString()}`)
    },
    [searchParams, router]
  )

  return (
    <div role="tablist" aria-label="Inbox view selector" className="bg-muted inline-flex items-center rounded-lg p-1">
      <button
        role="tab"
        aria-selected={currentView === 'board'}
        aria-controls="inbox-view-panel"
        onClick={() => handleViewChange('board')}
        className={`focus-visible:ring-ring rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          currentView === 'board'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        } `}
      >
        Board
      </button>
      <button
        role="tab"
        aria-selected={currentView === 'table'}
        aria-controls="inbox-view-panel"
        onClick={() => handleViewChange('table')}
        className={`focus-visible:ring-ring rounded-md px-4 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
          currentView === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        } `}
      >
        Table
      </button>
    </div>
  )
}
