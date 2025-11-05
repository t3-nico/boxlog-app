'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { Filter } from 'lucide-react'
import { useInboxFilterStore } from '../../stores/useInboxFilterStore'

/**
 * ステータス選択肢
 */
const STATUS_OPTIONS: Array<{ value: TicketStatus; label: string }> = [
  { value: 'backlog', label: '準備中' },
  { value: 'ready', label: '配置済み' },
  { value: 'active', label: '作業中' },
  { value: 'wait', label: '待ち' },
  { value: 'done', label: '完了' },
  { value: 'cancel', label: '中止' },
]

/**
 * テーブルフィルターコンポーネント
 *
 * Popoverで複数選択対応のフィルターを提供
 * - ステータスフィルター（複数選択）
 * - フィルター数のバッジ表示
 * - クリアボタン
 *
 * @example
 * ```tsx
 * <TableFilters />
 * ```
 */
export function TableFilters() {
  const { status, setStatus, reset } = useInboxFilterStore()

  // フィルター数をカウント
  const filterCount = status.length

  // ステータストグル
  const toggleStatus = (value: TicketStatus) => {
    const newStatus = status.includes(value) ? status.filter((s) => s !== value) : [...status, value]
    setStatus(newStatus as TicketStatus[])
  }

  // すべてクリア
  const handleClear = () => {
    reset()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="mr-2 size-4" />
          フィルター
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1 text-xs">
              {filterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px]" align="start">
        <div className="space-y-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">フィルター</h4>
            {filterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="h-auto p-0 text-xs">
                クリア
              </Button>
            )}
          </div>

          <Separator />

          {/* ステータスフィルター */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">ステータス</Label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={status.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <Label htmlFor={`status-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
