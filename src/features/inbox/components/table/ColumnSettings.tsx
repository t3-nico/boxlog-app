'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Settings2 } from 'lucide-react'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'

/**
 * 列設定コンポーネント
 *
 * 列の表示/非表示を切り替えるUI
 * - Popoverで列の表示/非表示を切り替え
 * - リセットボタン
 * - selection は常に表示（切り替え不可）
 *
 * @example
 * ```tsx
 * <ColumnSettings />
 * ```
 */
export function ColumnSettings() {
  const { columns, toggleColumnVisibility, resetColumns } = useInboxColumnStore()

  // 表示/非表示を切り替え可能な列のみ
  const configurableColumns = columns.filter((col) => col.id !== 'selection')

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2 className="mr-2 size-4" />
          列設定
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px]" align="end">
        <div className="space-y-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">列の表示設定</h4>
            <Button variant="ghost" size="sm" onClick={resetColumns} className="h-auto p-0 text-xs">
              リセット
            </Button>
          </div>

          <Separator />

          {/* 列の表示/非表示切り替え */}
          <div className="space-y-2">
            {configurableColumns.map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`column-${column.id}`}
                  checked={column.visible}
                  onCheckedChange={() => toggleColumnVisibility(column.id)}
                />
                <Label htmlFor={`column-${column.id}`} className="text-sm font-normal">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
