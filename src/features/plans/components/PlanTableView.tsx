'use client';

import type { PlanStatus } from '@/features/plans/types/plan';
import { Calendar, ChevronDown, FileText, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MEDIA_QUERIES } from '@/config/ui/breakpoints';
import { usePlanMutations } from '@/features/plans/hooks/usePlanMutations';
import { usePlanInspectorStore } from '@/features/plans/stores/usePlanInspectorStore';
import {
  TableNavigation,
  TablePagination,
  useTableGroupStore,
  useTablePaginationStore,
  useTableSelectionStore,
  useTableSortStore,
  type TableNavigationConfig,
} from '@/features/table';
import { SelectionBar } from '@/features/table/components/SelectionBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { api } from '@/lib/trpc';
import { useTranslations } from 'next-intl';
import { useDynamicPageSize } from '../hooks/useDynamicPageSize';
import type { PlanItem } from '../hooks/usePlanData';
import { usePlanData } from '../hooks/usePlanData';
import { usePlanURLSync } from '../hooks/usePlanURLSync';
import { usePlanFilterStore } from '../stores/usePlanFilterStore';
import { usePlanViewStore } from '../stores/usePlanViewStore';
import { BulkDatePickerDialog } from './table/BulkDatePickerDialog';
import { BulkTagSelectDialog } from './table/BulkTagSelectDialog';
import { PlanFilterContent } from './table/PlanFilterContent';
import { PlanSelectionActions } from './table/PlanSelectionActions';
import { PlanSettingsContent } from './table/PlanSettingsContent';
import { PlanTableContent } from './table/PlanTableContent';
import { type PlanTableRowCreateHandle } from './table/PlanTableRowCreate';

/**
 * Plan Table View コンポーネント
 *
 * テーブル形式でプランを表示
 * - usePlanData でデータ取得
 * - usePlanFilterStore でフィルタ管理
 * - 行クリックで Inspector 表示
 *
 * パフォーマンス最適化:
 * - Store監視をselectorで必要な値のみに限定
 * - テーブル本体はPlanTableContentに委譲（担当制）
 * - 各子コンポーネントはmemo化済み
 *
 * @example
 * ```tsx
 * <PlanTableView />
 * ```
 */
export function PlanTableView() {
  const t = useTranslations();
  const { bulkUpdatePlan, bulkDeletePlan } = usePlanMutations();

  // URL同期（ページネーション永続化）
  usePlanURLSync();

  // ステータス別件数取得
  const { data: stats } = api.plans.getStats.useQuery();
  const openCount = stats?.byStatus?.open ?? 0;
  const closedCount = stats?.byStatus?.closed ?? 0;

  // フィルター関連：必要な値のみselectorで取得
  const filterStatus = usePlanFilterStore((state) => state.status);
  const filterSearch = usePlanFilterStore((state) => state.search);
  const filterTags = usePlanFilterStore((state) => state.tags);
  const filterDueDate = usePlanFilterStore((state) => state.dueDate);
  const filterRecurrence = usePlanFilterStore((state) => state.recurrence);
  const filterReminder = usePlanFilterStore((state) => state.reminder);
  const filterSchedule = usePlanFilterStore((state) => state.schedule);
  const filterCreatedAt = usePlanFilterStore((state) => state.createdAt);
  const filterUpdatedAt = usePlanFilterStore((state) => state.updatedAt);
  const isSearchOpen = usePlanFilterStore((state) => state.isSearchOpen);
  const setStatus = usePlanFilterStore((state) => state.setStatus);
  const setSearch = usePlanFilterStore((state) => state.setSearch);
  const setIsSearchOpen = usePlanFilterStore((state) => state.setIsSearchOpen);

  // ソート関連
  const setSort = useTableSortStore((state) => state.setSort);

  // ページネーション関連
  const currentPage = useTablePaginationStore((state) => state.currentPage);
  const setCurrentPage = useTablePaginationStore((state) => state.setCurrentPage);

  // テーブルコンテナref（動的ページサイズ計算用）
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = useDynamicPageSize(tableContainerRef);

  // 選択関連
  const selectedIds = useTableSelectionStore((state) => state.selectedIds);
  const clearSelection = useTableSelectionStore((state) => state.clearSelection);

  // ビュー関連
  const getActiveView = usePlanViewStore((state) => state.getActiveView);

  // グループ化関連（ページネーション表示判定用）
  const groupBy = useTableGroupStore((state) => state.groupBy);

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

  // ソート状態取得（usePlanDataより前に取得）
  const sortField = useTableSortStore((state) => state.sortField);
  const sortDirection = useTableSortStore((state) => state.sortDirection);
  const clearSort = useTableSortStore((state) => state.clearSort);

  // データ取得（ソートオプション付き）
  // 認証エラーはグローバルハンドラーで自動リダイレクトされるため、errorは不要
  const { items, isPending } = usePlanData(
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
  const createRowRef = useRef<PlanTableRowCreateHandle>(null);

  // 選択数
  const selectedCount = selectedIds.size;

  // アクションハンドラー: ステータス一括変更（Open/Closed）
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
    if (!window.confirm(t('common.plan.deleteConfirm', { count: ids.length }))) {
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
  const handleEdit = (item: PlanItem) => {
    usePlanInspectorStore.getState().openInspector(item.id);
  };

  // アクションハンドラー: 複製（ドラフトモードで開く）
  const handleDuplicate = (item: PlanItem) => {
    usePlanInspectorStore.getState().openInspectorWithDraft({
      title: `${item.title} (copy)`,
      description: item.description ?? null,
      due_date: item.due_date ?? null,
      start_time: item.start_time ?? null,
      end_time: item.end_time ?? null,
    });
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
  const resetFilters = usePlanFilterStore((state) => state.reset);
  const setGroupBy = useTableGroupStore((state) => state.setGroupBy);

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
      filterContent: <PlanFilterContent />,
      filterCount,
      hasActiveFilters: filterCount > 0,
      onFilterReset: resetFilters,
      settingsContent: <PlanSettingsContent />,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeViewId]); // activeView.idのみで依存管理

  // フィルター変更時にページ1に戻る＆モバイル表示件数リセット
  // NOTE: Zustand setterは参照が安定しているため依存配列から除外
  useEffect(() => {
    setCurrentPage(1);
    setMobileDisplayLimit(MOBILE_INITIAL_LIMIT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterSearch]);

  // ローディング表示（初回ロード時のみ）
  // データ更新中（リフェッチ中）はUIを維持してTableNavigationの再マウントを防ぐ
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

  return (
    <div id="inbox-table-view-panel" role="tabpanel" className="flex h-full flex-col">
      {/* ツールバー または 選択バー（Googleドライブ風） */}
      {selectedCount > 0 ? (
        <SelectionBar
          selectedCount={selectedCount}
          onClearSelection={clearSelection}
          actions={
            <PlanSelectionActions
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
          {/* 左側: Open/Closed切り替えタブ */}
          <Tabs
            value={filterStatus[0] || 'open'}
            onValueChange={(value) => setStatus([value as PlanStatus])}
          >
            <TabsList className="bg-secondary border-border h-10 rounded-full border p-1">
              <TabsTrigger
                value="open"
                className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-state-active data-[state=active]:text-state-active-foreground h-8 gap-2 rounded-full px-4 text-sm"
              >
                Open
                <span className="bg-container flex size-5 items-center justify-center rounded-full text-xs tabular-nums">
                  {openCount}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="closed"
                className="data-[state=inactive]:hover:bg-state-hover data-[state=active]:bg-state-active data-[state=active]:text-state-active-foreground h-8 gap-2 rounded-full px-4 text-sm"
              >
                Closed
                <span className="bg-container flex size-5 items-center justify-center rounded-full text-xs tabular-nums">
                  {closedCount}
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
              {t('common.plan.createNew')}
            </Button>
          </div>
        </div>
      )}

      {/* テーブル - PlanTableContentに委譲（担当制） */}
      <div
        className="flex flex-1 flex-col overflow-hidden px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            useTableSelectionStore.getState().clearSelection();
          }
        }}
      >
        <div
          ref={tableContainerRef}
          className="border-border flex flex-1 flex-col overflow-auto rounded-2xl border [&::-webkit-scrollbar-corner]:rounded-2xl [&::-webkit-scrollbar-track]:rounded-2xl"
        >
          <PlanTableContent
            items={items}
            createRowRef={createRowRef}
            mobileDisplayLimit={isMobile ? mobileDisplayLimit : undefined}
            pageSize={pageSize}
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
