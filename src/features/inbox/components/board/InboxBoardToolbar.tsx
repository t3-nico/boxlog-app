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
import { useBoardStatusFilterStore } from '@/features/board/stores/useBoardStatusFilterStore'
import { MobileMenuButton } from '@/features/navigation/components/mobile/MobileMenuButton'
import { PlanTagSelectDialogEnhanced } from '@/features/plans/components/shared/PlanTagSelectDialogEnhanced'
import type { PlanStatus } from '@/features/plans/types/plan'
import { Calendar, Plus, Settings2, Tag, X } from 'lucide-react'
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore'

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
 * ステータスラベル
 */
const STATUS_LABELS: Record<PlanStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
}

const STATUS_LIST: PlanStatus[] = ['todo', 'doing', 'done']

/**
 * Inbox Board用ツールバー
 *
 * InboxFilterStoreと連携したフィルター機能を提供
 * - 列設定（ステータス表示/非表示）
 * - 期限フィルター（Select）
 * - タグフィルター（専用ボタン）
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
  const { tags, dueDate, setTags, setDueDate, reset } = useInboxFilterStore()
  const { toggleStatus, isStatusVisible, resetFilters } = useBoardStatusFilterStore()

  // フィルター数をカウント（期限は'all'以外の場合のみカウント）
  const tagFilterCount = tags.length
  const dueDateFilterCount = dueDate !== 'all' ? 1 : 0
  const isFiltered = tagFilterCount > 0 || dueDateFilterCount > 0

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* モバイル: ハンバーガーメニュー */}
      <MobileMenuButton className="md:hidden" />

      <div className="flex flex-1 items-center gap-2">
        {/* 期限フィルター */}
        <Select value={dueDate} onValueChange={(value) => setDueDate(value as DueDateFilter)}>
          <SelectTrigger className="h-9 w-36">
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
        <PlanTagSelectDialogEnhanced
          selectedTagIds={tags}
          onTagsChange={setTags}
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <Button variant="outline" size="default">
            <Tag />
            タグ
            {tagFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1 text-xs">
                {tagFilterCount}
              </Badge>
            )}
          </Button>
        </PlanTagSelectDialogEnhanced>

        {/* フィルターリセット */}
        {isFiltered && (
          <Button variant="ghost" onClick={reset} className="h-9 px-2 lg:px-3">
            リセット
            <X className="ml-2 size-4" />
          </Button>
        )}

        {/* 列設定 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default">
              <Settings2 />
              列設定
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">列の表示設定</h4>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="h-auto p-0 text-xs">
                  リセット
                </Button>
              </div>

              <Separator />

              {/* 列の表示/非表示切り替え */}
              <div className="space-y-1">
                {STATUS_LIST.map((status) => (
                  <div key={status} className="hover:bg-state-hover flex items-center space-x-2 rounded-sm px-2 py-1.5">
                    <Checkbox
                      id={`status-${status}`}
                      checked={isStatusVisible(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                    <Label htmlFor={`status-${status}`} className="flex-1 cursor-pointer text-sm font-normal">
                      {STATUS_LABELS[status]}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
