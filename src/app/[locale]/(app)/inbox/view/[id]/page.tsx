'use client'

import { Suspense } from 'react'

import { InboxBoardView } from '@/features/inbox/components/InboxBoardView'
import { InboxPageHeader } from '@/features/inbox/components/InboxPageHeader'
import { InboxTableView } from '@/features/inbox/components/InboxTableView'
import { InboxToolbar } from '@/features/inbox/components/InboxToolbar'
import { useInboxViewStore } from '@/features/inbox/stores/useInboxViewStore'

/**
 * Inboxコンテンツ（カスタムビュー）
 */
function InboxContent() {
  const { displayMode } = useInboxViewStore()

  // 表示形式に応じて表示を切り替え
  if (displayMode === 'table') {
    return <InboxTableView />
  }

  return <InboxBoardView />
}

interface InboxViewPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * カスタムビュー ページ
 */
export default function InboxViewPage({ params }: InboxViewPageProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* 1. ヘッダー：タイトル + ビュースイッチャー */}
      <InboxPageHeader />

      {/* 2. ツールバー：表示モード別ナビゲーション */}
      <InboxToolbar />

      {/* 3. コンテンツ：Board/Table */}
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
