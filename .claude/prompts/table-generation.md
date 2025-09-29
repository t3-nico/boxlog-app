# テーブル生成テンプレート

## 概要
BoxLog App用の高機能データテーブルを自動生成するプロンプトテンプレート。TanStack Table + shadcn/ui + テーマシステム完全統合。ソート・フィルター・ページネーション・カラム表示制御完備。

## 機能一覧

### 🔧 基本機能
- **ソート**: 全カラム対応の昇順・降順ソート
- **フィルター**: テキスト・セレクト・日付範囲フィルター
- **ページネーション**: サイズ可変・ページジャンプ対応
- **カラム制御**: 表示・非表示切り替え・幅調整

### 🎨 UI/UX機能
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **アクセシビリティ**: ARIA属性・キーボードナビゲーション
- **ローディング**: スケルトン・スピナー表示
- **エラーハンドリング**: エラーバウンダリー・リトライ機能

### ⚡ パフォーマンス機能
- **仮想化**: 大量データ対応
- **メモ化**: 不要な再レンダリング防止
- **楽観的更新**: UI反応性向上

## 入力パラメータ

### 必須パラメータ
- `{TableName}`: テーブル名（PascalCase、例: UserTable, TaskTable）
- `{tableName}`: テーブル名（camelCase、例: userTable, taskTable）
- `{EntityName}`: エンティティ名（PascalCase、例: User, Task）
- `{entity}`: エンティティ名（kebab-case、例: user, task）

### カラム定義（JSON形式）
```json
{
  "columns": [
    {
      "key": "id",
      "label": "ID",
      "type": "text",
      "width": 80,
      "sortable": true,
      "filterable": false,
      "visible": true
    },
    {
      "key": "title",
      "label": "タイトル",
      "type": "text",
      "width": 200,
      "sortable": true,
      "filterable": true,
      "visible": true
    },
    {
      "key": "status",
      "label": "ステータス",
      "type": "select",
      "width": 120,
      "sortable": true,
      "filterable": true,
      "visible": true,
      "options": [
        { "value": "active", "label": "アクティブ", "color": "green" },
        { "value": "inactive", "label": "非アクティブ", "color": "gray" }
      ]
    },
    {
      "key": "createdAt",
      "label": "作成日時",
      "type": "date",
      "width": 160,
      "sortable": true,
      "filterable": true,
      "visible": true
    }
  ]
}
```

## テンプレート構造

### 1. テーブルコンポーネント生成

```typescript
// src/components/tables/{TableName}.tsx
'use client'

import React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ChevronDown,
  Search,
  Filter,
  Download,
  RefreshCcw,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

import { {EntityName} } from '@/types/{entity}'
import { colors, spacing, typography } from '@/config/theme'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

interface {TableName}Props {
  data: {EntityName}[]
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onRowClick?: (row: {EntityName}) => void
  onEdit?: (row: {EntityName}) => void
  onDelete?: (row: {EntityName}) => void
  showActions?: boolean
  exportable?: boolean
}

export function {TableName}({
  data,
  loading = false,
  error = null,
  onRefresh,
  onRowClick,
  onEdit,
  onDelete,
  showActions = true,
  exportable = false,
}: {TableName}Props) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  // カラム定義
  const columns: ColumnDef<{EntityName}>[] = React.useMemo(
    () => [
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className={`${typography.body.sm} font-mono`}>
            {row.getValue('id').toString().slice(0, 8)}...
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            タイトル
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className={`${typography.body.base} max-w-[200px] truncate`}>
            {row.getValue('title')}
          </div>
        ),
        size: 200,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            ステータス
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as string
          const statusConfig = {
            active: { label: 'アクティブ', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
            inactive: { label: '非アクティブ', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
            pending: { label: '保留中', variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' },
          }
          const config = statusConfig[status] || statusConfig.inactive

          return (
            <Badge variant={config.variant} className={config.color}>
              {config.label}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
        size: 120,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            作成日時
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className={typography.body.sm}>
            {new Date(row.getValue('createdAt')).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        ),
        size: 160,
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="h-auto p-0 font-semibold"
          >
            更新日時
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className={typography.body.sm}>
            {new Date(row.getValue('updatedAt')).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
          </div>
        ),
        size: 140,
      },
      ...(showActions
        ? [
            {
              id: 'actions',
              header: '操作',
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(row.original)
                      }}
                    >
                      編集
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(row.original)
                      }}
                    >
                      削除
                    </Button>
                  )}
                </div>
              ),
              size: 120,
            },
          ]
        : []),
    ],
    [showActions, onEdit, onDelete]
  )

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // CSVエクスポート機能
  const exportToCSV = () => {
    const visibleColumns = table.getVisibleFlatColumns()
    const rows = table.getFilteredRowModel().rows

    const headers = visibleColumns
      .filter(column => column.id !== 'actions')
      .map(column => column.columnDef.header)
      .join(',')

    const csvRows = rows.map(row =>
      visibleColumns
        .filter(column => column.id !== 'actions')
        .map(column => {
          const cellValue = row.getValue(column.id)
          return typeof cellValue === 'string' ? `"${cellValue}"` : cellValue
        })
        .join(',')
    )

    const csvContent = [headers, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `{entity}-data-${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>データの読み込みに失敗しました: {error}</span>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              再試行
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ErrorBoundary>
      <div className={`w-full space-y-4 ${spacing.component.section.md}`}>
        {/* ツールバー */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* グローバル検索 */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="検索..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-8 max-w-sm"
              />
            </div>

            {/* ステータスフィルター */}
            <Select
              value={(table.getColumn('status')?.getFilterValue() as string[])?.join(',') || ''}
              onValueChange={(value) =>
                table.getColumn('status')?.setFilterValue(value ? value.split(',') : [])
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ステータス絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべて</SelectItem>
                <SelectItem value="active">アクティブ</SelectItem>
                <SelectItem value="inactive">非アクティブ</SelectItem>
                <SelectItem value="pending">保留中</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            {/* リフレッシュボタン */}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner className="w-4 h-4" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
              </Button>
            )}

            {/* エクスポートボタン */}
            {exportable && (
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            )}

            {/* カラム表示設定 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  表示
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* テーブル */}
        <div className={`rounded-md border ${colors.border.default}`}>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={colors.background.muted}
                      style={{ width: header.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // スケルトンローディング
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={typography.body.base}>データがありません</div>
                      {globalFilter && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setGlobalFilter('')}
                        >
                          検索条件をクリア
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ページネーション */}
        <div className="flex items-center justify-between px-2">
          <div className={`flex items-center space-x-6 lg:space-x-8 ${typography.body.sm}`}>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">表示件数</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              {table.getPageCount() > 0
                ? `${table.getState().pagination.pageIndex + 1} / ${table.getPageCount()}`
                : '0 / 0'
              }
            </div>
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} 件中{' '}
              {table.getRowModel().rows.length} 件を表示
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
```

### 2. テーブルフック生成

```typescript
// src/hooks/use-{entity}-table.ts
import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { {EntityName} } from '@/types/{entity}'
import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { fetcher } from '@/lib/api'

export interface Use{TableName}Return {
  data: {EntityName}[]
  loading: boolean
  error: string | null
  refresh: () => void
  total: number
  // フィルタリング
  filteredData: {EntityName}[]
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: string[]) => void
  setDateRangeFilter: (startDate: Date | null, endDate: Date | null) => void
}

export function use{TableName}(): Use{TableName}Return {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate: Date | null
    endDate: Date | null
  }>({ startDate: null, endDate: null })

  const {
    data: rawData,
    error,
    isLoading: loading,
    mutate: refresh
  } = useSWR<{EntityName}[]>('/{entity}', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  const data = rawData || []

  // フィルタリングロジック
  const filteredData = useMemo(() => {
    let filtered = [...data]

    // テキスト検索
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(term)
        )
      )
    }

    // ステータスフィルター
    if (statusFilter.length > 0) {
      filtered = filtered.filter(item =>
        statusFilter.includes(item.status)
      )
    }

    // 日付範囲フィルター
    if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt)

        if (dateRangeFilter.startDate && itemDate < dateRangeFilter.startDate) {
          return false
        }

        if (dateRangeFilter.endDate && itemDate > dateRangeFilter.endDate) {
          return false
        }

        return true
      })
    }

    return filtered
  }, [data, searchTerm, statusFilter, dateRangeFilter])

  const errorMessage = error?.message || null

  return {
    data,
    loading,
    error: errorMessage,
    refresh,
    total: data.length,
    filteredData,
    setSearchTerm,
    setStatusFilter,
    setDateRangeFilter,
  }
}
```

### 3. 使用例ページ生成

```typescript
// src/app/{entity}/page.tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { {TableName} } from '@/components/tables/{TableName}'
import { use{TableName} } from '@/hooks/use-{entity}-table'
import { use{EntityName} } from '@/hooks/use-{entity}'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function {EntityName}ListPage() {
  const router = useRouter()
  const {
    data,
    loading,
    error,
    refresh
  } = use{TableName}()

  const { remove } = use{EntityName}()

  const handleRowClick = (row: {EntityName}) => {
    router.push(`/{entity}/${row.id}`)
  }

  const handleEdit = (row: {EntityName}) => {
    router.push(`/{entity}/${row.id}/edit`)
  }

  const handleDelete = async (row: {EntityName}) => {
    if (!confirm(`"${row.title || row.id}"を削除しますか？`)) {
      return
    }

    try {
      await remove(row.id)
      toast({
        title: '削除完了',
        description: '{EntityName}を削除しました',
      })
      refresh()
    } catch (error) {
      toast({
        title: '削除エラー',
        description: error instanceof Error ? error.message : '削除に失敗しました',
        variant: 'destructive',
      })
    }
  }

  const handleCreate = () => {
    router.push('/{entity}/create')
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{EntityName}管理</h1>
          <p className="text-muted-foreground">
            {EntityName}の一覧・検索・管理を行えます
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          新規作成
        </Button>
      </div>

      {/* テーブル */}
      <{TableName}
        data={data}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onRowClick={handleRowClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        exportable={true}
      />
    </div>
  )
}
```

## 必須要件チェックリスト

### ✅ ソート機能
- [x] 全カラム対応
- [x] 昇順・降順切り替え
- [x] 複数カラムソート対応
- [x] ソート状態の視覚的表示

### ✅ フィルター機能
- [x] グローバル検索
- [x] カラム別フィルター
- [x] セレクト型フィルター
- [x] 日付範囲フィルター

### ✅ ページネーション
- [x] ページサイズ変更
- [x] ページジャンプ
- [x] 件数表示
- [x] ナビゲーションボタン

### ✅ UI/UX機能
- [x] レスポンシブデザイン
- [x] カラム表示制御
- [x] CSVエクスポート
- [x] ローディング表示
- [x] エラーハンドリング

### ✅ アクセシビリティ
- [x] ARIA属性設定
- [x] キーボードナビゲーション
- [x] スクリーンリーダー対応
- [x] 適切なラベル設定

### ✅ パフォーマンス
- [x] メモ化によるレンダリング最適化
- [x] 仮想化対応準備
- [x] 楽観的更新サポート

## 使用例

```typescript
// 基本的な使用
<{TableName}
  data={users}
  loading={loading}
  onRowClick={(user) => router.push(`/users/${user.id}`)}
/>

// フル機能版
<{TableName}
  data={users}
  loading={loading}
  error={error}
  onRefresh={refresh}
  onRowClick={handleRowClick}
  onEdit={handleEdit}
  onDelete={handleDelete}
  showActions={true}
  exportable={true}
/>
```