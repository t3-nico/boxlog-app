'use client';

import { Suspense } from 'react';

import { InboxBoardView } from '@/features/inbox/components/InboxBoardView';
import { InboxTableView } from '@/features/inbox/components/InboxTableView';
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore';

/**
 * Inboxコンテンツ（すべてのPlan）
 */
function InboxContent() {
  const displayMode = useInboxViewStore((state) => state.displayMode);

  if (displayMode === 'table') {
    return <InboxTableView />;
  }

  return <InboxBoardView />;
}

/**
 * Inboxルートページ
 *
 * リダイレクトではなく、直接 all ビューをレンダリング（パフォーマンス最適化）
 * 以前: redirect → /inbox/all（余分なSSR処理）
 * 現在: 直接レンダリング（リダイレクト不要）
 */
export default function InboxPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
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
  );
}
