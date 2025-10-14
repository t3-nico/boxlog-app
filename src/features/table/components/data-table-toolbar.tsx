'use client'

import type { Table } from '@tanstack/react-table'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onDeleteSelected?: (ids: string[]) => void
}

export function DataTableToolbar<TData>({ table, onDeleteSelected }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {selectedRows.length > 0 && onDeleteSelected && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const ids = selectedRows.map((row) => (row.original as { id: string }).id)
              onDeleteSelected(ids)
              table.resetRowSelection()
            }}
            className="h-8"
          >
            <X className="mr-2 h-4 w-4" />
            {selectedRows.length}件削除
          </Button>
        )}
        <Input
          placeholder="タスクを検索..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="ステータス"
            options={[
              { label: 'バックログ', value: 'backlog' },
              { label: 'スケジュール済み', value: 'scheduled' },
              { label: '進行中', value: 'in_progress' },
              { label: '完了', value: 'completed' },
              { label: '停止', value: 'stopped' },
            ]}
          />
        )}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="優先度"
            options={[
              { label: '低', value: 'low' },
              { label: '中', value: 'medium' },
              { label: '高', value: 'high' },
              { label: '緊急', value: 'urgent' },
            ]}
          />
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            リセット
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
