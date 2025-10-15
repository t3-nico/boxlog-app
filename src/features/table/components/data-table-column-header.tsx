'use client'

import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn('hover:bg-accent -ml-3 h-8', column.getIsSorted() && 'bg-accent/50')}
        onClick={() => {
          const currentSort = column.getIsSorted()
          if (currentSort === false) {
            // ソートなし → 昇順
            column.toggleSorting(false)
          } else if (currentSort === 'asc') {
            // 昇順 → 降順
            column.toggleSorting(true)
          } else {
            // 降順 → ソートなし
            column.clearSorting()
          }
        }}
      >
        <span>{title}</span>
        {column.getIsSorted() === 'desc' ? (
          <ArrowDown className="ml-1 h-4 w-4" />
        ) : column.getIsSorted() === 'asc' ? (
          <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-1 h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
