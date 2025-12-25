'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useInboxFilterStore } from '../../stores/useInboxFilterStore';
import { ColumnSettings } from './ColumnSettings';
import { TableFilters } from './TableFilters';
import { TagFilterButton } from './TagFilterButton';

/**
 * Tableビュー用ツールバー
 *
 * フィルター機能を提供（水平スクロール対応）
 * - TableFilters（期限・ステータスフィルター）
 * - TagFilterButton（タグフィルター専用）
 * - ColumnSettings（列設定）
 * - リセットボタン
 *
 * 作成ボタンは親コンポーネント（InboxTableView）で管理
 */
export function TableToolbar() {
  const { search, status, tags, dueDate, reset } = useInboxFilterStore();

  const isFiltered = search !== '' || status.length > 0 || tags.length > 0 || dueDate !== 'all';

  return (
    <div className="flex shrink-0 items-center gap-2">
      {/* 期限・ステータスフィルター */}
      <TableFilters />

      {/* タグフィルター専用ボタン */}
      <TagFilterButton />

      {/* フィルターリセット */}
      {isFiltered && (
        <Button variant="ghost" size="sm" onClick={reset} className="shrink-0">
          <X className="size-4" />
          <span className="hidden sm:inline">リセット</span>
        </Button>
      )}

      {/* 列設定 */}
      <ColumnSettings />
    </div>
  );
}
