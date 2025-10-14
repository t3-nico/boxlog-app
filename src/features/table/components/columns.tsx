'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { TableTask } from '../types/table.types'
import { DataTableColumnHeader } from './data-table-column-header'

/**
 * ステータスバッジの色マッピング
 */
const statusVariantMap = {
  backlog: 'outline' as const,
  scheduled: 'default' as const,
  in_progress: 'secondary' as const,
  completed: 'default' as const,
  stopped: 'destructive' as const,
}

/**
 * 優先度バッジの色マッピング
 */
const priorityVariantMap = {
  low: 'outline' as const,
  medium: 'default' as const,
  high: 'secondary' as const,
  urgent: 'destructive' as const,
}

/**
 * ステータスラベル
 */
const statusLabelMap = {
  backlog: 'バックログ',
  scheduled: 'スケジュール済み',
  in_progress: '進行中',
  completed: '完了',
  stopped: '停止',
}

/**
 * 優先度ラベル
 */
const priorityLabelMap = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
}

/**
 * タスクテーブルのカラム定義
 */
export const columns: ColumnDef<TableTask>[] = [
  // 選択チェックボックス
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="すべて選択"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="行を選択"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // タスク名（ソート可能）
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title="タスク名" />,
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return (
        <div className="max-w-md">
          <div className="truncate font-medium">{title}</div>
          {row.original.description && (
            <div className="text-muted-foreground truncate text-xs">{row.original.description}</div>
          )}
        </div>
      )
    },
  },

  // ステータス（フィルタ可能）
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ステータス" />,
    cell: ({ row }) => {
      const status = row.getValue('status') as TableTask['status']
      return <Badge variant={statusVariantMap[status]}>{statusLabelMap[status]}</Badge>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    },
  },

  // 優先度（フィルタ可能）
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableColumnHeader column={column} title="優先度" />,
    cell: ({ row }) => {
      const priority = row.getValue('priority') as TableTask['priority']
      return <Badge variant={priorityVariantMap[priority]}>{priorityLabelMap[priority]}</Badge>
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id))
    },
  },

  // 開始予定日時
  {
    accessorKey: 'planned_start',
    header: ({ column }) => <DataTableColumnHeader column={column} title="開始予定" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('planned_start'))
      return <div className="text-sm">{format(date, 'yyyy/MM/dd HH:mm', { locale: ja })}</div>
    },
  },

  // 予定時間
  {
    accessorKey: 'planned_duration',
    header: ({ column }) => <DataTableColumnHeader column={column} title="予定時間" />,
    cell: ({ row }) => {
      const duration = row.getValue('planned_duration') as number
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return (
        <div className="text-sm">
          {hours > 0 && `${hours}時間`}
          {minutes > 0 && `${minutes}分`}
        </div>
      )
    },
  },

  // タグ
  {
    accessorKey: 'tags',
    header: 'タグ',
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[] | undefined
      if (!tags || tags.length === 0) return null
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },

  // アクション
  {
    id: 'actions',
    cell: ({ row }) => {
      const task = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">メニューを開く</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>アクション</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>IDをコピー</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>詳細を表示</DropdownMenuItem>
            <DropdownMenuItem>編集</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">削除</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
