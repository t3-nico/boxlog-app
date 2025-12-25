'use client';

import { KanbanToolbar } from '@/features/board/components/KanbanToolbar';

import { useInboxViewStore } from '../stores/useInboxViewStore';

/**
 * Inboxツールバー
 *
 * 表示モードに応じて適切なツールを表示:
 * - Board: KanbanToolbar（フィルター・検索）
 * - Table: （未実装）
 *
 * **デザイン仕様**:
 * - 全体の高さ: 48px固定（h-12）
 * - 上下パディング: 8px（py-2）
 * - コンテナ: 32px（h-8）
 * - 8pxグリッドシステム準拠
 */
export function InboxToolbar() {
  const { displayMode } = useInboxViewStore();

  // Tableモードの場合はツールバーを表示しない
  if (displayMode === 'table') {
    return null;
  }

  return (
    <div className="bg-background flex h-12 shrink-0 items-center justify-end px-4 py-2">
      <div className="flex h-8 items-center">
        <KanbanToolbar />
      </div>
    </div>
  );
}
