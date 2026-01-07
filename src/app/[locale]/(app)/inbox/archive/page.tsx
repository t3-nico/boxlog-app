'use client';

import { Suspense } from 'react';

import { InboxTableView } from '@/features/inbox/components/InboxTableView';

/**
 * アーカイブ ページ
 */
export default function InboxArchivePage() {
  return (
    <div className="flex flex-1 flex-col">
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
        <InboxTableView />
      </Suspense>
    </div>
  );
}
