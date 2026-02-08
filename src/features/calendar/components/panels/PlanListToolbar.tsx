'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { PanelGroupByField, PanelSortField, PanelSortOrder } from './PlanListSortMenu';
import { PlanListSortMenu } from './PlanListSortMenu';

interface PlanListToolbarProps {
  /** 検索クエリ */
  search: string;
  /** 検索クエリ変更 */
  onSearchChange: (search: string) => void;
  /** 検索UI展開状態 */
  isSearchOpen: boolean;
  /** 検索UI展開状態変更 */
  onSearchOpenChange: (isOpen: boolean) => void;
  /** ソートフィールド */
  sortBy: PanelSortField;
  /** ソート方向 */
  sortOrder: PanelSortOrder;
  /** グルーピングフィールド */
  groupBy: PanelGroupByField;
  /** ソート変更 */
  onSortChange: (field: PanelSortField, order: PanelSortOrder) => void;
  /** グルーピング変更 */
  onGroupByChange: (field: PanelGroupByField) => void;
}

/**
 * サイドパネル用のPlanリストツールバー
 *
 * - 「Unscheduled」ラベル
 * - ソート/グルーピングメニュー
 * - 検索バー（アイコンクリックで展開）
 */
export function PlanListToolbar({
  search,
  onSearchChange,
  isSearchOpen,
  onSearchOpenChange,
  sortBy,
  sortOrder,
  groupBy,
  onSortChange,
  onGroupByChange,
}: PlanListToolbarProps) {
  const t = useTranslations('calendar');

  return (
    <div className="border-border flex h-10 items-center gap-1 border-b px-2">
      {isSearchOpen ? (
        // 検索モード
        <div className="flex flex-1 items-center gap-2">
          <Search className="text-muted-foreground size-4 shrink-0" />
          <Input
            type="text"
            placeholder={t('panel.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-7 flex-1 border-none bg-transparent px-0 text-sm focus-visible:ring-0"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
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
          {/* ラベル */}
          <span className="text-muted-foreground text-xs font-medium">
            {t('panel.unscheduled')}
          </span>

          {/* スペーサー */}
          <div className="flex-1" />

          {/* ソート/グルーピングメニュー */}
          <PlanListSortMenu
            sortBy={sortBy}
            sortOrder={sortOrder}
            groupBy={groupBy}
            onSortChange={onSortChange}
            onGroupByChange={onGroupByChange}
          />

          {/* 検索ボタン */}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => onSearchOpenChange(true)}
          >
            <Search className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
