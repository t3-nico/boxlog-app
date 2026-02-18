'use client';

import { Plus, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HoverTooltip } from '@/components/ui/tooltip';

import type {
  RecordPanelDateFilter,
  RecordPanelGroupByField,
  RecordPanelSortField,
  RecordPanelSortOrder,
} from './RecordListSortMenu';
import { RecordListSortMenu } from './RecordListSortMenu';

interface RecordListToolbarProps {
  /** 検索クエリ */
  search: string;
  /** 検索クエリ変更 */
  onSearchChange: (search: string) => void;
  /** 検索UI展開状態 */
  isSearchOpen: boolean;
  /** 検索UI展開状態変更 */
  onSearchOpenChange: (isOpen: boolean) => void;
  /** ソートフィールド */
  sortBy: RecordPanelSortField;
  /** ソート方向 */
  sortOrder: RecordPanelSortOrder;
  /** グルーピングフィールド */
  groupBy: RecordPanelGroupByField;
  /** 日付フィルター */
  dateFilter: RecordPanelDateFilter;
  /** ソート変更 */
  onSortChange: (field: RecordPanelSortField, order: RecordPanelSortOrder) => void;
  /** グルーピング変更 */
  onGroupByChange: (field: RecordPanelGroupByField) => void;
  /** 日付フィルター変更 */
  onDateFilterChange: (filter: RecordPanelDateFilter) => void;
  /** 新規Record作成 */
  onCreateRecord?: () => void;
}

/**
 * アサイド用の Record リストツールバー
 *
 * PlanListToolbar と同構造 + 「+」ボタン追加
 * レイアウト: [spacer] [SortMenu] [Search] [+]
 */
export function RecordListToolbar({
  search,
  onSearchChange,
  isSearchOpen,
  onSearchOpenChange,
  sortBy,
  sortOrder,
  groupBy,
  dateFilter,
  onSortChange,
  onGroupByChange,
  onDateFilterChange,
  onCreateRecord,
}: RecordListToolbarProps) {
  const t = useTranslations('calendar');

  return (
    <div className="flex h-10 items-center gap-1 px-2">
      {isSearchOpen ? (
        // 検索モード
        <div className="bg-input flex flex-1 items-center gap-2 rounded-md px-2">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <Input
            type="text"
            placeholder={t('aside.recordSearchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 flex-1 border-none bg-transparent px-0 text-sm focus-visible:ring-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            icon
            onClick={() => {
              onSearchChange('');
              onSearchOpenChange(false);
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        // 通常モード
        <>
          {/* スペーサー */}
          <div className="flex-1" />

          {/* ソート/グルーピングメニュー */}
          <RecordListSortMenu
            sortBy={sortBy}
            sortOrder={sortOrder}
            groupBy={groupBy}
            dateFilter={dateFilter}
            onSortChange={onSortChange}
            onGroupByChange={onGroupByChange}
            onDateFilterChange={onDateFilterChange}
          />

          {/* 検索ボタン */}
          <Button variant="ghost" size="sm" icon onClick={() => onSearchOpenChange(true)}>
            <Search className="size-4" />
          </Button>

          {/* 新規作成ボタン */}
          {onCreateRecord && (
            <HoverTooltip content={t('aside.createRecord')} side="top">
              <Button
                variant="ghost"
                size="sm"
                icon
                onClick={onCreateRecord}
                aria-label={t('aside.createRecord')}
              >
                <Plus className="size-4" />
              </Button>
            </HoverTooltip>
          )}
        </>
      )}
    </div>
  );
}
