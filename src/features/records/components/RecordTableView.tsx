'use client';

import { Calendar, ChevronDown, Clock, FileText, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import {
  TableNavigation,
  TablePagination,
  useTableColumnStore,
  useTablePaginationStore,
  useTableSelectionStore,
  useTableSortStore,
  type TableNavigationConfig,
} from '@/features/table';
import { SelectionBar } from '@/features/table/components/SelectionBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';

import { useRecordData, useRecordMutations, useRecordURLSync } from '../hooks';
import type { RecordItem, RecordSortField } from '../hooks/useRecordData';
import { useRecordFilterStore } from '../stores/useRecordFilterStore';
import { useRecordInspectorStore } from '../stores/useRecordInspectorStore';
import { RecordInspector } from './RecordInspector';
import { RecordFilterContent, RecordSelectionActions, RecordTableContent } from './table';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Record Table View コンポーネント
 *
 * テーブル形式で Record を表示
 * フィルタ・ソート・ページネーション対応
 */
export function RecordTableView() {
  // URL 同期
  useRecordURLSync();

  // テーブルタイプを Record に設定
  const setTableType = useTableColumnStore((state) => state.setTableType);
  useEffect(() => {
    setTableType('record');
  }, [setTableType]);

  // フィルタ Store
  const workedAt = useRecordFilterStore((state) => state.workedAt);
  const planSearch = useRecordFilterStore((state) => state.planSearch);
  const tags = useRecordFilterStore((state) => state.tags);
  const fulfillment = useRecordFilterStore((state) => state.fulfillment);
  const duration = useRecordFilterStore((state) => state.duration);
  const search = useRecordFilterStore((state) => state.search);
  const setSearch = useRecordFilterStore((state) => state.setSearch);
  const isSearchOpen = useRecordFilterStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useRecordFilterStore((state) => state.setIsSearchOpen);
  const createdAt = useRecordFilterStore((state) => state.createdAt);
  const updatedAt = useRecordFilterStore((state) => state.updatedAt);
  const resetFilters = useRecordFilterStore((state) => state.reset);

  // ソート Store
  const sortField = useTableSortStore((state) => state.sortField);
  const sortDirection = useTableSortStore((state) => state.sortDirection);
  const setSort = useTableSortStore((state) => state.setSort);
  const clearSort = useTableSortStore((state) => state.clearSort);

  // ページネーション Store
  const currentPage = useTablePaginationStore((state) => state.currentPage);
  const setCurrentPage = useTablePaginationStore((state) => state.setCurrentPage);

  // 選択 Store
  const selectedIds = useTableSelectionStore((state) => state.selectedIds);
  const clearSelection = useTableSelectionStore((state) => state.clearSelection);

  // Record Inspector Store（既存Record編集用）
  const openRecordInspector = useRecordInspectorStore((state) => state.openInspector);
  const isRecordInspectorOpen = useRecordInspectorStore((state) => state.isOpen);

  // Plan Inspector Store（新規作成用 - カレンダーと同じモーダル）
  const openPlanInspectorWithDraft = usePlanInspectorStore((state) => state.openInspectorWithDraft);

  // モバイル判定
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // モバイル用「もっと見る」の表示件数（初期50件、クリックで50件追加）
  const MOBILE_INITIAL_LIMIT = 50;
  const MOBILE_LOAD_MORE_COUNT = 50;
  const [mobileDisplayLimit, setMobileDisplayLimit] = useState(MOBILE_INITIAL_LIMIT);

  // フィルター構築
  const filters = useMemo(
    () => ({
      workedAt,
      planSearch,
      tags,
      fulfillment,
      duration,
      search,
      createdAt,
      updatedAt,
    }),
    [workedAt, planSearch, tags, fulfillment, duration, search, createdAt, updatedAt],
  );

  // ソート構築
  const sort = useMemo(() => {
    if (!sortField || !sortDirection) return undefined;
    return {
      field: sortField as RecordSortField,
      direction: sortDirection,
    };
  }, [sortField, sortDirection]);

  // ソートフィールドオプション
  const sortFieldOptions = useMemo(
    () => [
      { value: 'worked_at', label: '作業日', icon: Calendar },
      { value: 'duration_minutes', label: '時間', icon: Clock },
      { value: 'title', label: 'タイトル', icon: FileText },
      { value: 'created_at', label: '作成日', icon: Calendar },
      { value: 'updated_at', label: '更新日', icon: Calendar },
    ],
    [],
  );

  // フィルター数のカウント
  const workedAtFilterCount = workedAt !== 'all' ? 1 : 0;
  const tagFilterCount = tags.length;
  const fulfillmentFilterCount = fulfillment !== 'all' ? 1 : 0;
  const durationFilterCount = duration !== 'all' ? 1 : 0;
  const createdAtFilterCount = createdAt !== 'all' ? 1 : 0;
  const updatedAtFilterCount = updatedAt !== 'all' ? 1 : 0;
  const filterCount =
    workedAtFilterCount +
    tagFilterCount +
    fulfillmentFilterCount +
    durationFilterCount +
    createdAtFilterCount +
    updatedAtFilterCount;

  // TableNavigation 設定
  const navigationConfig: TableNavigationConfig = useMemo(
    () => ({
      search,
      onSearchChange: setSearch,
      isSearchOpen,
      onSearchOpenChange: setIsSearchOpen,
      sortField,
      sortDirection,
      onSortChange: setSort,
      onSortClear: clearSort,
      sortFieldOptions,
      filterContent: <RecordFilterContent />,
      filterCount,
      hasActiveFilters: filterCount > 0,
      onFilterReset: resetFilters,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, isSearchOpen, sortField, sortDirection, sortFieldOptions, filterCount, tags],
  );

  // データ取得
  const { items, isPending } = useRecordData(filters, sort);
  const { duplicateRecord, deleteRecord } = useRecordMutations();

  // 選択数
  const selectedCount = selectedIds.size;

  // アクションハンドラー: 編集（RecordInspectorを開く）
  const handleEdit = (item: RecordItem) => {
    openRecordInspector(item.id);
  };

  // 新規作成（PlanInspectorを Record モードで開く - カレンダーと同じ）
  const handleCreate = () => {
    openPlanInspectorWithDraft(undefined, 'record');
  };

  // アクションハンドラー: 今日の日付で複製
  const handleDuplicateItem = async (item: RecordItem) => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    await duplicateRecord.mutateAsync({ id: item.id, worked_at: today });
    clearSelection();
  };

  // アクションハンドラー: 削除（確認ダイアログ付き）
  const handleDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    // 確認ダイアログ
    if (!window.confirm(`${ids.length}件のRecordを削除しますか？`)) {
      return;
    }

    try {
      // 順番に削除（バルク削除APIがない場合）
      for (const id of ids) {
        await deleteRecord.mutateAsync({ id });
      }
      clearSelection();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // 総ページ数
  const totalPages = Math.ceil(items.length / DEFAULT_PAGE_SIZE);

  // ページ変更時に範囲外にならないようにする
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  // フィルター変更時にページ1に戻る＆モバイル表示件数リセット
  useEffect(() => {
    setCurrentPage(1);
    setMobileDisplayLimit(MOBILE_INITIAL_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workedAt, planSearch, tags, fulfillment, duration, search, createdAt, updatedAt]);

  // ローディング表示
  if (isPending && items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 空状態（フィルターなしでデータなし）
  const hasActiveFilters =
    workedAt !== 'all' ||
    planSearch ||
    tags.length > 0 ||
    fulfillment !== 'all' ||
    duration !== 'all' ||
    search ||
    createdAt !== 'all' ||
    updatedAt !== 'all';

  if (items.length === 0 && !hasActiveFilters) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Clock className="text-muted-foreground size-12" />
        <div className="text-center">
          <p className="text-muted-foreground">まだRecordがありません</p>
          <p className="text-muted-foreground text-sm">作業ログを記録しましょう</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          Record作成
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* テーブル */}
      <div className={cn('flex-1 overflow-hidden', isRecordInspectorOpen && 'pr-0')}>
        {/* ツールバー または 選択バー（Googleドライブ風） */}
        {selectedCount > 0 ? (
          <SelectionBar
            selectedCount={selectedCount}
            onClearSelection={clearSelection}
            actions={
              <RecordSelectionActions
                selectedCount={selectedCount}
                selectedIds={Array.from(selectedIds)}
                items={items}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onDuplicate={handleDuplicateItem}
                onClearSelection={clearSelection}
              />
            }
          />
        ) : (
          <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">{items.length}件のRecord</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Notion風アイコンナビゲーション（検索・ソート・フィルタ） */}
              <TableNavigation config={navigationConfig} />
              <Button onClick={handleCreate}>
                <Plus className="mr-2 size-4" />
                Record作成
              </Button>
            </div>
          </div>
        )}

        {/* テーブル本体 */}
        <div className="flex flex-1 flex-col overflow-hidden px-4">
          <div className="border-border flex flex-1 flex-col overflow-auto rounded-xl border">
            <RecordTableContent
              items={items}
              mobileDisplayLimit={isMobile ? mobileDisplayLimit : undefined}
              pageSize={DEFAULT_PAGE_SIZE}
            />
          </div>

          {/* フッター */}
          <>
            {/* モバイル: もっと見るボタン（件数が超えている場合のみ） */}
            {isMobile && items.length > mobileDisplayLimit && (
              <div className="flex shrink-0 justify-center py-4">
                <Button
                  variant="outline"
                  onClick={() => setMobileDisplayLimit((prev) => prev + MOBILE_LOAD_MORE_COUNT)}
                  className="gap-2"
                >
                  <ChevronDown className="size-4" />
                  もっと見る（残り
                  {Math.min(MOBILE_LOAD_MORE_COUNT, items.length - mobileDisplayLimit)}件）
                </Button>
              </div>
            )}
            {/* デスクトップ: ページネーション */}
            <div className="hidden shrink-0 md:block">
              <TablePagination
                totalItems={items.length}
                currentPage={currentPage}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        </div>
      </div>

      {/* Record Inspector（既存Record編集用） */}
      {isRecordInspectorOpen && <RecordInspector />}
    </div>
  );
}
