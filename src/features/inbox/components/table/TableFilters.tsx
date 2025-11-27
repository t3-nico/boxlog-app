'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import type { PlanStatus } from '@/features/plans/types/plan'
import { Filter } from 'lucide-react'
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore'

/**
 * ステータス選択肢
 */
const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: 'backlog', label: '準備中' },
  { value: 'ready', label: '配置済み' },
  { value: 'active', label: '作業中' },
  { value: 'wait', label: '待ち' },
  { value: 'done', label: '完了' },
  { value: 'cancel', label: '中止' },
]

/**
 * 期限フィルター選択肢
 */
const DUE_DATE_OPTIONS: Array<{ value: DueDateFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日期限' },
  { value: 'tomorrow', label: '明日期限' },
  { value: 'this_week', label: '今週中' },
  { value: 'next_week', label: '来週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'no_due_date', label: '期限なし' },
]

/**
 * テーブルフィルターコンポーネント
 *
 * Popoverで複数選択対応のフィルターを提供
 * - 期限フィルター（ラジオボタン）
 * - ステータスフィルター（複数選択）
 * - フィルター数のバッジ表示
 * - クリアボタン
 *
 * @note タグフィルターは TagFilterButton で別ボタン化
 *
 * @example
 * ```tsx
 * <TableFilters />
 * ```
 */
export function TableFilters() {
  const { status, dueDate, setStatus, setDueDate } = useInboxFilterStore()

  // フィルター数をカウント（期限は'all'以外の場合のみカウント）
  const filterCount = status.length + (dueDate !== 'all' ? 1 : 0)

  // ステータストグル
  const toggleStatus = (value: PlanStatus) => {
    const newStatus = status.includes(value) ? status.filter((s) => s !== value) : [...status, value]
    setStatus(newStatus as PlanStatus[])
  }

  // クリア（期限とステータスのみ）
  const handleClear = () => {
    setStatus([])
    setDueDate('all')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-input bg-background hover:bg-foreground/8 active:bg-foreground/12 dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border px-2.5 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          <Filter />
          フィルター
          {filterCount > 0 && (
            <Badge variant="secondary" className="ml-2 px-1 text-xs">
              {filterCount}
            </Badge>
          )}
        </button>
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

          {/* 期限フィルター */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">期限</Label>
            <RadioGroup value={dueDate} onValueChange={(value) => setDueDate(value as DueDateFilter)}>
              {DUE_DATE_OPTIONS.map((option) => (
                <div key={option.value} className="hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5">
                  <RadioGroupItem value={option.value} id={`due-date-${option.value}`} />
                  <Label htmlFor={`due-date-${option.value}`} className="flex-1 cursor-pointer text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* ステータスフィルター */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">ステータス</Label>
            <div className="space-y-1">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={status.includes(option.value)}
                    onCheckedChange={() => toggleStatus(option.value)}
                  />
                  <Label htmlFor={`status-${option.value}`} className="flex-1 cursor-pointer text-sm font-normal">
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
