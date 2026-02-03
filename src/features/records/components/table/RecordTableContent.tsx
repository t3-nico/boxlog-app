'use client';

import { memo, useMemo } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, FileText, FolderOpen, Smile, Tag } from 'lucide-react';

import { ResizableTableHead } from '@/features/plans/components/table/ResizableTableHead';
import {
  useTableColumnStore,
  useTablePaginationStore,
  useTableSelectionStore,
  useTableSortStore,
  type SortField,
} from '@/features/table';

import type { RecordItem, RecordSortField } from '../../hooks/useRecordData';
import { RecordTableEmptyState } from './RecordTableEmptyState';
import { RecordTableRow } from './RecordTableRow';

// 列IDとアイコンのマッピング
const columnIcons = {
  title: FileText,
  plan: FolderOpen,
  tags: Tag,
  worked_at: Calendar,
  duration_minutes: Clock,
  fulfillment_score: Smile,
  created_at: Calendar,
  updated_at: Calendar,
} as const;

// 列IDとソートフィールドのマッピング
const columnSortFields: Record<string, SortField | undefined> = {
  title: 'title',
  worked_at: 'worked_at' as SortField,
  duration_minutes: 'duration_minutes' as SortField,
  fulfillment_score: 'fulfillment_score' as SortField,
  created_at: 'created_at',
  updated_at: 'updated_at',
};

interface RecordTableContentProps {
  items: RecordItem[];
  /** モバイル用表示件数上限 */
  mobileDisplayLimit?: number | undefined;
  /** 1ページあたりの表示件数 */
  pageSize: number;
}

/**
 * テーブルヘッダー（担当：列表示・ソート・選択）
 */
const TableHeaderSection = memo(function TableHeaderSection({
  allSelected,
  someSelected,
  onToggleAll,
}: {
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
}) {
  const columns = useTableColumnStore((state) => state.recordColumns);
  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns]);

  return (
    <TableHeader className="bg-surface-container sticky top-0 z-10">
      <TableRow>
        {visibleColumns.map((column) => {
          if (column.id === 'selection') {
            return (
              <TableHead
                key={column.id}
                style={{ width: `${column.width}px`, minWidth: `${column.width}px` }}
              >
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
            );
          }

          const Icon = columnIcons[column.id as keyof typeof columnIcons];
          const sortField = columnSortFields[column.id];

          // sortField がない列（タグ、Plan等）はソート非対応
          if (!sortField) {
            return (
              <ResizableTableHead key={column.id} columnId={column.id} icon={Icon}>
                {column.label}
              </ResizableTableHead>
            );
          }

          return (
            <ResizableTableHead
              key={column.id}
              columnId={column.id}
              sortField={sortField}
              icon={Icon}
            >
              {column.label}
            </ResizableTableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
});

/**
 * テーブルボディ（担当：データ表示・ソート・ページネーション）
 */
const TableBodySection = memo(function TableBodySection({
  items,
  mobileDisplayLimit,
  pageSize,
}: {
  items: RecordItem[];
  mobileDisplayLimit?: number | undefined;
  pageSize: number;
}) {
  const sortField = useTableSortStore((state) => state.sortField);
  const sortDirection = useTableSortStore((state) => state.sortDirection);
  const currentPage = useTablePaginationStore((state) => state.currentPage);
  const columns = useTableColumnStore((state) => state.recordColumns);
  const visibleColumns = useMemo(() => columns.filter((col) => col.visible), [columns]);

  // ソート適用
  const sortedItems = useMemo(() => {
    if (!sortField || !sortDirection) return items;

    return [...items].sort((a, b) => {
      let aValue: string | number | null = null;
      let bValue: string | number | null = null;

      const field = sortField as RecordSortField;
      switch (field) {
        case 'worked_at':
          aValue = new Date(a.worked_at).getTime();
          bValue = new Date(b.worked_at).getTime();
          break;
        case 'duration_minutes':
          aValue = a.duration_minutes;
          bValue = b.duration_minutes;
          break;
        case 'fulfillment_score':
          aValue = a.fulfillment_score ?? 0;
          bValue = b.fulfillment_score ?? 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'title':
          aValue = a.title ?? a.plan?.title ?? '';
          bValue = b.title ?? b.plan?.title ?? '';
          break;
        default:
          return 0;
      }

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, 'ja')
          : bValue.localeCompare(aValue, 'ja');
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [items, sortField, sortDirection]);

  // ページネーション適用
  const paginatedItems = useMemo(() => {
    if (mobileDisplayLimit !== undefined) {
      return sortedItems.slice(0, mobileDisplayLimit);
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, currentPage, pageSize, mobileDisplayLimit]);

  return (
    <TableBody>
      {paginatedItems.length === 0 ? (
        <RecordTableEmptyState columnCount={visibleColumns.length} totalItems={items.length} />
      ) : (
        paginatedItems.map((item) => <RecordTableRow key={item.id} item={item} />)
      )}
    </TableBody>
  );
});

/**
 * RecordTableContent - テーブル本体
 *
 * 役割分担:
 * - TableHeaderSection: 列表示・ソート・選択チェックボックス
 * - TableBodySection: データ表示・ソート・ページネーション
 */
export const RecordTableContent = memo(function RecordTableContent({
  items,
  mobileDisplayLimit,
  pageSize,
}: RecordTableContentProps) {
  const selectedIds = useTableSelectionStore((state) => state.selectedIds);
  const toggleAll = useTableSelectionStore((state) => state.toggleAll);
  const sortField = useTableSortStore((state) => state.sortField);
  const sortDirection = useTableSortStore((state) => state.sortDirection);
  const currentPage = useTablePaginationStore((state) => state.currentPage);

  // 選択状態の計算用にソート・ページネーション適用
  const sortedItems = useMemo(() => {
    if (!sortField || !sortDirection) return items;
    return [...items].sort((a, b) => {
      const field = sortField as RecordSortField;
      let aValue: string | number | null = null;
      let bValue: string | number | null = null;

      switch (field) {
        case 'worked_at':
          aValue = new Date(a.worked_at).getTime();
          bValue = new Date(b.worked_at).getTime();
          break;
        case 'duration_minutes':
          aValue = a.duration_minutes;
          bValue = b.duration_minutes;
          break;
        case 'fulfillment_score':
          aValue = a.fulfillment_score ?? 0;
          bValue = b.fulfillment_score ?? 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        case 'title':
          aValue = a.title ?? a.plan?.title ?? '';
          bValue = b.title ?? b.plan?.title ?? '';
          break;
        default:
          return 0;
      }

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, 'ja')
          : bValue.localeCompare(aValue, 'ja');
      }

      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [items, sortField, sortDirection]);

  const paginatedItems = useMemo(() => {
    if (mobileDisplayLimit !== undefined) {
      return sortedItems.slice(0, mobileDisplayLimit);
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, currentPage, pageSize, mobileDisplayLimit]);

  // 全選択状態の計算
  const currentPageIds = useMemo(() => paginatedItems.map((item) => item.id), [paginatedItems]);
  const selectedCountInPage = useMemo(
    () => currentPageIds.filter((id) => selectedIds.has(id)).length,
    [currentPageIds, selectedIds],
  );
  const allSelected = selectedCountInPage === currentPageIds.length && currentPageIds.length > 0;
  const someSelected = selectedCountInPage > 0 && selectedCountInPage < currentPageIds.length;

  const handleToggleAll = () => {
    toggleAll(currentPageIds);
  };

  return (
    <Table className="w-full min-w-full">
      <TableHeaderSection
        allSelected={allSelected}
        someSelected={someSelected}
        onToggleAll={handleToggleAll}
      />
      <TableBodySection items={items} mobileDisplayLimit={mobileDisplayLimit} pageSize={pageSize} />
    </Table>
  );
});
