'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { TicketTagSelectDialogEnhanced } from '@/features/tickets/components/shared/TicketTagSelectDialogEnhanced'
import type { TicketStatus } from '@/features/tickets/types/ticket'
import { Calendar, Filter, Plus, Tag, X } from 'lucide-react'
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore'

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
 * Inbox Board用ツールバー
 *
 * InboxFilterStoreと連携したフィルター機能を提供
 * - 期限フィルター（Select）
 * - タグフィルター（Popover、複数選択）- 専用ボタン
 * - ステータスフィルター（Popover、複数選択）
 * - フィルター数のバッジ表示
 * - リセットボタン
 * - 新規作成ボタン
 *
 * @example
 * ```tsx
 * <InboxBoardToolbar />
 * ```
 */
export function InboxBoardToolbar() {
  const { status, tags, dueDate, setStatus, setTags, setDueDate, reset } = useInboxFilterStore()

  // フィルター数をカウント（期限は'all'以外の場合のみカウント）
  const statusFilterCount = status.length
  const tagFilterCount = tags.length
  const dueDateFilterCount = dueDate !== 'all' ? 1 : 0
  const totalFilterCount = statusFilterCount + tagFilterCount + dueDateFilterCount
  const isFiltered = totalFilterCount > 0

  // ステータストグル
  const toggleStatus = (value: TicketStatus) => {
    const newStatus = status.includes(value) ? status.filter((s) => s !== value) : [...status, value]
    setStatus(newStatus as TicketStatus[])
  }

  return (
    <div className="flex h-10 w-full items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
        {/* 期限フィルター */}
        <Select value={dueDate} onValueChange={(value) => setDueDate(value as DueDateFilter)}>
          <SelectTrigger className="h-9 w-[140px]">
            <Calendar className="mr-2 size-4" />
            <SelectValue placeholder="期限" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>期限</SelectLabel>
              {DUE_DATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* タグフィルター（専用ボタン） */}
        <TicketTagSelectDialogEnhanced
          selectedTagIds={tags}
          onTagsChange={setTags}
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <button
            type="button"
            className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <Tag />
            タグ
            {tagFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 text-xs">
                {tagFilterCount}
              </Badge>
            )}
          </button>
        </TicketTagSelectDialogEnhanced>

        {/* ステータスフィルター */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:ring-[3px] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
            >
              <Filter />
              ステータス
              {statusFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1 text-xs">
                  {statusFilterCount}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px]" align="start">
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">ステータス</h4>
                {statusFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setStatus([])} className="h-auto p-0 text-xs">
                    クリア
                  </Button>
                )}
              </div>

              <Separator />

              {/* ステータス一覧 */}
              <div className="space-y-1">
                {STATUS_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    className="hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5"
                  >
                    <Checkbox
                      id={`board-status-${option.value}`}
                      checked={status.includes(option.value)}
                      onCheckedChange={() => toggleStatus(option.value)}
                    />
                    <Label
                      htmlFor={`board-status-${option.value}`}
                      className="flex-1 cursor-pointer text-sm font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-9 px-2 lg:px-3">
            リセット
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>

      {/* 右側アクション */}
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="h-9">
          <Plus className="mr-2 size-4" />
          新規作成
        </Button>
      </div>
    </div>
  )
}
