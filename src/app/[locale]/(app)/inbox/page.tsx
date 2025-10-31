'use client'

import { InboxBoardView } from '@/features/inbox/components/InboxBoardView'
import { Suspense } from 'react'

/**
 * Inboxページ
 *
 * Board View のみ表示
 */
function InboxContent() {
  return <InboxBoardView />
}

export default function InboxPage() {
  return (
    <div className="flex h-full flex-col">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground text-sm">読み込み中...</p>
            </div>
          </div>
        }
      >
        <InboxContent />
      </Suspense>
    </div>
  )
}
