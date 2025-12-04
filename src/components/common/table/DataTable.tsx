'use client'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { TablePagination } from './TablePagination'

/**
 * 列定義
 */
export interface ColumnDef<T> {
  /** 列ID */
  id: string
  /** ヘッダーラベル */
  label: string
  /** 列幅（px） */
  width: number
  /** リサイズ可能か */
  resizable?: boolean
  /** ソート可能か（trueの場合、sortKeyを指定） */
  sortKey?: string
  /** ヘッダーアイコン */
  icon?: LucideIcon
  /** セルのレンダリング関数 */
  render: (item: T, index: number) => ReactNode
}

/**
 * ソート状態
 */
export interface SortState {
  field: string | null
  direction: 'asc' | 'desc'
}

/**
 * ページネーション状態
 */
export interface PaginationState {
  currentPage: number
  pageSize: number
}

/**
 * グループ化されたデータ
 */
export interface GroupedData<T> {
  /** グループのキー（一意な識別子） */
  groupKey: string
  /** グループの表示ラベル */
  groupLabel: string
  /** グループ内のアイテム */
  items: T[]
  /** アイテム数 */
  count: number
}

/**
 * DataTableのprops
 */
export interface DataTableProps<T> {
  /** データ配列 */
  data: T[]
  /** 列定義 */
  columns: ColumnDef<T>[]
  /** 行のキーを取得する関数 */
  getRowKey: (item: T) => string

  // 選択関連
  /** 選択機能を有効にするか */
  selectable?: boolean
  /** 選択されたIDのSet */
  selectedIds?: Set<string>
  /** 選択変更時のコールバック */
  onSelectionChange?: (selectedIds: Set<string>) => void

  // ソート関連
  /** ソート状態 */
  sortState?: SortState
  /** ソート変更時のコールバック */
  onSortChange?: (sortState: SortState) => void

  // ページネーション関連
  /** ページネーションを表示するか */
  showPagination?: boolean
  /** ページネーション状態 */
  paginationState?: PaginationState
  /** ページネーション変更時のコールバック */
  onPaginationChange?: (paginationState: PaginationState) => void
  /** ページサイズの選択肢 */
  pageSizeOptions?: number[]

  // 列幅関連
  /** 列幅の状態（id -> width） */
  columnWidths?: Record<string, number>
  /** 列幅変更時のコールバック */
  onColumnWidthChange?: (columnId: string, width: number) => void

  // グループ化関連
  /** グループ化されたデータ（指定時はdataの代わりにこちらを使用） */
  groupedData?: GroupedData<T>[]
  /** 折りたたまれたグループのSet */
  collapsedGroups?: Set<string>
  /** グループ折りたたみトグル時のコールバック */
  onToggleGroupCollapse?: (groupKey: string) => void
  /** カスタムグループヘッダーレンダラー */
  renderGroupHeader?: (group: GroupedData<T>, columnCount: number, isCollapsed: boolean) => ReactNode

  // カスタマイズ
  /** 行のラッパーコンポーネント（ドラッグ&ドロップ、コンテキストメニュー用） */
  rowWrapper?: (props: { item: T; children: ReactNode; isSelected: boolean }) => ReactNode
  /** 空状態の表示 */
  emptyState?: ReactNode
  /** テーブル外側のクリック時のコールバック */
  onOutsideClick?: () => void
  /** 選択列のチェックボックスラベル */
  selectAllLabel?: string
  /** 個別選択のラベル取得関数 */
  getSelectLabel?: (item: T) => string
  /** テーブル末尾に追加する行（作成行など） */
  extraRows?: ReactNode
  /** ヘッダーを固定するか */
  stickyHeader?: boolean
}

/**
 * 汎用DataTableコンポーネント
 *
 * Inbox、Tags、その他のテーブルで共通して使用できる汎用テーブル
 * - 選択機能
 * - ソート機能
 * - ページネーション
 * - リサイズ可能な列
 * - カスタム行レンダリング
 */
export function DataTable<T>({
  data,
  columns,
  getRowKey,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sortState,
  onSortChange,
  showPagination = true,
  paginationState = { currentPage: 1, pageSize: 50 },
  onPaginationChange,
  pageSizeOptions = [10, 25, 50, 100],
  columnWidths: externalColumnWidths,
  onColumnWidthChange,
  groupedData,
  collapsedGroups = new Set(),
  onToggleGroupCollapse,
  renderGroupHeader,
  rowWrapper,
  emptyState,
  onOutsideClick,
  selectAllLabel = 'Select all',
  getSelectLabel,
  extraRows,
  stickyHeader = false,
}: DataTableProps<T>) {
  // グループ化モードかどうか
  const isGrouped = !!groupedData && groupedData.length > 0
  // 内部の列幅状態（外部から提供されない場合）
  const [internalColumnWidths, setInternalColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {}
    columns.forEach((col) => {
      widths[col.id] = col.width
    })
    return widths
  })

  const columnWidths = externalColumnWidths ?? internalColumnWidths

  // 列幅取得
  const getColumnWidth = useCallback(
    (columnId: string) => {
      return columnWidths[columnId] ?? columns.find((c) => c.id === columnId)?.width ?? 100
    },
    [columnWidths, columns]
  )

  // 列幅変更
  const handleColumnWidthChange = useCallback(
    (columnId: string, width: number) => {
      const newWidth = Math.max(50, width)
      if (onColumnWidthChange) {
        onColumnWidthChange(columnId, newWidth)
      } else {
        setInternalColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }))
      }
    },
    [onColumnWidthChange]
  )

  // ページネーション適用後のデータ（グループ化時はページネーションなし）
  const paginatedData = useMemo(() => {
    if (isGrouped) return data // グループ化時は全データ表示
    if (!showPagination) return data
    const { currentPage, pageSize } = paginationState
    const startIndex = (currentPage - 1) * pageSize
    return data.slice(startIndex, startIndex + pageSize)
  }, [data, showPagination, paginationState, isGrouped])

  // 現在ページのID一覧
  const currentPageIds = useMemo(() => paginatedData.map(getRowKey), [paginatedData, getRowKey])

  // 選択状態
  const selectedCountInPage = useMemo(
    () => currentPageIds.filter((id) => selectedIds.has(id)).length,
    [currentPageIds, selectedIds]
  )
  const allSelected = selectedCountInPage === currentPageIds.length && currentPageIds.length > 0
  const someSelected = selectedCountInPage > 0 && selectedCountInPage < currentPageIds.length

  // 全選択トグル
  const handleToggleAll = useCallback(() => {
    if (!onSelectionChange) return
    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(currentPageIds))
    }
  }, [allSelected, currentPageIds, onSelectionChange])

  // 個別選択トグル
  const handleToggleSelection = useCallback(
    (id: string) => {
      if (!onSelectionChange) return
      const newSet = new Set(selectedIds)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      onSelectionChange(newSet)
    },
    [selectedIds, onSelectionChange]
  )

  // ソートハンドラー
  const handleSort = useCallback(
    (sortKey: string) => {
      if (!onSortChange || !sortState) return
      if (sortState.field === sortKey) {
        onSortChange({
          field: sortKey,
          direction: sortState.direction === 'asc' ? 'desc' : 'asc',
        })
      } else {
        onSortChange({ field: sortKey, direction: 'asc' })
      }
    },
    [sortState, onSortChange]
  )

  // リサイズハンドラー
  const handleResizeStart = useCallback(
    (columnId: string, startX: number, startWidth: number) => {
      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX
        handleColumnWidthChange(columnId, startWidth + diff)
      }

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [handleColumnWidthChange]
  )

  // 選択列を含む全列
  const allColumns = selectable
    ? [{ id: '__selection__', label: '', width: 48, resizable: false } as const, ...columns]
    : columns

  // 列数（選択列を含む）
  const columnCount = selectable ? columns.length + 1 : columns.length

  // デフォルトのグループヘッダーレンダラー
  const defaultRenderGroupHeader = useCallback(
    (group: GroupedData<T>, colCount: number, isCollapsed: boolean) => (
      <TableRow
        key={`group-${group.groupKey}`}
        className="bg-muted hover:bg-muted cursor-pointer border-y"
        onClick={() => onToggleGroupCollapse?.(group.groupKey)}
      >
        <TableCell colSpan={colCount} className="py-3">
          <div className="flex items-center gap-2">
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
            <span className="font-semibold">{group.groupLabel}</span>
            <Badge variant="secondary" className="ml-1">
              {group.count}
            </Badge>
          </div>
        </TableCell>
      </TableRow>
    ),
    [onToggleGroupCollapse]
  )

  // 行をレンダリングする関数
  const renderRow = useCallback(
    (item: T, index: number) => {
      const key = getRowKey(item)
      const isSelected = selectedIds.has(key)

      const rowContent = (
        <TableRow key={key} className={isSelected ? 'bg-primary/12 hover:bg-primary/16' : ''}>
          {selectable && (
            <td
              style={{ width: '48px', minWidth: '48px', maxWidth: '48px' }}
              className="p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggleSelection(key)}
                aria-label={getSelectLabel?.(item) ?? `Select row ${index + 1}`}
              />
            </td>
          )}
          {columns.map((col) => {
            const width = getColumnWidth(col.id)
            return (
              <td
                key={col.id}
                style={{ width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` }}
                className="p-4"
              >
                {col.render(item, index)}
              </td>
            )
          })}
        </TableRow>
      )

      if (rowWrapper) {
        return rowWrapper({ item, children: rowContent, isSelected })
      }

      return rowContent
    },
    [columns, getColumnWidth, getRowKey, getSelectLabel, handleToggleSelection, rowWrapper, selectable, selectedIds]
  )

  // 空状態（extraRowsがある場合はテーブルを表示）
  if (paginatedData.length === 0 && emptyState && !extraRows) {
    return <>{emptyState}</>
  }

  return (
    <div
      className="flex flex-1 flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget && onOutsideClick) {
          onOutsideClick()
        }
      }}
    >
      <div className="border-border flex flex-1 flex-col overflow-auto rounded-xl border">
        <Table className="w-full">
          <TableHeader className={stickyHeader ? 'bg-muted sticky top-0 z-10' : 'bg-muted'}>
            <TableRow>
              {allColumns.map((column) => {
                const width = column.id === '__selection__' ? 48 : getColumnWidth(column.id)
                const style = {
                  width: `${width}px`,
                  minWidth: `${width}px`,
                  maxWidth: `${width}px`,
                  position: 'relative' as const,
                }

                // 選択列
                if (column.id === '__selection__') {
                  return (
                    <TableHead key={column.id} style={style}>
                      <Checkbox
                        checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                        onCheckedChange={handleToggleAll}
                        aria-label={selectAllLabel}
                      />
                    </TableHead>
                  )
                }

                const col = column as ColumnDef<T>
                const isSorting = sortState?.field === col.sortKey
                const Icon = col.icon

                return (
                  <TableHead key={col.id} style={style}>
                    <div className="flex items-center gap-1">
                      {col.sortKey && onSortChange ? (
                        <button
                          type="button"
                          onClick={() => handleSort(col.sortKey!)}
                          className="hover:bg-foreground/8 -ml-1 flex min-w-0 items-center gap-1 rounded-md px-1 py-0.5 transition-colors"
                        >
                          {Icon && <Icon className="text-muted-foreground size-4 shrink-0" />}
                          <span className="truncate">{col.label}</span>
                          {isSorting ? (
                            sortState?.direction === 'asc' ? (
                              <ArrowUp className="text-foreground size-4 shrink-0" />
                            ) : (
                              <ArrowDown className="text-foreground size-4 shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="text-muted-foreground size-4 shrink-0" />
                          )}
                        </button>
                      ) : (
                        <div className="flex min-w-0 items-center gap-1">
                          {Icon && <Icon className="text-muted-foreground size-4 shrink-0" />}
                          <span className="truncate">{col.label}</span>
                        </div>
                      )}
                    </div>

                    {/* リサイズハンドル */}
                    {col.resizable !== false && (
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleResizeStart(col.id, e.clientX, width)
                        }}
                        className="hover:bg-primary absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent transition-colors"
                        style={{ userSelect: 'none' }}
                      />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isGrouped
              ? // グループ化表示
                groupedData!.map((group) => {
                  const isCollapsed = collapsedGroups.has(group.groupKey)
                  const groupHeader = renderGroupHeader
                    ? renderGroupHeader(group, columnCount, isCollapsed)
                    : defaultRenderGroupHeader(group, columnCount, isCollapsed)

                  return [groupHeader, ...(isCollapsed ? [] : group.items.map((item, index) => renderRow(item, index)))]
                })
              : // 通常表示
                paginatedData.map((item, index) => renderRow(item, index))}
            {!isGrouped && extraRows}
          </TableBody>
        </Table>
      </div>

      {/* ページネーション（グループ化時は非表示） */}
      {showPagination && onPaginationChange && !isGrouped && (
        <TablePagination
          totalItems={data.length}
          currentPage={paginationState.currentPage}
          pageSize={paginationState.pageSize}
          onPageChange={(page) => onPaginationChange({ ...paginationState, currentPage: page })}
          onPageSizeChange={(size) => onPaginationChange({ currentPage: 1, pageSize: size })}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  )
}
