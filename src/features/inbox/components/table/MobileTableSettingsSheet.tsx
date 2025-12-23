'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import type { PlanStatus } from '@/features/plans/types/plan'
import { Check, Columns3, Filter, Group, Settings2, SlidersHorizontal, Table2, X } from 'lucide-react'
import { useState } from 'react'
import { useInboxColumnStore } from '../../stores/useInboxColumnStore'
import { type DueDateFilter, useInboxFilterStore } from '../../stores/useInboxFilterStore'
import { useInboxGroupStore } from '../../stores/useInboxGroupStore'
import { useInboxViewStore } from '../../stores/useInboxViewStore'
import type { GroupByField } from '../../types/group'

/**
 * ステータス選択肢
 */
const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
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
 * グループ化オプション
 */
const GROUP_BY_OPTIONS: Array<{ value: GroupByField; label: string }> = [
  { value: null, label: 'なし' },
  { value: 'status', label: 'ステータス' },
  { value: 'due_date', label: '期限' },
  { value: 'tags', label: 'タグ' },
]

/**
 * モバイル用テーブル設定シート
 *
 * Notion風の1つのアイコンから全設定にアクセスできるボトムシート
 * - 表示モード切替（Board/Table）
 * - グループ化設定
 * - フィルター（期限・ステータス）
 * - 列設定
 *
 * @example
 * ```tsx
 * <MobileTableSettingsSheet />
 * ```
 */
export function MobileTableSettingsSheet() {
  const [open, setOpen] = useState(false)

  // 表示モード
  const { displayMode, setDisplayMode } = useInboxViewStore()

  // グループ化
  const { groupBy, setGroupBy } = useInboxGroupStore()

  // フィルター
  const { status, dueDate, setStatus, setDueDate, reset: resetFilters } = useInboxFilterStore()

  // 列設定
  const { columns, toggleColumnVisibility, resetColumns } = useInboxColumnStore()
  const configurableColumns = columns.filter((col) => col.id !== 'selection')

  // フィルター数をカウント
  const filterCount = status.length + (dueDate !== 'all' ? 1 : 0)

  // ステータストグル
  const toggleStatus = (value: PlanStatus) => {
    const newStatus = status.includes(value) ? status.filter((s) => s !== value) : [...status, value]
    setStatus(newStatus as PlanStatus[])
  }

  // 全てリセット
  const handleResetAll = () => {
    resetFilters()
    setGroupBy(null)
    resetColumns()
  }

  // アクティブな設定があるかどうか
  const hasActiveSettings = filterCount > 0 || groupBy !== null

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative shrink-0">
          <SlidersHorizontal className="size-4" />
          {hasActiveSettings && <span className="bg-primary absolute -top-0.5 -right-0.5 size-2 rounded-full" />}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>表示設定</DrawerTitle>
          <div className="flex items-center gap-2">
            {hasActiveSettings && (
              <Button variant="ghost" size="sm" onClick={handleResetAll}>
                すべてリセット
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-8">
          {/* 表示モード */}
          <section className="py-4">
            <div className="mb-3 flex items-center gap-2">
              <Table2 className="text-muted-foreground size-4" />
              <h3 className="text-sm font-medium">表示モード</h3>
            </div>
            <div className="flex gap-2">
              <Button
                variant={displayMode === 'board' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('board')}
                className="flex-1"
              >
                <Columns3 className="mr-2 size-4" />
                Board
              </Button>
              <Button
                variant={displayMode === 'table' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setDisplayMode('table')}
                className="flex-1"
              >
                <Table2 className="mr-2 size-4" />
                Table
              </Button>
            </div>
          </section>

          <Separator />

          {/* グループ化 */}
          <section className="py-4">
            <div className="mb-3 flex items-center gap-2">
              <Group className="text-muted-foreground size-4" />
              <h3 className="text-sm font-medium">グループ化</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {GROUP_BY_OPTIONS.map((option) => (
                <Button
                  key={option.value || 'none'}
                  variant={groupBy === option.value ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setGroupBy(option.value)}
                >
                  {option.label}
                  {groupBy === option.value && <Check className="ml-1 size-3" />}
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          {/* フィルター */}
          <section className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="text-muted-foreground size-4" />
                <h3 className="text-sm font-medium">フィルター</h3>
                {filterCount > 0 && (
                  <Badge variant="secondary" className="px-1.5 text-xs">
                    {filterCount}
                  </Badge>
                )}
              </div>
              {filterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatus([])
                    setDueDate('all')
                  }}
                  className="h-auto p-0 text-xs"
                >
                  クリア
                </Button>
              )}
            </div>

            {/* 期限フィルター */}
            <div className="mb-4">
              <Label className="text-muted-foreground mb-2 block text-xs">期限</Label>
              <RadioGroup value={dueDate} onValueChange={(value) => setDueDate(value as DueDateFilter)}>
                <div className="flex flex-wrap gap-2">
                  {DUE_DATE_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`mobile-due-date-${option.value}`}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        dueDate === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={`mobile-due-date-${option.value}`} className="sr-only" />
                      {option.label}
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* ステータスフィルター */}
            <div>
              <Label className="text-muted-foreground mb-2 block text-xs">ステータス</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`mobile-status-${option.value}`}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      status.includes(option.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      id={`mobile-status-${option.value}`}
                      checked={status.includes(option.value)}
                      onCheckedChange={() => toggleStatus(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                    {status.includes(option.value) && <Check className="size-3" />}
                  </Label>
                ))}
              </div>
            </div>
          </section>

          <Separator />

          {/* 列設定 */}
          <section className="py-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="text-muted-foreground size-4" />
                <h3 className="text-sm font-medium">列の表示</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={resetColumns} className="h-auto p-0 text-xs">
                リセット
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {configurableColumns.map((column) => (
                <Label
                  key={column.id}
                  htmlFor={`mobile-column-${column.id}`}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    column.visible ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted'
                  }`}
                >
                  <Checkbox
                    id={`mobile-column-${column.id}`}
                    checked={column.visible}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                    className="sr-only"
                  />
                  {column.label}
                  {column.visible && <Check className="size-3" />}
                </Label>
              ))}
            </div>
          </section>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
