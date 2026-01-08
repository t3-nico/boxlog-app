'use client';

import type { PlanStatus } from '@/features/plans/types/plan';
import { Calendar, ChevronDown, FileText, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import { TableNavigation, TablePagination, type TableNavigationConfig } from '@/features/table';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { api } from '@/lib/trpc';
import { useTranslations } from 'next-intl';
import type { InboxItem } from '../hooks/useInboxData';
import { useInboxData } from '../hooks/useInboxData';
import { useInboxFilterStore } from '../stores/useInboxFilterStore';
import { useInboxGroupStore } from '../stores/useInboxGroupStore';
import { useInboxPaginationStore } from '../stores/useInboxPaginationStore';
import { useInboxSelectionStore } from '../stores/useInboxSelectionStore';
import { useInboxSortStore } from '../stores/useInboxSortStore';
import { useInboxViewStore } from '../stores/useInboxViewStore';
import { BulkDatePickerDialog } from './table/BulkDatePickerDialog';
import { BulkTagSelectDialog } from './table/BulkTagSelectDialog';
import { InboxFilterContent } from './table/InboxFilterContent';
import { InboxSelectionActions } from './table/InboxSelectionActions';
import { InboxSelectionBar } from './table/InboxSelectionBar';
import { InboxSettingsContent } from './table/InboxSettingsContent';
import { InboxTableContent } from './table/InboxTableContent';
import { type InboxTableRowCreateHandle } from './table/InboxTableRowCreate';

/**
 * Inbox Table View コンポーネント
 *
 * テーブル形式でプランを表示
 * - useInboxData でデータ取得
 * - useInboxFilterStore でフィルタ管理
 * - 行クリックで Inspector 表示
 *
 * パフォーマンス最適化:
 * - Store監視をselectorで必要な値のみに限定
 * - テーブル本体はInboxTableContentに委譲（担当制）
 * - 各子コンポーネントはmemo化済み
 *
 * @example
 * ```tsx
 * <InboxTableView />
 * ```
 */
export function InboxTableView() {
  const t = useTranslations();
  const { bulkUpdatePlan, bulkDeletePlan, createPlan } = usePlanMutations();

  // ステータス別件数取得
  const { data: stats } = api.plans.getStats.useQuery();
  const openCount = stats?.byStatus?.open ?? 0;
  const doneCount = stats?.byStatus?.done ?? 0;

  // フィルター関連：必要な値のみselectorで取得
  const filterStatus = useInboxFilterStore((state) => state.status);
  const filterSearch = useInboxFilterStore((state) => state.search);
  const filterTags = useInboxFilterStore((state) => state.tags);
  const filterDueDate = useInboxFilterStore((state) => state.dueDate);
  const filterRecurrence = useInboxFilterStore((state) => state.recurrence);
  const filterReminder = useInboxFilterStore((state) => state.reminder);
  const filterSchedule = useInboxFilterStore((state) => state.schedule);
  const filterCreatedAt = useInboxFilterStore((state) => state.createdAt);
  const filterUpdatedAt = useInboxFilterStore((state) => state.updatedAt);
  const isSearchOpen = useInboxFilterStore((state) => state.isSearchOpen);
  const setStatus = useInboxFilterStore((state) => state.setStatus);
  const setSearch = useInboxFilterStore((state) => state.setSearch);
  const setIsSearchOpen = useInboxFilterStore((state) => state.setIsSearchOpen);

  // ソート関連
  const setSort = useInboxSortStore((state) => state.setSort);

  // ページネーション関連
  const currentPage = useInboxPaginationStore((state) => state.currentPage);
  const pageSize = useInboxPaginationStore((state) => state.pageSize);
  const setCurrentPage = useInboxPaginationStore((state) => state.setCurrentPage);
  const setPageSize = useInboxPaginationStore((state) => state.setPageSize);

  // 選択関連
  const selectedIds = useInboxSelectionStore((state) => state.selectedIds);
  const clearSelection = useInboxSelectionStore((state) => state.clearSelection);

  // ビュー関連
  const getActiveView = useInboxViewStore((state) => state.getActiveView);

  // グループ化関連（ページネーション表示判定用）
  const groupBy = useInboxGroupStore((state) => state.groupBy);

  // モバイル判定
  const isMobile = useMediaQuery(MEDIA_QUERIES.mobile);

  // モバイル用「もっと見る」の表示件数（初期50件、クリックで50件追加）
  const MOBILE_INITIAL_LIMIT = 50;
  const MOBILE_LOAD_MORE_COUNT = 50;
  const [mobileDisplayLimit, setMobileDisplayLimit] = useState(MOBILE_INITIAL_LIMIT);

  // 期限一括変更ダイアログの状態
  const [showDateDialog, setShowDateDialog] = useState(false);
  // タグ一括追加ダイアログの状態
  const [showTagDialog, setShowTagDialog] = useState(false);

  // ソート状態取得（useInboxDataより前に取得）
  const sortField = useInboxSortStore((state) => state.sortField);
  const sortDirection = useInboxSortStore((state) => state.sortDirection);
  const clearSort = useInboxSortStore((state) => state.clearSort);

  // データ取得（ソートオプション付き）
  const { items, isPending, error } = useInboxData(
    {
      status: filterStatus[0] as PlanStatus | undefined,
      search: filterSearch,
      tags: filterTags,
      dueDate: filterDueDate,
      recurrence: filterRecurrence,
      reminder: filterReminder,
      schedule: filterSchedule,
      createdAt: filterCreatedAt,
      updatedAt: filterUpdatedAt,
    },
    { field: sortField, direction: sortDirection },
  );

  // 新規作成行のref
  const createRowRef = useRef<InboxTableRowCreateHandle>(null);

  // 選択数
  const selectedCount = selectedIds.size;

  // アクションハンドラー: ステータス一括変更（Open/Done）
  const handleStatusChange = async (status: PlanStatus) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      await bulkUpdatePlan.mutateAsync({
        ids,
        data: { status },
      });
      clearSelection();
    } catch (error) {
      console.error('Status change error:', error);
    }
  };

  // アクションハンドラー: 削除（確認ダイアログ付き）
  const handleDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    // 確認ダイアログ
    if (!window.confirm(t('common.inbox.deleteConfirm', { count: ids.length }))) {
      return;
    }

    try {
      await bulkDeletePlan.mutateAsync({ ids });
      clearSelection();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  // アクションハンドラー: 編集（Inspectorを開く）
  const handleEdit = (item: InboxItem) => {
    usePlanInspectorStore.getState().openInspector(item.id);
  };

  // アクションハンドラー: 複製
  const handleDuplicate = async (item: InboxItem) => {
    try {
      await createPlan.mutateAsync({
        title: `${item.title} (copy)`,
        status: item.status,
        description: item.description || undefined,
        due_date: item.due_date || undefined,
      });
    } catch (error) {
      console.error('Duplicate error:', error);
    }
  };

  // アクションハンドラー: タグ一括追加（ダイアログを開く）
  const handleAddTags = () => {
    setShowTagDialog(true);
  };

  // アクションハンドラー: 期限一括変更（ダイアログを開く）
  const handleChangeDueDate = () => {
    setShowDateDialog(true);
  };

  // アクティブなビューを取得
  const activeView = getActiveView();

  // フィルターリセット
  const resetFilters = useInboxFilterStore((state) => state.reset);
  const setGroupBy = useInboxGroupStore((state) => state.setGroupBy);

  // ソートフィールドオプション（テーブルヘッダーと同じアイコン）
  const sortFieldOptions = useMemo(
    () => [
      { value: 'title', label: 'タイトル', icon: FileText },
      { value: 'created_at', label: '作成日', icon: Calendar },
      { value: 'updated_at', label: '更新日', icon: Calendar },
    ],
    [],
  );

  // フィルター数をカウント（ステータスはタブで管理するため除外）
  const dueDateFilterCount = filterDueDate !== 'all' ? 1 : 0;
  const tagFilterCount = filterTags.length;
  const recurrenceFilterCount = filterRecurrence !== 'all' ? 1 : 0;
  const reminderFilterCount = filterReminder !== 'all' ? 1 : 0;
  const scheduleFilterCount = filterSchedule !== 'all' ? 1 : 0;
  const createdAtFilterCount = filterCreatedAt !== 'all' ? 1 : 0;
  const updatedAtFilterCount = filterUpdatedAt !== 'all' ? 1 : 0;
  const filterCount =
    dueDateFilterCount +
    tagFilterCount +
    recurrenceFilterCount +
    reminderFilterCount +
    scheduleFilterCount +
    createdAtFilterCount +
    updatedAtFilterCount;

  // TableNavigation設定
  // NOTE: Zustand setterは参照が安定しているため依存配列から除外
  const navigationConfig: TableNavigationConfig = useMemo(
    () => ({
      search: filterSearch,
      onSearchChange: setSearch,
      isSearchOpen,
      onSearchOpenChange: setIsSearchOpen,
      sortField,
      sortDirection,
      onSortChange: setSort,
      onSortClear: clearSort,
      sortFieldOptions,
      filterContent: <InboxFilterContent />,
      filterCount,
      hasActiveFilters: filterCount > 0,
      onFilterReset: resetFilters,
      settingsContent: <InboxSettingsContent />,
      hasActiveSettings: groupBy !== null,
      onSettingsReset: () => {
        setGroupBy(null);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filterSearch,
      isSearchOpen,
      sortField,
      sortDirection,
      sortFieldOptions,
      filterCount,
      filterTags,
      groupBy,
    ],
  );

  // アクティブビュー変更時にフィルター・ソート・ページサイズを適用
  // NOTE: activeView.idで依存管理し、不要な再実行を防ぐ
  const activeViewId = activeView?.id;
  useEffect(() => {
    if (!activeView) return;

    // フィルター適用
    if (activeView.filters.status) {
      setStatus(activeView.filters.status as PlanStatus[]);
    }
    if (activeView.filters.search) {
      setSearch(activeView.filters.search);
    }

    // ソート適用
    if (activeView.sorting) {
      setSort(activeView.sorting.field, activeView.sorting.direction);
    }

    // ページサイズ適用
    if (activeView.pageSize) {
      setPageSize(activeView.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeViewId]); // activeView.idのみで依存管理

  // フィルター変更時にページ1に戻る＆モバイル表示件数リセット
  // NOTE: Zustand setterは参照が安定しているため依存配列から除外
  useEffect(() => {
    setCurrentPage(1);
    setMobileDisplayLimit(MOBILE_INITIAL_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterSearch]);

  // エラー表示
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-destructive bg-destructive/12 text-destructive rounded-xl border p-4">
          <p className="font-medium">エラーが発生しました</p>
          <p className="mt-1 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  // ローディング表示（初回ロード時のみ）
  // データ更新中（リフェッチ中）はUIを維持してTableNavigationの再マウントを防ぐ
  if (isPending && items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="inbox-table-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー または 選択バー（Googleドライブ風） */}
      {selectedCount > 0 ? (
        <InboxSelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            <InboxSelectionActions
              selectedCount={selectedCount}
              selectedIds={Array.from(selectedIds)}
              items={items}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onAddTags={handleAddTags}
              onChangeDueDate={handleChangeDueDate}
              onClearSelection={clearSelection}
            />
          }
        />
      ) : (
        <div className="flex h-12 shrink-0 items-center justify-between gap-2 px-4 py-2">
          {/* 左側: Open/Done切り替えタブ */}
          <Tabs
            value={filterStatus[0] || 'open'}
            onValueChange={(value) => setStatus([value as PlanStatus])}
          >
            <TabsList className="bg-secondary h-8 rounded-lg p-0.5">
              <TabsTrigger
                value="open"
                className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-background data-[state=active]:text-foreground h-7 gap-1.5 rounded-md px-3 text-xs"
              >
                Open
                <span className="bg-background flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums">
                  {openCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="done"
                className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-background data-[state=active]:text-foreground h-7 gap-1.5 rounded-md px-3 text-xs"
              >
                Done
                <span className="bg-background flex size-4 items-center justify-center rounded-full text-[10px] tabular-nums">
                  {doneCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 右側: ナビゲーション・作成ボタン */}
          <div className="flex items-center gap-2">
            {/* Notion風アイコンナビゲーション（検索・ソート・設定）- PC・モバイル共通 */}
            <TableNavigation config={navigationConfig} />

            {/* 作成ボタン: 固定位置（モバイル: アイコンのみ、PC: テキスト付き） */}
            <Button
              onClick={() => createRowRef.current?.startCreate()}
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Plus className="size-4" />
            </Button>
            <Button
              onClick={() => createRowRef.current?.startCreate()}
              className="hidden shrink-0 md:inline-flex"
            >
              <Plus className="size-4" />
              {t('common.inbox.createNew')}
            </Button>
          </div>
        </div>
      )}

      {/* テーブル - InboxTableContentに委譲（担当制） */}
      <div
        className="flex flex-1 flex-col overflow-hidden px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            useInboxSelectionStore.getState().clearSelection();
          }
        }}
      >
        <div className="border-border flex flex-1 flex-col overflow-auto rounded-xl border [&::-webkit-scrollbar-corner]:rounded-xl [&::-webkit-scrollbar-track]:rounded-xl">
          <InboxTableContent
            items={items}
            createRowRef={createRowRef}
            mobileDisplayLimit={isMobile ? mobileDisplayLimit : undefined}
          />
        </div>

        {/* フッター */}
        {!groupBy && (
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
                  {t('table.loadMore', {
                    count: Math.min(MOBILE_LOAD_MORE_COUNT, items.length - mobileDisplayLimit),
                  })}
                </Button>
              </div>
            )}
            {/* デスクトップ: ページネーション */}
            <div className="hidden shrink-0 md:block">
              <TablePagination
                totalItems={items.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          </>
        )}
      </div>

      {/* 期限一括設定ダイアログ */}
      <BulkDatePickerDialog
        open={showDateDialog}
        onOpenChange={setShowDateDialog}
        selectedIds={Array.from(selectedIds)}
        onSuccess={() => {
          clearSelection();
          setShowDateDialog(false);
        }}
      />

      {/* タグ一括追加ダイアログ */}
      <BulkTagSelectDialog
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
        selectedPlanIds={Array.from(selectedIds)}
        onSuccess={() => {
          clearSelection();
          setShowTagDialog(false);
        }}
      />
    </div>
  );
}
