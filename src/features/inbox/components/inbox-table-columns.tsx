'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MoreHorizontal } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { DataTableColumnHeader } from '@/features/table/components/data-table-column-header'
import type { InboxItem } from '../hooks/useInboxData'

/**
 * アクションハンドラー
 */
interface ActionsHandlers {
  onView?: (item: InboxItem) => void
  onEdit?: (item: InboxItem) => void
  onDelete?: (item: InboxItem) => void
}

/**
 * ステータスバッジの色マッピング
 */
const statusVariantMap: Record<string, 'outline' | 'default' | 'secondary' | 'destructive'> = {
  // Ticket statuses
  open: 'default',
  in_progress: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
  // Session statuses
  planned: 'default',
}

/**
 * ステータスラベル
 */
const statusLabelMap: Record<string, string> = {
  // Ticket statuses
  open: 'オープン',
  in_progress: '進行中',
  completed: '完了',
  cancelled: 'キャンセル',
  // Session statuses
  planned: '予定',
}

/**
 * 優先度バッジの色マッピング
 */
const priorityVariantMap: Record<string, 'outline' | 'default' | 'secondary' | 'destructive'> = {
  low: 'outline',
  normal: 'default',
  high: 'secondary',
  urgent: 'destructive',
}

/**
 * 優先度ラベル
 */
const priorityLabelMap: Record<string, string> = {
  low: '低',
  normal: '通常',
  high: '高',
  urgent: '緊急',
}

/**
 * InboxItemテーブルのカラム定義
 */
export function getInboxTableColumns(handlers?: ActionsHandlers): ColumnDef<InboxItem>[] {
  return [
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
      enableResizing: false,
      size: 50,
      minSize: 50,
      maxSize: 50,
    },

    // タイプ（Ticket or Session）
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title="タイプ" />,
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        const label = type === 'ticket' ? 'チケット' : 'セッション'
        const variant = type === 'ticket' ? 'default' : 'secondary'
        return <Badge variant={variant}>{label}</Badge>
      },
      enableSorting: true,
      enableHiding: true,
      size: 100,
      minSize: 80,
      maxSize: 120,
    },

    // 番号（Ticket Number or Session Number）
    {
      accessorKey: 'ticket_number',
      id: 'number',
      header: ({ column }) => <DataTableColumnHeader column={column} title="番号" />,
      cell: ({ row }) => {
        const item = row.original
        const number = item.type === 'ticket' ? item.ticket_number : item.session_number
        return <div className="font-mono text-sm">#{number || '-'}</div>
      },
      enableSorting: true,
      enableHiding: true,
      size: 100,
      minSize: 80,
      maxSize: 120,
    },

    // タイトル（ソート可能、クリック可能）
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title="タイトル" />,
      cell: ({ row }) => {
        const title = row.getValue('title') as string
        const item = row.original

        return (
          <div
            className="max-w-[500px] cursor-pointer"
            onClick={() => {
              if (handlers?.onView) {
                handlers.onView(item)
              }
            }}
          >
            <div className="truncate font-medium hover:underline">{title}</div>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
      size: 300,
      minSize: 200,
      maxSize: 600,
    },

    // ステータス
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ステータス" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const variant = statusVariantMap[status] || 'default'
        const label = statusLabelMap[status] || status
        return <Badge variant={variant}>{label}</Badge>
      },
      enableSorting: true,
      enableHiding: true,
      size: 120,
      minSize: 100,
      maxSize: 150,
    },

    // 優先度（Ticketのみ）
    {
      accessorKey: 'priority',
      header: ({ column }) => <DataTableColumnHeader column={column} title="優先度" />,
      cell: ({ row }) => {
        const item = row.original
        if (item.type !== 'ticket' || !item.priority) {
          return <span className="text-muted-foreground">-</span>
        }
        const variant = priorityVariantMap[item.priority] || 'default'
        const label = priorityLabelMap[item.priority] || item.priority
        return <Badge variant={variant}>{label}</Badge>
      },
      enableSorting: true,
      enableHiding: true,
      size: 100,
      minSize: 80,
      maxSize: 120,
    },

    // 作成日時
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="作成日時" />,
      cell: ({ row }) => {
        const date = row.getValue('created_at') as string
        return <div className="text-sm">{format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: ja })}</div>
      },
      enableSorting: true,
      enableHiding: true,
      size: 180,
      minSize: 150,
      maxSize: 200,
    },

    // 更新日時
    {
      accessorKey: 'updated_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="更新日時" />,
      cell: ({ row }) => {
        const date = row.getValue('updated_at') as string
        return <div className="text-sm">{format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: ja })}</div>
      },
      enableSorting: true,
      enableHiding: true,
      size: 180,
      minSize: 150,
      maxSize: 200,
    },

    // アクション
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>IDをコピー</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (handlers?.onView) {
                    handlers.onView(item)
                  }
                }}
              >
                詳細を表示
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (handlers?.onEdit) {
                    handlers.onEdit(item)
                  }
                }}
              >
                編集
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
                  >
                    削除
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      {item.type === 'ticket' ? 'チケット' : 'セッション'}「{item.title}」を削除します。
                      <br />
                      この操作は取り消すことができません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (handlers?.onDelete) {
                          handlers.onDelete(item)
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      削除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 80,
      minSize: 80,
      maxSize: 80,
    },
  ]
}
